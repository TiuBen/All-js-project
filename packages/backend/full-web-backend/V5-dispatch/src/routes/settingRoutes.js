/**
 * ============================================================
 * setting 路由 —— 码表维护（URL → Controller 映射）
 * ------------------------------------------------------------
 * 挂载路径：/api/setting
 *
 * :kind 只有两个合法值（非法的由 service 回 404）：
 *   airlines → airplane_company_name_code  航司码
 *   airports → airport_name_code           机场码
 *
 * 两张表结构不同但走同一套实现，所以路由可以完全对称地写成 /:kind 与
 * /:kind/:id 两段 —— 以后加第三张码表不用动这个文件。
 * ============================================================
 */
import express from 'express';
import * as settingController from '../controllers/settingController.js';

const router = express.Router();

/**
 * @route   GET /api/setting/:kind?q=
 * @desc    码表列表（q 模糊匹配中文名 / 英文名 / IATA / ICAO）
 * @access  公开
 */
router.get('/:kind', settingController.listRows);

/**
 * @route   POST /api/setting/:kind
 * @desc    新增一条码表记录（chineseName 必填）
 * @access  公开
 */
router.post('/:kind', settingController.createRow);

/**
 * @route   GET /api/setting/:kind/:id
 * @desc    单条码表记录（:id 是整数自增主键）
 * @access  公开
 */
router.get('/:kind/:id', settingController.getRow);

/**
 * @route   PUT /api/setting/:kind/:id
 * @desc    更新（局部更新；显式传 null / 空串清空该列，中文名不允许清空）
 * @access  公开
 */
router.put('/:kind/:id', settingController.updateRow);

/**
 * @route   DELETE /api/setting/:kind/:id
 * @desc    删除
 * @access  公开
 */
router.delete('/:kind/:id', settingController.deleteRow);

export { router as settingRouter };
