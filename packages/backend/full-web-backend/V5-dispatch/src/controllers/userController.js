/**
 * ============================================================
 * user 控制器 —— 值班员花名册（user 表）
 * ============================================================
 */
import * as userService from '../services/userService.js';
import { asyncHandler } from '../utils/http.js';

/**
 * GET /api/user?name=
 * @desc 花名册列表（name 模糊筛；按 id 升序 = 与前端 mock 花名册同序）
 */
export const list = asyncHandler(async (req, res) => {
    res.json(await userService.list(req.query));
});

/**
 * GET /api/user/:id
 * @desc 单个用户
 */
export const get = asyncHandler(async (req, res) => {
    res.json(await userService.get(req.params.id));
});

/**
 * POST /api/user
 * @desc 新增 { name, telephone? }；重名 → 409
 */
export const create = asyncHandler(async (req, res) => {
    res.status(201).json(await userService.create(req.body));
});

/**
 * PUT /api/user/:id
 * @desc 更新（局部更新）
 */
export const update = asyncHandler(async (req, res) => {
    res.json(await userService.update(req.params.id, req.body));
});

/**
 * DELETE /api/user/:id
 * @desc 删除；被检查单 / 台账 / 登录日志引用 → 409
 */
export const remove = asyncHandler(async (req, res) => {
    res.json(await userService.remove(req.params.id));
});
