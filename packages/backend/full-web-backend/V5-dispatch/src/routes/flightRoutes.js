/**
 * ============================================================
 * 航班路由
 * ------------------------------------------------------------
 * 挂载路径：/api/flights（由 routes/index.js 统一挂载）
 * 路由只做 URL → Controller 的映射，不包含业务逻辑。
 * ============================================================
 */
import express from 'express';
import * as flightController from '../controllers/flightController.js';

const router = express.Router();

/**
 * @route   GET /api/flights
 * @desc    查询航班列表（数据源 fips 表，支持 ?date= / ?from= / ?to=）
 * @access  公开
 */
router.get('/', flightController.listFlights);

/**
 * @route   GET /api/flights/:id
 * @desc    查询单个航班详情（支持 fips- 前缀 id）
 * @access  公开
 */
router.get('/:id', flightController.getFlight);

/**
 * @route   POST /api/flights
 * @desc    新增航班
 * @access  公开
 */
router.post('/', flightController.createFlight);

/**
 * @route   PUT /api/flights/:id
 * @desc    更新航班（局部更新）
 * @access  公开
 */
router.put('/:id', flightController.updateFlight);

/**
 * @route   DELETE /api/flights/:id
 * @desc    删除航班
 * @access  公开
 */
router.delete('/:id', flightController.deleteFlight);

export { router as flightRouter };
