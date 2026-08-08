/**
 * ============================================================
 * 时间工具
 * ------------------------------------------------------------
 * 本地日期格式化等（注意：中国时区用 toISOString 取日期会差一天，
 * 一律使用本地格式化函数）。
 * ============================================================
 */

/**
 * 取本地日期字符串 YYYY-MM-DD（避免 toISOString 时区偏移）
 * @param {Date} [d] 日期对象，默认当前时间
 * @returns {string} 形如 '2026-08-07'
 */
export function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 时间转 UTC ISO 字符串（无则返回 null）
 * @param {string|Date|null} iso
 * @returns {string|null}
 */
export function toUtcIso(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toISOString();
  } catch {
    return null;
  }
}
