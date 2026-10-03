/**
 * ============================================================
 * fresh-air-cargo Service —— 生鲜航班标记
 * ------------------------------------------------------------
 * ★「生鲜标记」已并入 **special_records**（生鲜航班保障节点台账）。
 *   原来那张独立的 fresh_air_cargo 表已废弃删除 ——
 *   它存在的意义本来就是"这条航班要保障生鲜"，而这正是 special_records
 *   记录的事情，再单开一张表属于重复建模。
 *
 * 于是「标记生鲜」= 给这个航班建一条 special_records 台账；
 *     「取消标记」= 删掉该航班对应的台账。
 *   接口路径与请求体形状**保持不变**（/api/fresh-air-cargo/*），前端零改动。
 *
 * 入参 sourceId 是**航班 uuid**（= fips / manual_fips / ecyilang 三张表的 id，
 * 随机 uuid v4 跨表碰撞概率可忽略 → 天然唯一），所以不需要再区分来源表 ——
 * 入参 sourceTable 仅为兼容老调用方保留，实际不参与判断。
 *
 * 标记内容（content）存在台账 nodesTime 的 **freshMark** 子键下，
 * 与台账本身的保障节点（steps 等）互不干扰 —— 结构说明见 db/tableMeta.js 里
 * SPECIAL_FIELDS 的 nodesTime 条目（sheet / boardCount / programStarted /
 * totalMinutes / steps 等子键）。
 * ============================================================
 */
import { query } from '../db/pool.js';
import { SPECIAL_TABLE, SPECIAL_SELECT } from '../db/tableMeta.js';
import * as flightService from './flightService.js';

/**
 * 标记某航班为生鲜货物航班（同一航班重复标记 = 覆盖 freshMark）
 * @param {string} sourceId 航班 uuid
 * @param {Object} [content] 生鲜标记附加内容（JSON），存进 nodesTime.freshMark
 * @param {string} [_sourceTable] 兼容老接口保留，已不参与判断
 * @returns {Promise<Object>} 该航班对应的 special_records 行
 */
export async function markFresh(sourceId, content = {}, _sourceTable) {
  const uuid = String(sourceId || '').trim();
  if (!uuid) {
    const err = new Error('sourceId（航班 uuid）不能为空');
    err.status = 400;
    throw err;
  }

  const flight = await flightService.getFlightByUuid(uuid);
  if (!flight) {
    const err = new Error(
      `找不到 uuid = ${uuid} 对应的航班（fips / manual_fips / ecyilang 都没有）`,
    );
    err.status = 404;
    throw err;
  }
  if (!flight.flight_no || !flight.flight_date) {
    const err = new Error(`航班 ${flight.flight_no || uuid} 缺航班号或日期，无法建立生鲜台账`);
    err.status = 400;
    throw err;
  }

  // 业务键 = (callsign, belongTime)：同一天同一航班只有一条台账，
  // 重复标记只覆盖 freshMark 子键，不动已有的保障节点。
  const { rows } = await query(
    `INSERT INTO ${SPECIAL_TABLE} (callsign, "belongTime", "nodesTime", flight_uuid)
     VALUES ($1, $2, jsonb_build_object('freshMark', $3::jsonb), $4)
     ON CONFLICT (callsign, "belongTime")
     DO UPDATE SET flight_uuid   = EXCLUDED.flight_uuid,
                   "nodesTime"   = ${SPECIAL_TABLE}."nodesTime" || EXCLUDED."nodesTime",
                   "updateTime"  = now()
     RETURNING ${SPECIAL_SELECT}`,
    [flight.flight_no, flight.flight_date, JSON.stringify(content ?? {}), uuid],
  );
  return rows[0];
}

/**
 * 取消某航班的生鲜标记（删掉该航班对应的台账）
 * @param {string} sourceId 航班 uuid
 * @param {string} [_sourceTable] 兼容老接口保留
 * @returns {Promise<boolean>} 是否确实删掉了
 */
export async function unmarkFresh(sourceId, _sourceTable) {
  const uuid = String(sourceId || '').trim();
  if (!uuid) return false;
  const { rowCount } = await query(
    `DELETE FROM ${SPECIAL_TABLE} WHERE flight_uuid = $1`,
    [uuid],
  );
  return rowCount > 0;
}

/**
 * 生鲜标记列表（= 已建台账的航班）
 * 返回结构保持老接口的键名，前端无需改动。
 * @returns {Promise<Array>}
 */
export async function listFresh() {
  const { rows } = await query(`
    SELECT s.id,
           s.callsign                   AS flight_no,
           s."belongTime"::text         AS belong_time,
           s.flight_uuid                AS source_id,
           s."nodesTime" -> 'freshMark' AS content,
           s."createTime"::text         AS created_at
      FROM ${SPECIAL_TABLE} s
     WHERE s.flight_uuid IS NOT NULL
     ORDER BY s."belongTime" DESC, s.callsign
  `);
  return rows;
}
