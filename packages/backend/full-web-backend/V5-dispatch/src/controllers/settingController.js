/**
 * ============================================================
 * setting 控制器 —— 码表维护（:kind = airlines / airports）
 * ------------------------------------------------------------
 * 两张码表是两个独立模块，这里只按 :kind 挑一个交给对应的函数。
 * ============================================================
 */
import * as settingService from '../services/settingService.js';
import { asyncHandler, notFound } from '../utils/http.js';

/** :kind → 码表模块 */
function tableOf(kind) {
  if (kind === 'airlines') return settingService.airlines;
  if (kind === 'airports') return settingService.airports;
  throw notFound(`未知的码表「${kind}」（可选：airlines / airports）`);
}

/**
 * GET /api/setting/:kind?q=
 * @desc 码表列表（q 模糊匹配中文名 / 英文名 / IATA / ICAO）
 */
export const listRows = asyncHandler(async (req, res) => {
  res.json(await tableOf(req.params.kind).list(req.query));
});

/**
 * GET /api/setting/:kind/:id
 * @desc 单条码表记录
 */
export const getRow = asyncHandler(async (req, res) => {
  res.json(await tableOf(req.params.kind).get(req.params.id));
});

/**
 * POST /api/setting/:kind
 * @desc 新增（中文名列必填）
 */
export const createRow = asyncHandler(async (req, res) => {
  res.status(201).json(await tableOf(req.params.kind).create(req.body));
});

/**
 * PUT /api/setting/:kind/:id
 * @desc 更新（局部更新）
 */
export const updateRow = asyncHandler(async (req, res) => {
  res.json(await tableOf(req.params.kind).update(req.params.id, req.body));
});

/**
 * DELETE /api/setting/:kind/:id
 * @desc 删除
 */
export const deleteRow = asyncHandler(async (req, res) => {
  res.json(await tableOf(req.params.kind).remove(req.params.id));
});
