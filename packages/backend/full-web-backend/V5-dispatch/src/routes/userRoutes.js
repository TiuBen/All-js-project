/**
 * ============================================================
 * user 路由 —— 值班员花名册（URL → Controller 映射）
 * ------------------------------------------------------------
 * 挂载路径：/api/user，落地表 user（主键整数自增，name 唯一）。
 * 前端暂无本表 CRUD 界面（用户自己写），接口先备齐。
 * ============================================================
 */
import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

/**
 * @route   GET /api/user?name=
 * @desc    花名册列表（name 模糊筛）
 * @access  公开
 */
router.get('/', userController.list);

/**
 * @route   POST /api/user
 * @desc    新增用户 { name, telephone? }；重名 → 409
 * @access  公开
 */
router.post('/', userController.create);

/**
 * @route   GET /api/user/:id
 * @desc    单个用户
 * @access  公开
 */
router.get('/:id', userController.get);

/**
 * @route   PUT /api/user/:id
 * @desc    更新用户（局部更新）
 * @access  公开
 */
router.put('/:id', userController.update);

/**
 * @route   DELETE /api/user/:id
 * @desc    删除用户；被检查单 / 台账 / 登录日志引用 → 409
 * @access  公开
 */
router.delete('/:id', userController.remove);

export { router as userRouter };
