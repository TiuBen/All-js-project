/**
 * ============================================================
 * manual-fips 路由 —— URL → Controller 映射
 * ------------------------------------------------------------
 * @route  /api/manual-fips
 * ============================================================
 */
import { Router } from 'express';
import * as manualFipsController from '../controllers/manualFipsController.js';

const router = Router();

/**
 * @route   GET /api/manual-fips
 * @desc    查询全部手动添加航班
 * @access  公开
 */
router.get('/', manualFipsController.listManualFips);

/**
 * @route   POST /api/manual-fips
 * @desc    新增手动航班（flightNo / aircraftType / stand / landingTime）
 * @access  公开
 */
router.post('/', manualFipsController.createManualFips);

/**
 * @route   DELETE /api/manual-fips/:id
 * @desc    删除手动航班
 * @access  公开
 */
router.delete('/:id', manualFipsController.deleteManualFips);

/**
 * @route   PUT /api/manual-fips/:id
 * @desc    更新手动航班（只更新传入字段）
 * @access  公开
 */
router.put('/:id', manualFipsController.updateManualFips);

export { router as manualFipsRouter };
