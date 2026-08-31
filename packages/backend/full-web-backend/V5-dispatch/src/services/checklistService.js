/**
 * ============================================================
 * 检查单记录 Service —— 业务逻辑层
 * ------------------------------------------------------------
 * 封装 checklist_records 表的全部数据访问：
 *   listRecords / getRecord / createRecord / updateRecord
 * 业务规则：
 *   - 一个航班只能有一个检查单（flight_id 唯一）：createRecord 按 flight_id upsert，
 *     已存在记录 → 更新并返回，绝不新建第二条；
 *   - 已提交且超过 24 小时的记录锁定，禁止再修改（前端 + 后端双重拦截），
 *     锁定基准时间 = updated_at（最后一次修改/提交时间）；
 *   - 创建/更新后把检查单 id 同步写入 fips / manual_fips 的 checklist_uuid 列，
 *     供航班列表展示"已有检查单"并防止新建；删除记录时同步解除关联。
 *   - 表结构：不存 checked_at，时间字段只有 created_at（创建）/ updated_at（修改）。
 * ============================================================
 */
import { query } from '../db/pool.js';

/** 提交后可修改的时限（小时）：超过则锁定 */
export const EDIT_LOCK_HOURS = 24;

/**
 * 24 小时锁定校验：记录已提交且最后修改时间距今超过 EDIT_LOCK_HOURS → 抛 409
 * @param {Object} record 已存在的记录行
 */
function assertEditable(record) {
  if (record?.status !== 'submitted') return;
  const ts = record.updated_at ? new Date(record.updated_at).getTime() : 0;
  if (ts && Date.now() - ts > EDIT_LOCK_HOURS * 3600 * 1000) {
    const err = new Error(`该检查单已提交超过 ${EDIT_LOCK_HOURS} 小时，不可再修改`);
    err.status = 409;
    throw err;
  }
}

/**
 * 把检查单 id 同步到航班来源表（fips / manual_fips 的 checklist_uuid 列）
 * @param {string} flightId 形如 'fips-123' / 'manual-1'
 * @param {string|number} recordId checklist_records.id
 */
async function syncChecklistUuid(flightId, recordId) {
  if (!flightId || !recordId) return;
  const fipsMatch = String(flightId).match(/^fips-(\d+)$/);
  if (fipsMatch) {
    await query('UPDATE fips SET checklist_uuid = $1 WHERE id = $2', [
      String(recordId),
      Number(fipsMatch[1]),
    ]);
    return;
  }
  const manualMatch = String(flightId).match(/^manual-(\d+)$/);
  if (manualMatch) {
    await query('UPDATE manual_fips SET checklist_uuid = $1 WHERE id = $2', [
      String(recordId),
      Number(manualMatch[1]),
    ]);
  }
}

/**
 * 查询检查单填写记录
 * @param {Object} filter 过滤条件
 * @param {string} [filter.flightId]  按航班过滤
 * @param {string} [filter.category]  按检查单分类（货运航班 / 客运航班）过滤
 * @param {string} [filter.date]      精确日期（按"检查日期"，本地东8区）
 * @param {string} [filter.from]      范围起始日期
 * @param {string} [filter.to]        范围结束日期
 * @returns {Promise<Array>} 记录数组
 */
