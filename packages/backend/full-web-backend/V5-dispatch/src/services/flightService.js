/**
 * ============================================================
 * 航班 Service —— 业务逻辑层
 * ------------------------------------------------------------
 * 航班列表数据源为 fips 表（Excel 原样导入的历史航班）；
 * flights 表仍保留（检查单 has_checklist 状态、演示数据用）。
 *   listFlights / getFlight / createFlight / updateFlight / deleteFlight
 * ============================================================
 */
import { query } from '../db/pool.js';
import { flightRowToApi } from '../utils/mapper.js';
import { localDateStr } from '../utils/time.js';
import * as fipsService from './fipsService.js';

/**
 * 查询航班列表（数据源：fips 表）
 * @param {Object} filter 过滤条件
 * @param {string} [filter.date]  精确日期（YYYY-MM-DD，该天无数据自动回退最近天）
 * @param {string} [filter.from]  范围起始日期
 * @param {string} [filter.to]    范围结束日期
 * @returns {Promise<{date: string|null, items: Array}>} date=实际数据日期
 */
export async function listFlights(filter = {}) {
  return fipsService.listFlights(filter);
}

/**
 * 查询单个航班详情
 * 优先查 flights 表；若 id 以 fips- 开头（历史航班），则查 fips 表
 * @param {string} id 航班主键（flights 或 fips）
 * @returns {Promise<Object|null>} 航班对象；不存在返回 null
 */
export async function getFlight(id) {
  if (String(id).startsWith('fips-')) {
    return fipsService.getFlightById(id);
  }
  const { rows } = await query('SELECT * FROM flights WHERE id = $1', [id]);
  return rows.length ? flightRowToApi(rows[0]) : null;
}

/**
 * 新增航班
 * @param {Object} data 航班数据（camelCase）
 * @returns {Promise<Object>} 创建的航班
 */
export async function createFlight(data) {
  const id = data.id || `FL${Date.now()}`;
  const { rows } = await query(
    `INSERT INTO flights
      (id, flight_no, origin, destination, departure_time_utc, landing_time_utc,
       flight_date, status, aircraft_type, flight_type, category, has_checklist)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      id,
      data.flightNo || '',
      data.origin || '',
      data.destination || '',
      data.departureTimeUtc || null,
      data.landingTimeUtc || null,
      data.flightDate || localDateStr(),
      data.status || '计划',
      data.aircraftType || '',
      data.flightType || '常规航班',
      data.category || '货运航班',
      data.hasChecklist || false,
    ],
  );
  return flightRowToApi(rows[0]);
}

/**
 * 更新航班（只更新传入的字段，未传字段保持不变）
 * @param {string} id 航班主键
 * @param {Object} data 要更新的字段
 * @returns {Promise<Object|null>} 更新后的航班；不存在返回 null
 */
export async function updateFlight(id, data) {
  const { rows } = await query(
    `UPDATE flights SET
       flight_no = COALESCE($1, flight_no),
       origin = COALESCE($2, origin),
       destination = COALESCE($3, destination),
       departure_time_utc = COALESCE($4, departure_time_utc),
       landing_time_utc = COALESCE($5, landing_time_utc),
       flight_date = COALESCE($6, flight_date),
       status = COALESCE($7, status),
       aircraft_type = COALESCE($8, aircraft_type),
       flight_type = COALESCE($9, flight_type),
       category = COALESCE($10, category),
       has_checklist = COALESCE($11, has_checklist)
     WHERE id = $12
     RETURNING *`,
    [
      data.flightNo ?? null,
      data.origin ?? null,
      data.destination ?? null,
      data.departureTimeUtc ?? null,
      data.landingTimeUtc ?? null,
      data.flightDate ?? null,
      data.status ?? null,
      data.aircraftType ?? null,
      data.flightType ?? null,
      data.category ?? null,
      data.hasChecklist ?? null,
      id,
    ],
  );
  return rows.length ? flightRowToApi(rows[0]) : null;
}

/**
 * 删除航班
 * @param {string} id 航班主键
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteFlight(id) {
  const { rowCount } = await query('DELETE FROM flights WHERE id = $1', [id]);
  return rowCount > 0;
}
