/**
 * ============================================================
 * 健康检查 Controller
 * ------------------------------------------------------------
 * GET /api/health —— 服务存活 + PG 连接状态探测
 * ============================================================
 */
import { config } from '../config/index.js';
import { query } from '../db/pool.js';

/**
 * GET /api/health
 * 返回服务状态、当前时间、数据库信息
 */
export async function healthCheck(req, res) {
  let pgOk = 'ok';
  try {
    await query('SELECT 1');
  } catch {
    pgOk = 'error';
  }
  res.json({
    status: 'ok',
    service: 'v5-dispatch',
    time: new Date().toISOString(),
    pg: pgOk === 'ok' ? config.pg.database : `${config.pg.database} (连接异常)`,
  });
}
