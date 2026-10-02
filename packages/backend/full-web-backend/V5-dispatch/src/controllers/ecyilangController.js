/**
 * ============================================================
 * ecyilang Controller —— HTTP 语义层（不含 SQL）
 * ------------------------------------------------------------
 * 航班计划（接口抓包快照），两种读法：
 *
 *   【原始行】一组「成对航班」= 离港 d_* + 进港 a_*
 *     GET    /api/ecyilang            原始行列表（?date= / ?from= / ?to= 按批次日期）
 *     GET    /api/ecyilang/fields     字段字典（列名 → 中文含义 / 取值说明）
 *     GET    /api/ecyilang/:id        原始行详情
 *     POST   /api/ecyilang            新增原始行
 *     PUT    /api/ecyilang/:id        更新原始行（只更新传入列）
 *     DELETE /api/ecyilang/:id        删除原始行
 *
 *   【航班计划投影】把一组拆成离港/进港两条，字段对齐前端航班列表页
 *     GET    /api/ecyilang/flights        航班计划列表（★ pnpm testWW 用这个）
 *     GET    /api/ecyilang/flights/:id    单条（ecy-<行id>-d / ecy-<行id>-a）
 * ============================================================
 */
import * as ecyilangService from '../services/ecyilangService.js';
import { ECYILANG_FIELDS } from '../db/ecyilangSchema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * 从 query 提取日期过滤条件（三者可任意组合）
 * @param {import('express').Request} req
 * @returns {{date?:string, from?:string, to?:string}}
 */
function dateFilterOf(req) {
  const { date, from, to } = req.query || {};
  const clean = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  return { date: clean(date), from: clean(from), to: clean(to) };
}

/**
 * GET /api/ecyilang/flights
 * @desc 航班计划列表（把每组 d_/a_ 拆成离港 + 进港两条航班行）
 * @query date / from / to 批次日期过滤
 * @access 公开
 */
export const listFlightPlans = asyncHandler(async (req, res) => {
  const data = await ecyilangService.listFlightPlans(dateFilterOf(req));
  res.json(data);
});

/**
 * GET /api/ecyilang/flights/:id
 * @desc 单条航班计划（投影 id：ecy-<行id>-d 离港 / ecy-<行id>-a 进港）
 * @access 公开
 */
export const getFlightPlan = asyncHandler(async (req, res) => {
  const item = await ecyilangService.getFlightPlan(req.params.id);
  if (!item) return res.status(404).json({ error: 'ecyilang 航班计划不存在' });
  res.json(item);
});

/**
 * GET /api/ecyilang/fields
 * @desc 字段字典：列名 → 中文含义 / 所属侧 / 取值说明
 * @access 公开
 */
export const getFields = asyncHandler(async (req, res) => {
  res.json({ total: ECYILANG_FIELDS.length, items: ECYILANG_FIELDS });
});

/**
 * GET /api/ecyilang
 * @desc 原始行列表（一行 = 一组成对航班）
 * @access 公开
 */
export const listRows = asyncHandler(async (req, res) => {
  const items = await ecyilangService.listRows(dateFilterOf(req));
  const latest = await ecyilangService.getLatestBatchDate();
  res.json({ total: items.length, date: latest, items });
});

/**
 * GET /api/ecyilang/:id
 * @desc 原始行详情
 * @access 公开
 */
export const getRow = asyncHandler(async (req, res) => {
  const row = await ecyilangService.getRowById(req.params.id);
  if (!row) return res.status(404).json({ error: 'ecyilang 记录不存在' });
  res.json(row);
});

/**
 * POST /api/ecyilang
 * @desc 新增原始行（键为列名 snake_case；未传的列存 NULL，传 '' 存空串）
 * @access 公开
 */
export const createRow = asyncHandler(async (req, res) => {
  const body = req.body || {};
  // 至少要给出某一侧的航班号，否则这行没有任何航班含义
  if (!body.d_flight_no_full && !body.a_flight_no_full) {
    return res.status(400).json({
      error: 'd_flight_no_full（离港航班号）与 a_flight_no_full（进港航班号）至少填写一个',
    });
  }
  const row = await ecyilangService.createRow(body);
  res.status(201).json(row);
});

/**
 * PUT /api/ecyilang/:id
 * @desc 更新原始行（只更新传入的列；显式传 null 清空）
 * @access 公开
 */
export const updateRow = asyncHandler(async (req, res) => {
  const row = await ecyilangService.updateRow(req.params.id, req.body || {});
  if (!row) return res.status(404).json({ error: 'ecyilang 记录不存在' });
  res.json(row);
});

/**
 * DELETE /api/ecyilang/:id
 * @desc 删除原始行
 * @access 公开
 */
export const deleteRow = asyncHandler(async (req, res) => {
  const ok = await ecyilangService.deleteRow(req.params.id);
  if (!ok) return res.status(404).json({ error: 'ecyilang 记录不存在' });
  res.json({ ok: true });
});
