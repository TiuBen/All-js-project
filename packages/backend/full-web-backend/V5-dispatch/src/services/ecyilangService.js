/**
 * ============================================================
 * ecyilang Service —— 航班计划（抓包快照）
 * ------------------------------------------------------------
 * 两种读法：
 *   1) 原始行读法（listRows / getRow*）：一行为一组「成对航班」（d_/a_ 两侧）
 *   2) 航班计划投影（listFlightPlans / getFlightPlan）：
 *      把一组拆成离港 + 进港两条航班行，字段对齐前端 /fips 航班列表页
 *      （列名沿用 fips 表的 sobt/eobt/atot/sibt/eldt/aldt + *_station）
 *
 * ★ 航班键 = `<行id>-d` / `<行id>-a`（行 id 是随机 uuid v4，跨表唯一）。
 *   投影里 id 与 uuid 给**同一个值**：前端把 uuid 当航班键用
 *   （checklist_records.flight_uuid / special_records.flight_uuid 存的就是它），
 *   而 id 用于 /api/ecyilang/flights/:id 路由参数 —— 两者语义一致就没必要分叉。
 *   后缀区分"这条计划行的哪一侧"：一行同时含离港与进港两条航班。
 *   SQL 侧 base_flight_uuid() 会剥掉后缀再比对
 *   （函数定义见 prisma/migrations/0_init/migration.sql）。
 *
 * 时间换算（★ 唯一需要业务确认的假设，改这里即可全局生效）：
 *   接口只给 HH:mm，且计划时间带跨天后缀 (+1)/(-1)。
 *   本模块以该侧批次日期（d_flight_date / a_flight_date）为基准日，
 *   叠加后缀天数后拼成完整本地时间串 YYYY-MM-DDTHH:mm:00 —— 不做时区转换。
 *   原始字符串始终保留在 raw 里，必要时可回查。
 *
 * 空串与 NULL 的区别见 db/tableMeta.js 的 ECYILANG_FIELDS（取值说明那一列），
 * 本模块原样透传不合并。
 * ============================================================
 */
import { query } from '../db/pool.js';
// TABLE 就是本模块唯一操作的那张表（'ecyilang'）；列清单从 prisma/schema.prisma 解析而来
import { ECYILANG_COLUMNS, ECYILANG_TABLE as TABLE } from '../db/tableMeta.js';
import { localDateStr } from '../utils/time.js';

/** 本场四字码（鄂州花湖 ZHEC）—— 与 fipsService.ZHEC / 前端 BASE_AIRPORT 一致 */
export const BASE_STATION = 'ZHEC';

/** 标准 UUID 形状 —— 行主键就是它，拿它先挡掉非 uuid 的路径参数（否则 PG 会抛类型错） */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 投影航班键形状：'<行id>-d'（离港）/ '<行id>-a'（进港） */
const PLAN_KEY_RE = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-([da])$/i;

/* ============================================================
 * 一、时间解析工具
 * ============================================================ */

/** 取字符串里的 YYYY-MM-DD（取不到返回 null） */
function datePartOf(v) {
  const m = String(v ?? '').match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}

/**
 * 拆解带跨天后缀的时间串
 * @param {string} v 形如 '05:00' / '04:19(+1)' / '23:25(-1)'
 * @returns {{time: string, offsetDays: number}|null} 拆不开返回 null
 */
export function splitTimeOffset(v) {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*\(([+-]\d+)\))?$/);
  if (!m) return null;
  return {
    time: `${m[1].padStart(2, '0')}:${m[2]}`,
    offsetDays: m[3] ? Number(m[3]) : 0,
  };
}

/**
 * 批次日期 + HH:mm(±n) → 'YYYY-MM-DDTHH:mm:00'（本地时间字符串，无时区转换）
 * @param {string|null} baseDate 批次日期（可取 'YYYY-MM-DD...' 前缀）
 * @param {string|null} rawTime  原始时间串
 * @returns {string|null} 拼不出完整时间返回 null
 */
