/**
 * ============================================================
 * 字段映射工具
 * ------------------------------------------------------------
 * 数据库行（snake_case）↔ API 响应对象（camelCase）互转，
 * 前端不需要感知数据库列名。
 * ============================================================
 */

/**
 * PG flights 行 → API 航班对象（camelCase）
 * @param {Object} row 数据库行
 * @returns {Object|null} 前端兼容字段
 */
export function flightRowToApi(row) {
  if (!row) return null;
  const fmt = (iso) => (iso ? new Date(iso).toISOString() : '');
  return {
    id: row.id,
    flightNo: row.flight_no,
    origin: row.origin,
    destination: row.destination,
    departureTimeUtc: fmt(row.departure_time_utc),
    landingTimeUtc: fmt(row.landing_time_utc),
    flightDate: row.flight_date,
    status: row.status,
    aircraftType: row.aircraft_type,
    flightType: row.flight_type,
    category: row.category,
    hasChecklist: row.has_checklist,
    createdAt: row.created_at,
  };
}

/**
 * PG checklist_records 行 → API 记录对象
 * （JSONB 字段直接透传，时间字段格式化）
 * @param {Object} row 数据库行
 * @returns {Object} 记录对象
 */
export function recordRowToApi(row) {
  if (!row) return null;
  return {
    ...row,
    header: typeof row.header === 'string' ? JSON.parse(row.header) : row.header,
    items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
    videoSupervision:
      typeof row.video_supervision === 'string'
        ? JSON.parse(row.video_supervision)
        : row.video_supervision,
  };
}
