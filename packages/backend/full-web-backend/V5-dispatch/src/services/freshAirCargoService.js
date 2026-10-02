/**
 * ============================================================
 * fresh-air-cargo Service —— 生鲜货物航班标记
 * ------------------------------------------------------------
 * 关联表 fresh_air_cargo 已泛化为「跨来源生鲜标记表」：
 *   业务自然键 = (source_table, source_id)
 *     source_table —— 来源表名，默认 'manual_fips'
 *     source_id    —— 该来源表里的**行 UUID**（不再用自增整型 id）
 *
 *   - mark   ：标记（同一来源的同一行最多一个标记，upsert）
 *   - unmark ：取消标记
 *   - list   ：生鲜标记列表（LEFT JOIN manual_fips 带出航班信息）
 *
 * 注意：manual_fips 列表查询的 is_fresh 由 manualFipsService 通过
 *       LEFT JOIN 一并返回，前端无需额外请求即可知道哪些是生鲜。
 * ============================================================
 */
import { query } from '../db/pool.js';

/** 默认来源表（手动添加航班） */
export const DEFAULT_SOURCE_TABLE = 'manual_fips';

/**
 * 标记某个来源的某一行航班为生鲜货物（存在则更新 content）
 * @param {string} sourceId 来源表里的行 UUID（如 manual_fips.uuid）
 * @param {Object} [content] 预留的生鲜航班附加内容（JSON）
 * @param {string} [sourceTable] 来源表名，默认 manual_fips
 * @returns {Promise<Object>} fresh_air_cargo 行
 */
export async function markFresh(
  sourceId,
  content = {},
  sourceTable = DEFAULT_SOURCE_TABLE,
) {
  const { rows } = await query(
    `INSERT INTO fresh_air_cargo (source_table, source_id, content)
     VALUES ($1, $2, $3)
     ON CONFLICT (source_table, source_id)
     DO UPDATE SET content = EXCLUDED.content
     RETURNING *`,
    [sourceTable, sourceId, JSON.stringify(content ?? {})],
  );
  return rows[0];
}

/**
 * 取消某个来源某一行的生鲜标记
 * @param {string} sourceId 来源表里的行 UUID
 * @param {string} [sourceTable] 来源表名，默认 manual_fips
 * @returns {Promise<boolean>} 是否取消成功
 */
export async function unmarkFresh(sourceId, sourceTable = DEFAULT_SOURCE_TABLE) {
  const { rows } = await query(
    `DELETE FROM fresh_air_cargo
      WHERE source_table = $1 AND source_id = $2
      RETURNING id`,
    [sourceTable, sourceId],
  );
  return rows.length > 0;
}

/**
 * 生鲜标记列表（带出航班号/机型/停机位/落地时间）
 *
 * 用 LEFT JOIN 而不是 INNER JOIN：source_table 不是 manual_fips 的行
 * （以后可能挂 ecyilang / fips 等其他来源）也要能列出来，只是航班字段为 null。
 * manual_fips.uuid 是 VARCHAR，source_id 是 UUID，比较时统一按文本比，
 * 避免脏数据在 ::uuid 转换时炸掉整个列表查询。
 *
 * @returns {Promise<Array>}
 */
export async function listFresh() {
  const { rows } = await query(
    `
    SELECT f.id, f.source_table, f.source_id, f.content, f.created_at,
           m.flight_no, m.aircraft_type, m.stand, m.aldt
    FROM fresh_air_cargo f
    LEFT JOIN manual_fips m
           ON f.source_table = $1
          AND m.uuid = f.source_id::text
    ORDER BY f.id DESC
    `,
    [DEFAULT_SOURCE_TABLE],
  );
  return rows;
}
