/**
 * ============================================================
 * fresh-air-cargo Service —— 生鲜货物航班标记
 * ------------------------------------------------------------
 * 关联表 fresh_air_cargo：标记 manual_fips 中的航班为生鲜货物
 *   - mark   ：标记（一条航班最多一个标记，upsert）
 *   - unmark ：取消标记
 *   - list   ：生鲜标记列表（LEFT JOIN manual_fips 带出航班信息）
 * 注意：manual_fips 列表查询的 is_fresh 由 manualFipsService 通过
 *       LEFT JOIN 一并返回，前端无需额外请求即可知道哪些是生鲜。
 * ============================================================
 */
import { query } from '../db/pool.js';

/**
 * 标记某条手动航班为生鲜货物（存在则更新 content）
 * @param {number|string} manualFipsId manual_fips 主键
 * @param {Object} [content] 预留的生鲜航班附加内容（JSON）
 * @returns {Promise<Object>} fresh_air_cargo 行
 */
export async function markFresh(manualFipsId, content = {}) {
  const { rows } = await query(
    `INSERT INTO fresh_air_cargo (manual_fips_id, content)
     VALUES ($1, $2)
     ON CONFLICT (manual_fips_id)
     DO UPDATE SET content = EXCLUDED.content
     RETURNING *`,
    [manualFipsId, JSON.stringify(content ?? {})],
  );
  return rows[0];
}

/**
 * 取消某条手动航班的生鲜标记
 * @param {number|string} manualFipsId manual_fips 主键
 * @returns {Promise<boolean>} 是否取消成功
 */
export async function unmarkFresh(manualFipsId) {
  const { rows } = await query(
    'DELETE FROM fresh_air_cargo WHERE manual_fips_id = $1 RETURNING id',
    [manualFipsId],
  );
  return rows.length > 0;
}

/**
 * 生鲜标记列表（带出航班号/机型/停机位/落地时间）
 * @returns {Promise<Array>}
 */
export async function listFresh() {
  const { rows } = await query(`
    SELECT f.id, f.manual_fips_id, f.content, f.created_at,
           m.flight_no, m.aircraft_type, m.stand, m.aldt
    FROM fresh_air_cargo f
    JOIN manual_fips m ON m.id = f.manual_fips_id
    ORDER BY f.id DESC
  `);
  return rows;
}
