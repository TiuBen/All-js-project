/**
 * ============================================================
 * manual-fips Service —— 手动添加航班
 * ------------------------------------------------------------
 * 保存用户在航班列表页手动添加的航班（字段对齐 fips 表数据项）：
 *   - 列表查询（按时间升序，与 fips 列表同一口径）
 *   - 新增（task / flightNo / 各时间字段等）
 *   - 删除（按主键）
 * 时间字段为用户输入的本地时间（LOC），仅存字符串不做时区转换。
 *
 * ★ 主键 = 随机 uuid v4（`id UUID PRIMARY KEY DEFAULT gen_random_uuid()`）。
 *   原来另有一个独立的 `uuid` 列做身份，2026-10-03 已合并进 id。
 *   但列表**仍然返回一个 uuid 字段**（= id 的别名），因为前端把它当"航班键"
 *   用（checklist_records.flight_uuid / special_records.flight_uuid 存的也是它，
 *   见 store/checklistStore.js）—— 后端补个别名，前端零改动。
 * ============================================================
 */
import { query } from '../db/pool.js';

/** 标准 UUID 形状 —— 主键就是它；路径参数先过这道筛子，否则 PG 会抛类型错（500） */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 手动航班的默认排序（ORDER BY 片段）
 * 口径 = 进港时间 → 计划起飞 → 航班号，即"当天的航班按时间先后排"，
 * 与 fipsService.ORDER_BY_TIME 保持一致（两边的行会出现在同一个列表页里）。
 * ⚠️ 不能用 id 排：主键已是随机 uuid，排出来是乱的
 *    （UUID 化之前是 `ORDER BY m.id DESC`，那其实是"最近添加的在前"，
 *     不是业务顺序，所以没有"原顺序"需要保）。
 */
const ORDER_BY_TIME = `NULLIF(m.aldt, '') NULLS LAST,
         NULLIF(m.sobt, '') NULLS LAST,
         m.flight_no`;

/**
 * 查询全部手动添加航班
 * 附带 is_fresh（是否标记生鲜）与 fresh_content
 *
 * ★ 生鲜标记 = special_records 里有没有挂在这个航班上的台账
 *   （原 fresh_air_cargo 表已废弃删除，生鲜标记并入 special_records ——
 *    见 services/freshAirCargoService.js）。
 *   用 flight_uuid 精确匹配（跨表唯一，且有索引），比原先按
 *   (source_table, source_id) 文本比较更直接。
 *   用 EXISTS 子查询而不是 LEFT JOIN：同一航班可能有多天的台账（多行），
 *   JOIN 会把航班行放大成多行。
 * @returns {Promise<Array>} manual_fips 行数组（snake_case + uuid + is_fresh + fresh_content）
 */
export async function listManualFips() {
  const { rows } = await query(`
    SELECT m.*,
           m.id::text AS uuid,
           EXISTS (
             SELECT 1 FROM special_records s WHERE s.flight_uuid = m.id::text
           ) AS is_fresh,
           (
             SELECT s."nodesTime" -> 'freshMark'
               FROM special_records s
              WHERE s.flight_uuid = m.id::text
              ORDER BY s."belongTime" DESC, s."createTime" DESC
              LIMIT 1
           ) AS fresh_content
    FROM manual_fips m
    ORDER BY ${ORDER_BY_TIME}
  `);
  return rows;
}

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
 *
 * ★ 顺手清掉指向这条航班的 special_records 台账：航班没了，台账的
 *   flight_uuid 就成了指向不存在航班的悬空引用（孤儿）：既关联不到航班，
 *   也没人会再去清它，留着只会让人误以为那个航班还在）。
 *   注意这只影响"这个 uuid 的台账"，别的航班台账不受影响。
 * @param {string} id 主键（uuid）
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteManualFips(id) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return false;
  const { rows } = await query('DELETE FROM manual_fips WHERE id = $1 RETURNING id', [key]);
  if (rows.length === 0) return false;
  // 航班 id 本身就是台账里的 flight_uuid（uuid 列已并入 id）
  const { rowCount } = await query(`DELETE FROM special_records WHERE flight_uuid = $1`, [key]);
  if (rowCount > 0) {
    console.log(`[manual_fips] 删除航班 ${key} 时一并清掉 ${rowCount} 条生鲜台账`);
  }
  return true;
}

/**
 * 更新一条手动航班（只更新传入的字段；显式传 null 表示清空该列）
 * @param {string} id 主键（uuid）
 * @param {Object} data 字段以 FIELD_MAP 中的 camelCase 键传入
 * @returns {Promise<Object|null>} 更新后的行；不存在返回 null
 */
export async function updateManualFips(id, data = {}) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return null;
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
    return getManualFipsById(key);
  }
  params.push(key);
  const { rows } = await query(
    `UPDATE manual_fips SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

/**
 * 按主键查询单条手动航班
 * @param {string} id 主键（uuid）
 * @returns {Promise<Object|null>} 行或 null
 */
export async function getManualFipsById(id) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return null;
  const { rows } = await query('SELECT * FROM manual_fips WHERE id = $1', [key]);
  return rows[0] || null;
}