export function combineDateTime(baseDate, rawTime) {
  const t = splitTimeOffset(rawTime);
  const day = datePartOf(baseDate);
  if (!t || !day) return null;
  const d = new Date(`${day}T00:00:00`); // 本地零点，仅做日期加减
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + t.offsetDays);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${t.time}:00`;
}

/* ============================================================
 * 二、原始行读写
 * ============================================================ */

/** 有效批次日期表达式：优先离港侧，缺则取进港侧（两侧皆空时 NULL） */
const SQL_BATCH_DATE = `COALESCE(LEFT(${TABLE}.d_flight_date, 10), LEFT(${TABLE}.a_flight_date, 10))`;

/**
 * 原始行默认排序（ORDER BY 片段）
 * 口径 = 批次日期 → 计划时间 → 航班号，即"当天的航班按时间先后排"。
 * ⚠️ 不能用 id 排：主键已是随机 uuid，排出来是乱的（2026-10-03 主键 UUID 化之前
 *    还能借自增 id 复现 Excel 导入顺序，现在没有这个隐含顺序了）。
 * ⚠️ 也不能用 in_out_time：那是 Excel 里的"进出港时间"，日期部分有脏数据
 *    （sobt 是 2026-08-30 的行，in_out_time 却写着 2026-08-01）。
 */
const ORDER_ROWS = `ORDER BY ${SQL_BATCH_DATE},
      COALESCE(NULLIF(${TABLE}.d_plan_time, ''), NULLIF(${TABLE}.a_plan_time, '')) NULLS LAST,
      ${TABLE}.d_flight_no_full NULLS LAST, ${TABLE}.a_flight_no_full NULLS LAST`;

/**
 * 查询原始行列表（按批次日期过滤）
 * @param {Object} [filter]
 * @param {string} [filter.date] 精确批次日期 YYYY-MM-DD
 * @param {string} [filter.from] 起始批次日期
 * @param {string} [filter.to]   结束批次日期
 * @returns {Promise<Array>} ecyilang 原始行
 */
export async function listRows(filter = {}) {
  const { date, from, to } = filter;
  const params = [];
  let sql = `SELECT * FROM ${TABLE}`;
  const where = [];
  if (date) {
    params.push(date);
    where.push(`${SQL_BATCH_DATE} = $${params.length}`);
  }
  if (from) {
    params.push(from);
    where.push(`${SQL_BATCH_DATE} >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    where.push(`${SQL_BATCH_DATE} <= $${params.length}`);
  }
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ` ${ORDER_ROWS}`;
  const { rows } = await query(sql, params);
  return rows;
}

/**
 * 按主键查原始行
 * @param {string} id 主键（随机 uuid）
 * @returns {Promise<Object|null>}
 */
export async function getRowById(id) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return null;
  const { rows } = await query(`SELECT * FROM ${TABLE} WHERE id = $1`, [key]);
  return rows[0] || null;
}

/** 最晚批次日期（表格为空返回 null） */
export async function getLatestBatchDate() {
  const { rows } = await query(`SELECT MAX(${SQL_BATCH_DATE}) AS d FROM ${TABLE}`);
  return rows[0]?.d || null;
}

/**
 * 新增一条原始行（只接受字段字典内的列，其余忽略）
 * @param {Object} data 键为列名（snake_case）
 * @returns {Promise<Object>} 新插入的行
 */
export async function createRow(data = {}) {
  const cols = [];
  const params = [];
  const ph = [];
  for (const col of ECYILANG_COLUMNS) {
    if (data[col] === undefined) continue;
    const v = data[col];
    // 空串原样保留（state_name 的空串 = 已取消，不能转成 NULL）
    params.push(v === null ? null : String(v));
    cols.push(col);
    ph.push(`$${params.length}`);
  }
  if (cols.length === 0) throw new Error('没有可写入的字段');
  const { rows } = await query(
    `INSERT INTO ${TABLE} (${cols.join(', ')}) VALUES (${ph.join(', ')}) RETURNING *`,
    params,
  );
  return rows[0];
}

/**
 * 更新一条原始行（只更新传入的列；显式传 null 清空该列，传 '' 存空串）
 * @param {string} id 主键（uuid）
 * @param {Object} data 键为列名（snake_case）
 * @returns {Promise<Object|null>} 更新后的行；不存在返回 null
 */
