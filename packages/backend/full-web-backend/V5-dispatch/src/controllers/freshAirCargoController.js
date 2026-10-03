/**
 * ============================================================
 * fresh-air-cargo Controller —— HTTP 语义层（不含 SQL）
 * ------------------------------------------------------------
 * GET    /api/fresh-air-cargo          生鲜标记列表（带航班信息）
 * POST   /api/fresh-air-cargo/mark     标记某航班为生鲜
 *                                      body: { sourceId, content? }
 * DELETE /api/fresh-air-cargo/mark/:sourceId  取消生鲜标记
 *
 * ★ sourceId 是**航班 uuid**（= fips / manual_fips / ecyilang 三张表的 id，
 *   随机 uuid v4 跨表碰撞概率可忽略 → 天然唯一），不是自增 id。
 *   以前还需要 sourceTable 说"去哪张表找"，现在 uuid 本身就唯一，已不需要 ——
 *   老调用方仍可传 sourceTable，只是会被忽略（向后兼容）。
 * ★ 落地表已由 fresh_air_cargo 改为 special_records（生鲜航班保障节点台账），
 *   见 services/freshAirCargoService.js。
 * ============================================================
 */
import * as freshAirCargoService from '../services/freshAirCargoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** UUID 正则（含变体：允许大小写与无连字符的 32 位写法） */
const UUID_RE = /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$/;

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
 * @desc 标记某航班为生鲜（同一航班重复标记 = 覆盖，不会写出重复行）
 * @body  { sourceId, sourceTable?, content? }
 * @access 公开
 */
export const markFresh = asyncHandler(async (req, res) => {
  const { sourceId, content } = req.body || {};
  if (sourceId == null || String(sourceId).trim() === '') {
    return res.status(400).json({ error: 'sourceId 不能为空（航班 uuid）' });
  }
  if (!UUID_RE.test(String(sourceId).trim())) {
    return res.status(400).json({ error: `sourceId 必须是 UUID 格式，收到「${sourceId}」` });
  }
  const item = await freshAirCargoService.markFresh(String(sourceId).trim(), content);
  res.status(201).json(item);
});

/**
 * DELETE /api/fresh-air-cargo/mark/:sourceId
 * @desc 取消某航班的生鲜标记
 * @access 公开
 */
export const unmarkFresh = asyncHandler(async (req, res) => {
  const { sourceId } = req.params;
  if (!UUID_RE.test(String(sourceId).trim())) {
    return res.status(400).json({ error: `sourceId 必须是 UUID 格式，收到「${sourceId}」` });
  }
  const ok = await freshAirCargoService.unmarkFresh(String(sourceId).trim());
  if (!ok) return res.status(404).json({ error: '该航班未标记为生鲜' });
  res.json({ ok: true });
});
