/**
 * ============================================================
 * manual-fips Service —— 手动添加航班
 * ------------------------------------------------------------
 * 保存用户在航班列表页手动添加的航班（字段对齐 fips 表数据项）：
 *   - 列表查询（按 id 倒序）
 *   - 新增（task / flightNo / 各时间字段等）
 *   - 删除（按主键）
 * 时间字段为用户输入的本地时间（LOC），仅存字符串不做时区转换。
 * ============================================================
 */
import { query } from '../db/pool.js';

/** 可保存的字段映射（camelCase 入参 → snake_case 列名） */
const FIELD_MAP = {
  task: 'task',
  flightNo: 'flight_no',
  originStation: 'origin_station',
  destStation: 'dest_station',
  landingStation: 'landing_station',
  inOutTime: 'in_out_time',
  sobt: 'sobt',
  eobt: 'eobt',
  atot: 'atot',
  sibt: 'sibt',
  eldt: 'eldt',
  aldt: 'aldt',
  corridor: 'corridor',
  runway: 'runway',
  stand: 'stand',
  aircraftType: 'aircraft_type',
  landingTime: 'landing_time',
  checklistCategory: 'checklist_category',
  checklistUuid: 'checklist_uuid',
};

/**
 * 查询全部手动添加航班（最新在前）
 * LEFT JOIN fresh_air_cargo → 附带 is_fresh（是否标记生鲜）与 fresh_content
 * @returns {Promise<Array>} manual_fips 行数组（snake_case + is_fresh + fresh_content）
 */
export async function listManualFips() {
  const { rows } = await query(`
    SELECT m.*,
           CASE WHEN f.id IS NULL THEN false ELSE true END AS is_fresh,
           f.content AS fresh_content
    FROM manual_fips m
    LEFT JOIN fresh_air_cargo f ON f.manual_fips_id = m.id
    ORDER BY m.id DESC
  `);
  return rows;
}

/**
 * 新增一条手动航班
 * @param {Object} data 字段以 FIELD_MAP 中的 camelCase 键传入
 * @returns {Promise<Object>} 新插入的行
 */
export async function createManualFips(data = {}) {
  const cols = [];
  const vals = [];
  const params = [];
  for (const [camel, col] of Object.entries(FIELD_MAP)) {
    const raw = data[camel];
    const v = raw === undefined || raw === null ? null : String(raw).trim() || null;
    if (v !== null) {
      params.push(v);
      cols.push(col);
      vals.push(`$${params.length}`);
    }
  }
  if (!cols.includes('flight_no')) {
    // 兜底：航班号必填（controller 已校验，此处防止误用）
    throw new Error('flightNo（航班号）不能为空');
  }
  const { rows } = await query(
    `INSERT INTO manual_fips (${cols.join(', ')}) VALUES (${vals.join(', ')}) RETURNING *`,
    params,
  );
  return rows[0];
}

/**
 * 按主键删除一条手动航班
 * @param {number|string} id 主键
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteManualFips(id) {
  const { rows } = await query('DELETE FROM manual_fips WHERE id = $1 RETURNING id', [id]);
  return rows.length > 0;
}

/**
 * 更新一条手动航班（只更新传入的字段；显式传 null 表示清空该列）
 * @param {number|string} id 主键
 * @param {Object} data 字段以 FIELD_MAP 中的 camelCase 键传入
 * @returns {Promise<Object|null>} 更新后的行；不存在返回 null
 */
export async function updateManualFips(id, data = {}) {
  const sets = [];
  const params = [];
  let i = 1;
  for (const [camel, col] of Object.entries(FIELD_MAP)) {
    const raw = data[camel];
    // undefined → 不更新该列；null / 空字符串 → 清空为 NULL
    if (raw !== undefined) {
      params.push(raw === null || String(raw).trim() === '' ? null : String(raw).trim());
      sets.push(`${col} = $${i++}`);
    }
  }
  if (sets.length === 0) {
    return getManualFipsById(id);
  }
  params.push(id);
  const { rows } = await query(
    `UPDATE manual_fips SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

/**
 * 按主键查询单条手动航班
 * @param {number|string} id 主键
 * @returns {Promise<Object|null>} 行或 null
 */
export async function getManualFipsById(id) {
  const { rows } = await query('SELECT * FROM manual_fips WHERE id = $1', [id]);
  return rows[0] || null;
}
