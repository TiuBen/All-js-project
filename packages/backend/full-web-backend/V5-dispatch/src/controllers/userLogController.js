/**
 * ============================================================
 * userLog 控制器 —— 用户登录日志（user_login_log）
 * ============================================================
 */
import * as userLogService from '../services/userLogService.js';
import { asyncHandler } from '../utils/http.js';

/**
 * GET /api/user-log?username=&date=&from=&to=
 * @desc 日志列表（date 口径 = login_time 的北京日；按 id 倒序 = 最近的在前）
 */
export const listRows = asyncHandler(async (req, res) => {
  res.json(await userLogService.list(req.query));
});

/**
 * GET /api/user-log/:id
 * @desc 单条日志（:id = 整数自增主键）
 */
export const getRow = asyncHandler(async (req, res) => {
  res.json(await userLogService.get(req.params.id));
});

/**
 * POST /api/user-log
 * @desc 登录：新增一行（必填 username；login_time 由服务端盖）
 */
export const login = asyncHandler(async (req, res) => {
  res.status(201).json(await userLogService.create(req.body));
});

/**
 * POST /api/user-log/:id/logout
 * @desc 登出：给这一场盖 logout_time（**服务端时间**，不接受客户端传时间）
 */
export const logout = asyncHandler(async (req, res) => {
  res.json(await userLogService.logout(req.params.id));
});

/**
 * DELETE /api/user-log/:id
 * @desc 删除（日志清理用）
 */
export const deleteRow = asyncHandler(async (req, res) => {
  res.json(await userLogService.remove(req.params.id));
});
