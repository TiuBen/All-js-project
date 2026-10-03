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
 *          sourceId = 航班 uuid（三张航班表跨表唯一，不必说明来自哪张表）；
 *          sourceTable 仅为向后兼容保留，服务端忽略
 * @access  公开
 */
router.post('/mark', freshAirCargoController.markFresh);

/**
 * @route   DELETE /api/fresh-air-cargo/mark/:sourceId
 * @desc    取消生鲜标记（:sourceId 为航班 uuid；?sourceTable= 已无意义）
 * @access  公开
 */
router.delete('/mark/:sourceId', freshAirCargoController.unmarkFresh);

export { router as freshAirCargoRouter };