export async function updateRow(id, data = {}) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return null;
  const sets = [];
  const params = [];
  for (const col of ECYILANG_COLUMNS) {
    if (data[col] === undefined) continue;
    params.push(data[col] === null ? null : String(data[col]));
    sets.push(`${col} = $${params.length}`);
  }
  if (sets.length === 0) return getRowById(key);
  params.push(key);
  const { rows } = await query(
    `UPDATE ${TABLE} SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
    params,
  );
  return rows[0] || null;
}

/**
 * 删除一条原始行
 * @param {string} id 主键（uuid）
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteRow(id) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return false;
  const { rowCount } = await query(`DELETE FROM ${TABLE} WHERE id = $1`, [key]);
  return rowCount > 0;
}

/* ============================================================
 * 三、航班计划投影（一组 → 离港 + 进港两条航班行）
 * ============================================================ */

/**
 * 离港侧 → 前端航班行
 * origin 是本场，dest/landing 取 d_name（离港航班的目的地机场）
 * sobt = 计划起飞时间，atot = 预计/实际离港时间
 */
function toDeparturePlan(row) {
  const sobt = combineDateTime(row.d_flight_date, row.d_plan_time);
  const atot = combineDateTime(row.d_flight_date, row.d_time);
  const batchDate = datePartOf(row.d_flight_date) || datePartOf(row.a_flight_date);
  return {
    id: `${row.id}-d`,
    uuid: `${row.id}-d`,
    direction: '离港',
    // ---- 列名对齐 /fips 页的表格列 ----
    task: row.d_flight_type_code,
    flight_no: row.d_flight_no_full,
    origin_station: BASE_STATION,
    dest_station: row.d_name,
    landing_station: row.d_name,
    sobt,           // 计划起飞
    eobt: null,     // 接口无此字段
    atot,           // 离港时间（预计/实际）
    sibt: null,
    eldt: null,
    aldt: null,
    runway: null,   // 接口无跑道字段
    stand: row.d_craft_seat_code,
    aircraft_type: row.d_jx,
    // ---- 扩展字段（页面当前不渲染，留给后续用）----
    status: row.d_state_name,
    country_type: row.d_country_type,
    abnormal_state: row.d_abnormal_state,
    k_h: row.k_h,
    // ---- 页面筛选/键所需 ----
    flightDate: batchDate,
    createdDate: batchDate, // 复用 /fips 页的 filterByDate（按本地日期过滤）
    is_fresh: false,        // 快照数据无生鲜标记
    source: TABLE,
    raw: { ...row, side: 'd' },
  };
}

/**
 * 进港侧 → 前端航班行
 * origin 取 a_name（前方机场），dest/landing 是本场
 * sobt = 前方计划起飞时间（a_plan_time），aldt = 预计/实际到达时间
 */
function toArrivalPlan(row) {
  const sobt = combineDateTime(row.a_flight_date, row.a_plan_time);
  const aldt = combineDateTime(row.a_flight_date, row.a_time);
  const batchDate = datePartOf(row.a_flight_date) || datePartOf(row.d_flight_date);
  return {
    id: `${row.id}-a`,
    uuid: `${row.id}-a`,
    direction: '进港',
    task: row.a_flight_type_code,
    flight_no: row.a_flight_no_full,
    origin_station: row.a_name,
    dest_station: BASE_STATION,
    landing_station: BASE_STATION,
    sobt,           // 前方计划起飞时间
    eobt: null,
    atot: null,
    sibt: null,
    eldt: null,
    aldt,           // 进港时间（预计/实际到达）
    runway: null,
    stand: row.a_craft_seat_code,
    aircraft_type: row.a_jx,
    status: row.a_state_name,
    country_type: row.a_country_type,
    abnormal_state: row.a_abnormal_state,
    k_h: row.k_h,
    flightDate: batchDate,
    createdDate: batchDate,
    is_fresh: false,
    source: TABLE,
    raw: { ...row, side: 'a' },
  };
}

/**
 * 一组原始行 → 航班行数组（只输出该侧确有内容的航班）
 * 判空规则：航班号为空视为该侧无航班（整侧字段通常同时为 null）
 */
function rowToPlans(row) {
  const plans = [];
  if (row.d_flight_no_full) plans.push(toDeparturePlan(row));
  if (row.a_flight_no_full) plans.push(toArrivalPlan(row));
  return plans;
}

/**
 * 查询航班计划（投影后），供前端 /fips 航班列表页使用
 * @param {Object} [filter] 同 listRows（按批次日期过滤）
 * @returns {Promise<{date: string|null, total: number, items: Array}>}
 */
export async function listFlightPlans(filter = {}) {
  const rows = await listRows(filter);
  const items = rows.flatMap(rowToPlans);
  return {
    date: filter.date || (await getLatestBatchDate()) || localDateStr(),
    total: items.length,
    items,
  };
}

/**
 * 按投影键（`<行id>-d` 离港 / `<行id>-a` 进港）查询单条航班计划
 * @param {string} planId 形如 '<uuid>-d'
 * @returns {Promise<Object|null>}
 */
export async function getFlightPlan(planId) {
  const m = String(planId ?? '').trim().match(PLAN_KEY_RE);
  if (!m) return null;
  const row = await getRowById(m[1]);
  if (!row) return null;
  const plan = m[2].toLowerCase() === 'd' ? toDeparturePlan(row) : toArrivalPlan(row);
  return plan.flight_no ? plan : null;
}

/**
 * 按航班键（`<行id>-d` / `<行id>-a`）查询单条航班计划
 * 与 getFlightPlan 是同一个口径（投影里 id 与 uuid 同值），保留两个名字只为
 * 调用方语义自明：路由参数叫 id，前端拿的是 uuid。
 * @param {string} uuid 形如 '<uuid>-d'
 * @returns {Promise<Object|null>}
 */
export async function getFlightPlanByUuid(uuid) {
  return getFlightPlan(uuid);
}
