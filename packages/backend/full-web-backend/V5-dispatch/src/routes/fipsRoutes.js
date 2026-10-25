/**
 * ============================================================
 * fips 路由 —— 航班统一入口（URL → Controller 映射）
 * ------------------------------------------------------------
 * 挂载路径：/api/fips
 *
 * GET 用 ?source= 指定表，取值就是表名（**必填**，缺失 / 非法 → 400）：
 *   fips          历史流量明细
 *   ecyilang      航班计划快照
 *   manual_fips   手动添加的航班
 *
 * POST / PUT / DELETE 固定操作 manual_fips，不带 source。
 * ============================================================
 */
import express from 'express';
import * as fipsController from '../controllers/fipsController.js';

const router = express.Router();

/**
 * @route   GET /api/fips?source=&date=&from=&to=
 * @desc    航班列表（source 必填；date 按该源的航班日期过滤，支持 from/to 区间）
 * @access  公开
 */
router.get('/', fipsController.listFlights);

/**
 * @route   POST /api/fips
 * @desc    新增手动航班（写 manual_fips，必填 flightNo）
 * @access  公开
 */
router.post('/', fipsController.createFlight);

/**
 * @route   GET /api/fips/:id?source=
 * @desc    航班详情（:id = 航班 uuid，source 必填）
 * @access  公开
 */
router.get('/:id', fipsController.getFlight);

/**
 * @route   PUT /api/fips/:id
 * @desc    更新手动航班（局部更新，没传的列不动）
 * @access  公开
 */
router.put('/:id', fipsController.updateFlight);

/**
 * @route   DELETE /api/fips/:id
 * @desc    删除手动航班（同一事务里先清检查单 / 生鲜台账，再删航班）
 * @access  公开
 */
router.delete('/:id', fipsController.deleteFlight);

export { router as fipsRouter };
