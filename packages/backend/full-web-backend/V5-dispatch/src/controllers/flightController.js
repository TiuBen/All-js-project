/**
 * ============================================================
 * 航班 Controller —— HTTP 请求处理层
 * ------------------------------------------------------------
 * 职责：解析请求参数 → 调用 flightService → 组装 HTTP 响应。
 * 不包含任何 SQL，只负责 HTTP 语义（状态码 / 错误格式）。
 * ============================================================
 */
import * as flightService from '../services/flightService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/flights?date=YYYY-MM-DD&from=...&to=...
 * 查询航班列表（数据源：fips 表）
 *   - 传 date：精确查该天；该天无数据自动回退最近一天
 *   - 传 from/to：范围查询
 *   - 不传：取最近一天
 */
export const listFlights = asyncHandler(async (req, res) => {
  const { date, from, to } = req.query;
  const data = await flightService.listFlights({ date, from, to });
  res.json({ date: data.date, total: data.items.length, items: data.items });
});

/**
 * GET /api/flights/:id
 * 查询单个航班详情
 */
export const getFlight = asyncHandler(async (req, res) => {
  const flight = await flightService.getFlight(req.params.id);
  if (!flight) {
    return res.status(404).json({ error: 'flight not found' });
  }
  res.json(flight);
});

/**
 * POST /api/flights
 * 新增航班
 */
export const createFlight = asyncHandler(async (req, res) => {
  const flight = await flightService.createFlight(req.body);
  res.status(201).json(flight);
});

/**
 * PUT /api/flights/:id
 * 更新航班（局部更新）
 */
export const updateFlight = asyncHandler(async (req, res) => {
  const flight = await flightService.updateFlight(req.params.id, req.body);
  if (!flight) {
    return res.status(404).json({ error: 'flight not found' });
  }
  res.json(flight);
});

/**
 * DELETE /api/flights/:id
 * 删除航班
 */
export const deleteFlight = asyncHandler(async (req, res) => {
  const ok = await flightService.deleteFlight(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'flight not found' });
  }
  res.json({ ok: true });
});
