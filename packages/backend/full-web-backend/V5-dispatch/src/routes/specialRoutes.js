/**
 * ============================================================
 * special 路由 —— 生鲜航班保障节点台账（URL → Controller 映射）
 * ------------------------------------------------------------
 * 挂载路径：/api/special，落地表 records_special（主键是整数自增）
 *
 * 标准的 5 个 CRUD 端点，没有额外的业务子路由：
 *   列表 / 详情 / 新增 / 更新 / 删除
 * ============================================================
 */
import express from 'express';
import * as specialController from '../controllers/specialController.js';

const router = express.Router();

/**
 * @route   GET /api/special?callsign=&flightUuid=&date=&from=&to=
 * @desc    台账列表（date 口径 = createTime 的北京日）
 * @access  公开
 */
router.get('/', specialController.listRows);

/**
 * @route   POST /api/special
 * @desc    新增（永远 INSERT 一条；必填 callsign；可选 nodes / flightUuid）
 * @access  公开
 */
router.post('/', specialController.createRow);

/**
 * @route   GET /api/special/:id
 * @desc    详情
 * @access  公开
 */
router.get('/:id', specialController.getRow);

/**
 * @route   PUT /api/special/:id
 * @desc    更新（局部更新，没传的列不动；nodes 传 null 表示清空）
 * @access  公开
 */
router.put('/:id', specialController.updateRow);

/**
 * @route   DELETE /api/special/:id
 * @desc    删除
 * @access  公开
 */
router.delete('/:id', specialController.deleteRow);

export { router as specialRouter };
