/**
 * ============================================================
 * special 控制器 —— 生鲜航班保障节点台账（records_special）
 * ============================================================
 */
import * as specialService from '../services/specialService.js';
import { asyncHandler } from '../utils/http.js';

/**
 * GET /api/special?callsign=&flightUuid=&date=&from=&to=
 * @desc 台账列表（date 口径 = createTime 的北京日）
 */
export const listRows = asyncHandler(async (req, res) => {
  res.json(await specialService.list(req.query));
});

/**
 * GET /api/special/:id
 * @desc 单条台账（:id = 整数自增主键）
 */
export const getRow = asyncHandler(async (req, res) => {
  res.json(await specialService.get(req.params.id));
});

/**
 * POST /api/special
 * @desc 新增（永远 INSERT 一条；必填 callsign）
 */
export const createRow = asyncHandler(async (req, res) => {
  res.status(201).json(await specialService.create(req.body));
});

/**
 * PUT /api/special/:id
 * @desc 更新（局部更新）
 */
export const updateRow = asyncHandler(async (req, res) => {
  res.json(await specialService.update(req.params.id, req.body));
});

/**
 * DELETE /api/special/:id
 * @desc 删除
 */
export const deleteRow = asyncHandler(async (req, res) => {
  res.json(await specialService.remove(req.params.id));
});
