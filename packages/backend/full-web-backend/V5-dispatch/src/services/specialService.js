/**
 * ============================================================
 * special Service —— 生鲜航班保障节点台账（SQL 访问层）
 * ------------------------------------------------------------
 * 业务自然键 = (callsign, "belongTime") —— 一天一个航班一份，
 * 建表时已建唯一索引，所以「新增」走 upsert 语义不会写出重复行。
 *
 * ⚠️ 三处容易踩的坑，本模块统一处理：
 *   1) 列名是驼峰 → SQL 里必须加双引号（"belongTime" / "nodesTime" …）。
 *   2) DATE 列经 SELECT * 会被 node-postgres 解析成 JS Date，JSON 化后按 UTC
 *      输出，+08:00 下整体退一天 → 一律用 SPECIAL_SELECT 显式 ::text 取文本。
 *   3) 更新 / upsert 都要顺手刷新 "updateTime"。
 * ============================================================
 */
import { query } from '../db/pool.js';
import { TABLE, SPECIAL_SELECT } from '../db/specialSchema.js';

/** 日期规整：只接受 YYYY-MM-DD（或带时间的串取其日期部分），非法返回 null */
export function normalizeDate(v) {
  const m = String(v ?? '').match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${m[1]}-${p(m[2])}-${p(m[3])}`;
}

/**
 * 查询台账列表
 * @param {Object} [filter]
 * @param {string} [filter.date]      精确归属日期 YYYY-MM-DD
 * @param {string} [filter.from]      起始日期（含）
 * @param {string} [filter.to]        结束日期（含）
 * @param {string} [filter.callsign]  航班号模糊匹配（不区分大小写）
 * @returns {Promise<Array>} special 行
 */
export async function listRows(filter = {}) {
  const { date, from, to, callsign } = filter;
  const params = [];
  const where = [];
  if (date) {
    params.push(normalizeDate(date) || date);
    where.push(`"belongTime" = $${params.length}`);
  }
  if (from) {
    params.push(normalizeDate(from) || from);
    where.push(`"belongTime" >= $${params.length}`);
  }
  if (to) {
    params.push(normalizeDate(to) || to);
    where.push(`"belongTime" <= $${params.length}`);
  }
  if (callsign) {
    params.push(`%${callsign}%`);
    where.push(`callsign ILIKE $${params.length}`);
  }
  let sql = `SELECT ${SPECIAL_SELECT} FROM ${TABLE}`;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ORDER BY "belongTime", callsign, id`;
  const { rows } = await query(sql, params);
  return rows;
}

/**
 * 按主键查一条
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getRowById(id) {
  const num = Number(id);
  if (!Number.isFinite(num)) return null;
  const { rows } = await query(`SELECT ${SPECIAL_SELECT} FROM ${TABLE} WHERE id = $1`, [num]);
  return rows[0] || null;
}

/**
 * 按业务键 (callsign, belongTime) 查一条
 * @param {string} callsign
 * @param {string} belongTime YYYY-MM-DD
 * @returns {Promise<Object|null>}
 */
export async function getByKey(callsign, belongTime) {
  const day = normalizeDate(belongTime);
  if (!callsign || !day) return null;
  const { rows } = await query(
    `SELECT ${SPECIAL_SELECT} FROM ${TABLE} WHERE callsign = $1 AND "belongTime" = $2`,
    [String(callsign), day],
  );
  return rows[0] || null;
}

/**
 * 每日条数（侧边栏日历徽标 / 数据概览用）
 * @returns {Promise<Array<{date: string, count: number}>>}
 */
export async function listDateCounts() {
  const { rows } = await query(`
    SELECT "belongTime"::text AS date, COUNT(*)::int AS count
    FROM ${TABLE}
    GROUP BY "belongTime"
    ORDER BY "belongTime"
  `);
  return rows;
}

/**
 * 新增一条台账（同 key 已存在时由唯一索引报冲突，交由 controller 转 409）
 * @param {Object} data { callsign, belongTime, nodesTime? }
 * @returns {Promise<Object>}
 */
export async function createRow(data = {}) {
  const { rows } = await query(
    `INSERT INTO ${TABLE} (callsign, "belongTime", "nodesTime")
     VALUES ($1, $2, $3)
     RETURNING ${SPECIAL_SELECT}`,
    [String(data.callsign), normalizeDate(data.belongTime), data.nodesTime ?? {}],
  );
  return rows[0];
}

/**
 * 新增或覆盖（按业务键）—— 前端「把本页填的节点存进台账」走这个
 * 已存在则只覆盖 "nodesTime"（不覆盖 id / "createTime"），并刷新 "updateTime"。
 * @param {Object} data { callsign, belongTime, nodesTime }
 * @returns {Promise<Object>}
 */
export async function upsertByKey(data = {}) {
  const { rows } = await query(
    `INSERT INTO ${TABLE} (callsign, "belongTime", "nodesTime")
     VALUES ($1, $2, $3)
     ON CONFLICT (callsign, "belongTime")
     DO UPDATE SET "nodesTime" = EXCLUDED."nodesTime", "updateTime" = now()
     RETURNING ${SPECIAL_SELECT}`,
    [String(data.callsign), normalizeDate(data.belongTime), data.nodesTime ?? {}],
  );
  return rows[0];
}

/**
 * 更新一条（只更新传入的字段；显式传 null 可清空 nodesTime）
 * 任何更新都会刷新 "updateTime"。
 * @param {number|string} id
 * @param {Object} data { callsign?, belongTime?, nodesTime? }
 * @returns {Promise<Object|null>}
 */
export async function updateRow(id, data = {}) {
  const num = Number(id);
  if (!Number.isFinite(num)) return null;
  const sets = [];
  const params = [];
  if (data.callsign !== undefined) {
    params.push(String(data.callsign));
    sets.push(`callsign = $${params.length}`);
  }
  if (data.belongTime !== undefined) {
    params.push(normalizeDate(data.belongTime));
    sets.push(`"belongTime" = $${params.length}`);
  }
  if (data.nodesTime !== undefined) {
    params.push(data.nodesTime);
    sets.push(`"nodesTime" = $${params.length}`);
  }
  if (sets.length === 0) return getRowById(num);
  sets.push(`"updateTime" = now()`);
  params.push(num);
  const { rows } = await query(
    `UPDATE ${TABLE} SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${SPECIAL_SELECT}`,
    params,
  );
  return rows[0] || null;
}

/**
 * 删除一条
 * @param {number|string} id
 * @returns {Promise<boolean>}
 */
export async function deleteRow(id) {
  const num = Number(id);
  if (!Number.isFinite(num)) return false;
  const { rowCount } = await query(`DELETE FROM ${TABLE} WHERE id = $1`, [num]);
  return rowCount > 0;
}

/** 台账总条数 + 覆盖的日期范围（列表接口的概览字段） */
export async function getOverview() {
  const { rows } = await query(`
    SELECT COUNT(*)::int AS total,
           MIN("belongTime")::text AS "from",
           MAX("belongTime")::text AS "to",
           COUNT(DISTINCT "belongTime")::int AS days
    FROM ${TABLE}
  `);
  return rows[0] || { total: 0, from: null, to: null, days: 0 };
}
