/**
 * ============================================================
 * fresh-air-cargo Controller —— HTTP 语义层（不含 SQL）
 * ------------------------------------------------------------
 * GET    /api/fresh-air-cargo          生鲜标记列表（带航班信息）
 * POST   /api/fresh-air-cargo/mark     标记某条手动航班为生鲜
 * DELETE /api/fresh-air-cargo/mark/:manualFipsId  取消生鲜标记
 * ============================================================
 */
import * as freshAirCargoService from '../services/freshAirCargoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /api/fresh-air-cargo
 * @desc 生鲜货物航班列表
 * @access 公开
 */
export const listFresh = asyncHandler(async (req, res) => {
  const items = await freshAirCargoService.listFresh();
  res.json({ total: items.length, items });
});

/**
 * POST /api/fresh-air-cargo/mark
 * @desc 标记某条手动航班为生鲜（upsert，一条航班最多一个标记）
 * @body  { manualFipsId, content? }
 * @access 公开
 */
export const markFresh = asyncHandler(async (req, res) => {
  const { manualFipsId, content } = req.body || {};
  if (manualFipsId == null) {
    return res.status(400).json({ error: 'manualFipsId 不能为空' });
  }
  const item = await freshAirCargoService.markFresh(manualFipsId, content);
  res.status(201).json(item);
});

/**
 * DELETE /api/fresh-air-cargo/mark/:manualFipsId
 * @desc 取消某条手动航班的生鲜标记
 * @access 公开
 */
export const unmarkFresh = asyncHandler(async (req, res) => {
  const ok = await freshAirCargoService.unmarkFresh(req.params.manualFipsId);
  if (!ok) return res.status(404).json({ error: '该航班未标记为生鲜' });
  res.json({ ok: true });
});