export async function listRecords(filter = {}) {
  const { flightId, category, date, from, to } = filter;
  let sql = 'SELECT * FROM checklist_records WHERE 1=1';
  const params = [];

  if (flightId) {
    params.push(flightId);
    sql += ` AND flight_id = $${params.length}`;
  }
  if (category) {
    params.push(category);
    sql += ` AND checklist_category = $${params.length}`;
  }
  // 按"日期"过滤（COALESCE(updated_at, created_at)，本地东8区取日）：
  // - 与前端日历红/绿数字徽标口径一致（都是按"最后修改/创建日"统计）；
  // - 不再按 flight_date（航班日期）过滤——手动航班 flight_date 可能为 NULL，
  //   且用户语义是"哪天填写的"而非"哪天飞的"。
  // - 时间字段为 TIMESTAMPTZ（UTC 存储）。PG 会话时区是 Asia/Shanghai，
  //   若直接 (ts + interval '8 hours')::date 会双重转换（多算 8h）；必须先用
  //   AT TIME ZONE 'UTC' 取 UTC 无时区表示，再 +8h 取本地日，保证确定性。
  if (date) {
    params.push(date);
    sql += ` AND (COALESCE(updated_at, created_at) AT TIME ZONE 'UTC' + interval '8 hours')::date = $${params.length}`;
  } else {
    if (from) {
      params.push(from);
      sql += ` AND (COALESCE(updated_at, created_at) AT TIME ZONE 'UTC' + interval '8 hours')::date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      sql += ` AND (COALESCE(updated_at, created_at) AT TIME ZONE 'UTC' + interval '8 hours')::date <= $${params.length}`;
    }
  }

  sql += ' ORDER BY COALESCE(updated_at, created_at) DESC LIMIT 500';
  const { rows } = await query(sql, params);
  return rows;
}

/**
 * 查询单个填写记录
 * @param {string|number} id 记录主键
 * @returns {Promise<Object|null>} 记录；不存在返回 null
 */
export async function getRecord(id) {
  const { rows } = await query('SELECT * FROM checklist_records WHERE id = $1', [id]);
  return rows.length ? rows[0] : null;
}

/**
 * 按航班查询其唯一检查单记录
 * @param {string} flightId 航班主键（fips- / manual- 前缀）
 * @returns {Promise<Object|null>} 记录或 null
 */
export async function findRecordByFlightId(flightId) {
  if (!flightId) return null;
  const { rows } = await query('SELECT * FROM checklist_records WHERE flight_id = $1 LIMIT 1', [
    flightId,
  ]);
  return rows[0] || null;
}

/**
 * 创建填写记录（一航班一检查单：flight_id 已存在 → 更新该记录，绝不新建第二条）
 * @param {Object} data 记录数据
 * @returns {Promise<Object>} 创建/更新后的记录
 */
export async function createRecord(data) {
  if (!data.flightId) {
    const err = new Error('flightId is required');
    err.status = 400;
    throw err;
  }
  // 已存在 → 复用（更新），并同样受 24h 锁定约束
  const existing = await findRecordByFlightId(data.flightId);
  if (existing) {
    assertEditable(existing);
    const updated = await updateRecord(existing.id, data);
    return updated;
  }

  const { rows } = await query(
    `INSERT INTO checklist_records
      (flight_id, flight_no, aircraft_type, checklist_category, flight_date,
       header, items, video_supervision, inspector, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      data.flightId,
      data.flightNo || null,
      data.aircraftType || null,
      data.checklistCategory || null,
      data.flightDate || null,
      data.header ? JSON.stringify(data.header) : null,
      data.items ? JSON.stringify(data.items) : null,
      data.videoSupervision ? JSON.stringify(data.videoSupervision) : null,
      data.inspector || null,
      data.status || 'draft',
    ],
  );
  await syncChecklistUuid(data.flightId, rows[0].id);
  return rows[0];
}

/**
 * 更新填写记录（只更新传入的字段）
 * 已提交且最后修改时间超过 24 小时 → 拒绝（409，不可再修改）
 * 说明：checklist_category / flight_no / aircraft_type / flight_date 为可选项，
 *       传入时才更新（COALESCE 保持原值）——这样"切换模板类型后提交"（upsert 复用
 *       本函数）也能把新的检查单分类落库，记录页"检查单"列随之更新。
 * @param {string|number} id 记录主键
 * @param {Object} data 要更新的字段
 * @returns {Promise<Object|null>} 更新后的记录；不存在返回 null
 */
export async function updateRecord(id, data) {
  // 先读当前状态做 24h 锁定校验（已提交 + 超时 → 抛 409）
  const current = await getRecord(id);
  if (!current) return null;
  assertEditable(current);

  const { rows } = await query(
    `UPDATE checklist_records
       SET header = COALESCE($1, header),
           items = COALESCE($2, items),
           video_supervision = COALESCE($3, video_supervision),
           inspector = COALESCE($4, inspector),
           status = COALESCE($5, status),
           checklist_category = COALESCE($6, checklist_category),
           flight_no = COALESCE($7, flight_no),
           aircraft_type = COALESCE($8, aircraft_type),
           flight_date = COALESCE($9, flight_date),
           updated_at = now()
     WHERE id = $10
     RETURNING *`,
    [
      data.header ? JSON.stringify(data.header) : null,
      data.items ? JSON.stringify(data.items) : null,
      data.videoSupervision ? JSON.stringify(data.videoSupervision) : null,
      data.inspector || null,
      data.status || null,
      data.checklistCategory || null,
      data.flightNo || null,
      data.aircraftType || null,
      data.flightDate || null,
      id,
    ],
  );
  if (rows.length) {
    // 同步航班来源表的 checklist_uuid 关联（幂等，覆盖旧数据未关联的情况）
    await syncChecklistUuid(rows[0].flight_id, rows[0].id);
  }
  return rows.length ? rows[0] : null;
}

/**
 * 删除填写记录（同时解除 fips / manual_fips 的 checklist_uuid 关联）
 * @param {string|number} id 记录主键
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteRecord(id) {
  const { rows } = await query(
    'DELETE FROM checklist_records WHERE id = $1 RETURNING id, flight_id',
    [id],
  );
  if (!rows.length) return false;
  // 解除航班来源表的检查单关联（fips / manual_fips.checklist_uuid → NULL），
  // 否则航班列表仍会显示"已有检查单"导致无法重新创建。
  const flightId = rows[0].flight_id;
  const fipsMatch = String(flightId || '').match(/^fips-(\d+)$/);
  if (fipsMatch) {
    await query('UPDATE fips SET checklist_uuid = NULL WHERE id = $1', [Number(fipsMatch[1])]);
  } else {
    const manualMatch = String(flightId || '').match(/^manual-(\d+)$/);
    if (manualMatch) {
      await query('UPDATE manual_fips SET checklist_uuid = NULL WHERE id = $1', [
        Number(manualMatch[1]),
      ]);
    }
  }
  return true;
}
