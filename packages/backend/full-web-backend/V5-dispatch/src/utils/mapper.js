/**
 * ============================================================
 * 字段映射工具
 * ------------------------------------------------------------
 * 数据库行（snake_case）↔ API 响应对象（camelCase）互转，
 * 前端不需要感知数据库列名。
 *
 * 注：原来的 flightRowToApi（映射 flights 表行）已随 flights 表一起删除 ——
 *     航班行的映射现在由 fipsService.rowToFlight 负责（数据源统一到 fips）。
 * ============================================================
 */

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
