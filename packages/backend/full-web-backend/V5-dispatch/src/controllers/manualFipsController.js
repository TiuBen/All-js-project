/**
 * ============================================================
 * manual-fips Controller —— HTTP 语义层（不含 SQL）
 * ------------------------------------------------------------
 * GET    /api/manual-fips      查询全部手动添加航班
 * POST   /api/manual-fips      新增（flightNo / aircraftType / stand / landingTime）
 * DELETE /api/manual-fips/:id  删除
 * ============================================================
 */
import * as manualFipsService from '../services/manualFipsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/manual-fips
 * @desc 查询全部手动添加航班
 * @access 公开
 */
export const listManualFips = asyncHandler(async (req, res) => {
  const items = await manualFipsService.listManualFips();
  res.json({ total: items.length, items });
});

/**
 * POST /api/manual-fips
 * @desc 新增一条手动航班（保存到 manual_fips 表，字段对齐 fips 表数据项）
 * @body  { task, flightNo, originStation, destStation, landingStation,
 *          inOutTime, sobt, eobt, atot, sibt, eldt, aldt,
 *          corridor, runway, stand, aircraftType, landingTime }
 *        时间字段为本地时间（LOC）
 * @access 公开
 */
export const createManualFips = asyncHandler(async (req, res) => {
  const body = req.body || {};
  // 参数校验：航班号必填
  if (!body.flightNo || !String(body.flightNo).trim()) {
    return res.status(400).json({ error: 'flightNo（航班号）不能为空' });
  }
  const item = await manualFipsService.createManualFips(body);
  res.status(201).json(item);
});

/**
 * PUT /api/manual-fips/:id
 * @desc 更新一条手动航班（只更新传入字段；null/空串清空该列）
 * @access 公开
 */
export const updateManualFips = asyncHandler(async (req, res) => {
  const item = await manualFipsService.updateManualFips(req.params.id, req.body || {});
  if (!item) return res.status(404).json({ error: 'manual-fips 记录不存在' });
  res.json(item);
});

/**
 * DELETE /api/manual-fips/:id
 * @desc 删除一条手动航班
 * @access 公开
 */
export const deleteManualFips = asyncHandler(async (req, res) => {
  const ok = await manualFipsService.deleteManualFips(req.params.id);
  if (!ok) return res.status(404).json({ error: 'manual-fips 记录不存在' });
  res.json({ ok: true });
});
