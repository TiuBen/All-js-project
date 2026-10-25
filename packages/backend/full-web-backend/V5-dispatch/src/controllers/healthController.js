/**
 * ============================================================
 * 健康检查
 * ============================================================
 */
import { prisma } from '../db/prisma.js';
import { cnDateTime } from '../utils/date.js';
import { asyncHandler } from '../utils/http.js';

/**
 * GET /api/health
 * @desc 服务存活 + 真的连一次库（Prisma 的 driver adapter 是懒连接，
 *       不探一下就发现不了连不上）
 */
export const healthCheck = asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true, service: 'v5-dispatch', time: cnDateTime(new Date()) });
});
