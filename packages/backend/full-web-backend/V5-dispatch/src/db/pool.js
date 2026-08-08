/**
 * ============================================================
 * PostgreSQL 连接池
 * ------------------------------------------------------------
 * 提供统一的 query() 与 getPool()，所有数据访问都经由本模块。
 * 连接配置来自 config/index.js（.env）。
 * ============================================================
 */
import pg from 'pg';
import { config } from '../config/index.js';

let pool = null;

/**
 * 获取全局连接池（懒加载，单例）
 * @returns {pg.Pool}
 */
export function getPool() {
  if (pool) return pool;
  pool = new pg.Pool({
    ...config.pg,
    max: 10,                 // 最大连接数
    idleTimeoutMillis: 30_000, // 空闲连接回收时间
  });
  pool.on('error', (err) => console.error('[PG] pool error', err));
  return pool;
}

/**
 * 执行 SQL（参数化查询，防注入）
 * @param {string} text  SQL 语句（$1, $2 ... 占位符）
 * @param {Array}  params 参数数组
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params) {
  return getPool().query(text, params);
}
