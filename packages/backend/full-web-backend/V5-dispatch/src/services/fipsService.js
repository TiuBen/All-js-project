/**
 * ============================================================
 * fips Service —— 历史航班数据源
 * ------------------------------------------------------------
 * fips 表保存 Excel 原样导入的航班流量明细。时间字段已按用户规则
 * 在导入时解析为本地时间（UTC+8）字符串 "YYYY-MM-DD HH:mm:ss"：
 *   - 文件名 = 年月日基准
 *   - 字段 "02 23:50" 前两位为日号，day > 文件日 → 往前算（上月）
 *   - 时间映射：2024年X月 → 2026年(X+3)月
 *
 * 列表查询规则：
 *   - 传 date：查该天；该天无数据自动回退最近一天
 *   - 传 from/to：范围查询
 *   - 不传：取最近一天
 * ============================================================
 */
import { query } from '../db/pool.js';
import { airportName } from '../utils/airports.js';

/**
 * 获取 fips 表中最近的日期（MAX(mapped_date)）
 * @returns {Promise<string|null>} 形如 '2026-07-30'；表为空返回 null
 */
export async function getLatestDate() {
  const { rows } = await query('SELECT MAX(mapped_date) AS d FROM fips');
  return rows[0]?.d || null;
}

/**
 * 鄂州机场四字码（ZHEC）—— 进港/离港判断基准
 */
export const ZHEC = 'ZHEC';

/**
 * fips 行 → 前端兼容航班对象
 * direction 语义（以鄂州 ZHEC 为基地）：
 *   - 进港：目的地机场是 ZHEC（landing_station === ZHEC）
 *   - 离港：起飞机场是 ZHEC（origin_station === ZHEC）
 * 时间为本地时间字符串（YYYY-MM-DD HH:mm:ss），直接透传
 * @param {Object} r fips 表行
 */
function toFlight(r) {
  const isArrival = r.landing_station === ZHEC;
  const isDeparture = r.origin_station === ZHEC;
  // 兼容 "YYYY-MM-DD HH:mm:ss" → 前端可解析的 ISO（补 T 分隔符，按本地时间解析）
  const norm = (s) => (s ? s.replace(' ', 'T') : null);
  return {
    id: `fips-${r.id}`,
    flightNo: r.flight_no,
    origin: airportName(r.origin_station),
    destination: airportName(r.landing_station),
    departureTimeUtc: norm(r.atot),   // 实际起飞时间（本地）
    landingTimeUtc: norm(r.aldt),     // 实际落地时间（本地）
    flightDate: r.mapped_date,
    status: '到达', // 历史航班均为已完成
    aircraftType: r.aircraft_type,
    flightType: '常规航班',
    category: '货运航班',
    // 已关联检查单：checklist_uuid 存 checklist_records.id（无则 false）
    hasChecklist: !!r.checklist_uuid,
    checklistId: r.checklist_uuid || null,
    /** 进港 / 离港（以鄂州 ZHEC 为基准） */
    direction: isArrival ? '进港' : isDeparture ? '离港' : '中转',
    // 完整时间字段透传（SOBT/EOBT/ATOT/SIBT/ELDT/ALDT，本地时间）
    times: {
      inOut: norm(r.in_out_time),
      sobt: norm(r.sobt),
      eobt: norm(r.eobt),
      atot: norm(r.atot),
      sibt: norm(r.sibt),
      eldt: norm(r.eldt),
      aldt: norm(r.aldt),
    },
    // 原始字段透传（便于前端扩展展示）
    raw: {
      task: r.task,
      originStation: r.origin_station,
      destStation: r.dest_station,
      landingStation: r.landing_station,
      corridor: r.corridor,
      runway: r.runway,
      stand: r.stand,
      sourceFile: r.source_file,
    },
  };
}

/**
 * 查询 fips 航班列表（按日期过滤，无数据自动回退最近天）
 * @param {Object} filter 过滤条件
 * @param {string} [filter.date] 精确日期 YYYY-MM-DD
 * @param {string} [filter.from] 范围起始
 * @param {string} [filter.to]   范围结束
 * @returns {Promise<{date: string|null, items: Array}>} date=实际数据日期
 */
export async function listFlights(filter = {}) {
  const { date, from, to } = filter;
  let rows = [];
  let usedDate = date || null;

  const queryByDate = async (d) => {
    const r = await query('SELECT * FROM fips WHERE mapped_date = $1 ORDER BY id', [d]);
    return r.rows;
  };

  if (date) {
    rows = await queryByDate(date);
    // 该天无数据 → 自动回退最近一天
    if (rows.length === 0) {
      const latest = await getLatestDate();
      if (latest) {
        usedDate = latest;
        rows = await queryByDate(latest);
      }
    }
  } else if (from || to) {
    let sql = 'SELECT * FROM fips WHERE 1=1';
    const params = [];
    if (from) {
      params.push(from);
      sql += ` AND mapped_date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      sql += ` AND mapped_date <= $${params.length}`;
    }
    sql += ' ORDER BY mapped_date, id LIMIT 1000';
    const r = await query(sql, params);
    rows = r.rows;
    usedDate = rows.length ? null : await getLatestDate();
  } else {
    // 无任何条件 → 最近一天
    const latest = await getLatestDate();
    if (latest) {
      usedDate = latest;
      rows = await queryByDate(latest);
    }
  }

  return { date: usedDate, items: rows.map(toFlight) };
}

/**
 * 按 fips 主键查询完整一行（用于详情 Dialog，原始字段）
 * @param {number|string} id fips 主键
 * @returns {Promise<Object|null>} 数据库行；不存在返回 null
 */
export async function getById(id) {
  const num = Number(id);
  if (!Number.isFinite(num)) return null;
  const { rows } = await query('SELECT * FROM fips WHERE id = $1', [num]);
  return rows.length ? rows[0] : null;
}

/**
 * 按 fips 主键查询单个航班
 * @param {string} id 形如 'fips-123'
 * @returns {Promise<Object|null>} 航班对象；不存在返回 null
 */
export async function getFlightById(id) {
  const num = Number(String(id).replace(/^fips-/, ''));
  if (Number.isNaN(num)) return null;
  const { rows } = await query('SELECT * FROM fips WHERE id = $1', [num]);
  if (!rows.length) return null;
  return toFlight(rows[0]);
}
