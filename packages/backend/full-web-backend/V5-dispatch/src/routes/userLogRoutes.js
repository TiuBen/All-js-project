/**
 * ============================================================
 * user-log 路由 —— 用户登录日志（URL → Controller 映射）
 * ------------------------------------------------------------
 * 挂载路径：/api/user-log，落地表 user_login_log（主键是整数自增）
 *
 * ★ 没有 PUT / PATCH：这张表的**时间列不让改** ——
 *   login_time 由库里 now() 盖，logout_time 只走 logout 这一个动作
 *   （两个入口都能改时间的话，「谁在岗」就说不清了）。
 * ★ POST /:id/logout 是业务动作，不是「改一列」：
 *   时间取服务端，客户端传什么都不看。
 * ============================================================
 */
import express from 'express';
import * as userLogController from '../controllers/userLogController.js';

const router = express.Router();

/**
 * @route   GET /api/user-log?username=&date=&from=&to=
 * @desc    登录日志列表（date 口径 = login_time 的北京日）
 * @access  公开
 */
router.get('/', userLogController.listRows);

/**
 * @route   POST /api/user-log
 * @desc    登录 —— 新增一行（必填 username；login_time 由服务端盖）
 * @access  公开
 */
router.post('/', userLogController.login);

/**
 * @route   GET /api/user-log/:id
 * @desc    单条日志
 * @access  公开
 */
router.get('/:id', userLogController.getRow);

/**
 * @route   POST /api/user-log/:id/logout
 * @desc    登出 —— 给这一场盖 logout_time（服务端时间）；重复登出 → 409
 * @access  公开
 */
router.post('/:id/logout', userLogController.logout);

/**
 * @route   DELETE /api/user-log/:id
 * @desc    删除单条日志
 * @access  公开
 */
router.delete('/:id', userLogController.deleteRow);

export { router as userLogRouter };
