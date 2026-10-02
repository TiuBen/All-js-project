/**
 * ============================================================
 * fresh-air-cargo 路由 —— URL → Controller 映射
 * ------------------------------------------------------------
 * @route  /api/fresh-air-cargo
 * ============================================================
 */
import { Router } from 'express';
import * as freshAirCargoController from '../controllers/freshAirCargoController.js';

const router = Router();

/**
 * @route   GET /api/fresh-air-cargo
 * @desc    生鲜货物航班列表
 * @access  公开
 */
router.get('/', freshAirCargoController.listFresh);

/**
 * @route   POST /api/fresh-air-cargo/mark
 * @desc    标记某条航班为生鲜（body: sourceId, sourceTable?, content?）
 *          sourceId 是来源表里的行 UUID（如 manual_fips.uuid）
 * @access  公开
 */
router.post('/mark', freshAirCargoController.markFresh);

/**
 * @route   DELETE /api/fresh-air-cargo/mark/:sourceId
 * @desc    取消生鲜标记（?sourceTable= 指定来源表，默认 manual_fips）
 * @access  公开
 */
router.delete('/mark/:sourceId', freshAirCargoController.unmarkFresh);

export { router as freshAirCargoRouter };
