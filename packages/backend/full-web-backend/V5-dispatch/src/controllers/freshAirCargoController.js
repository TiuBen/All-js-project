/**
 * ============================================================
 * fresh-air-cargo Controller —— HTTP 语义层（不含 SQL）
 * ------------------------------------------------------------
 * GET    /api/fresh-air-cargo          生鲜标记列表（带航班信息）
 * POST   /api/fresh-air-cargo/mark     标记某条航班为生鲜
 *                                      body: { sourceId, sourceTable?, content? }
 * DELETE /api/fresh-air-cargo/mark/:sourceId  取消生鲜标记
 *                                      query: ?sourceTable=manual_fips
 *
 * ★ sourceId 是**来源表里的行 UUID**（如 manual_fips.uuid），不是自增整型 id；
 *   sourceTable 省略时按 manual_fips 处理。
 * ============================================================
 */
import * as freshAirCargoService from '../services/freshAirCargoService.js';
import { DEFAULT_SOURCE_TABLE } from '../services/freshAirCargoService.js';
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
 * @desc 标记某条航班为生鲜（upsert，同一来源的同一行最多一个标记）
 * @body  { sourceId, sourceTable?, content? }
 * @access 公开
 */
export const markFresh = asyncHandler(async (req, res) => {
  const { sourceId, sourceTable, content } = req.body || {};
  if (sourceId == null || String(sourceId).trim() === '') {
    return res.status(400).json({ error: 'sourceId 不能为空（来源表里的行 UUID）' });
  }
  if (!UUID_RE.test(String(sourceId).trim())) {
    return res.status(400).json({ error: `sourceId 必须是 UUID 格式，收到「${sourceId}」` });
  }
  const item = await freshAirCargoService.markFresh(
    String(sourceId).trim(),
    content,
    sourceTable || DEFAULT_SOURCE_TABLE,
  );
  res.status(201).json(item);
});

/**
 * DELETE /api/fresh-air-cargo/mark/:sourceId
 * @desc 取消某条航班的生鲜标记（?sourceTable= 指定来源表，默认 manual_fips）
 * @access 公开
 */
export const unmarkFresh = asyncHandler(async (req, res) => {
  const { sourceId } = req.params;
  const sourceTable = req.query.sourceTable || DEFAULT_SOURCE_TABLE;
  if (!UUID_RE.test(String(sourceId).trim())) {
    return res.status(400).json({ error: `sourceId 必须是 UUID 格式，收到「${sourceId}」` });
  }
  const ok = await freshAirCargoService.unmarkFresh(String(sourceId).trim(), sourceTable);
  if (!ok) return res.status(404).json({ error: '该航班未标记为生鲜' });
  res.json({ ok: true });
});
