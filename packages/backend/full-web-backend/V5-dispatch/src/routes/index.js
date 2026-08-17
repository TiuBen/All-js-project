/**
 * ============================================================
 * 路由汇总
 * ------------------------------------------------------------
 * 所有子路由在此统一挂载，server.js 只引用本文件。
 * ============================================================
 */
import express from 'express';
import { flightRouter } from './flightRoutes.js';
import { checklistRouter } from './checklistRoutes.js';
import { manualFipsRouter } from './manualFipsRoutes.js';
import { freshAirCargoRouter } from './freshAirCargoRoutes.js';
import { healthCheck } from '../controllers/healthController.js';
import * as fipsService from '../services/fipsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

/** 健康检查 */
router.get('/health', healthCheck);

/** 航班资源 */
router.use('/flights', flightRouter);

/** 检查单资源（模板 + 填写记录） */
router.use('/checklists', checklistRouter);

/** 手动添加航班资源 */
router.use('/manual-fips', manualFipsRouter);

/** 生鲜货物航班资源 */
router.use('/fresh-air-cargo', freshAirCargoRouter);

/**
 * GET /api/fips/:id —— 按主键查询 fips 原始行（用于详情 Dialog）
 * 返回数据库原始字段（snake_case）
 */
router.get(
  '/fips/:id',
  asyncHandler(async (req, res) => {
    const row = await fipsService.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'fips record not found' });
    res.json(row);
  }),
);

export { router as apiRouter };