/**
 * ============================================================
 * special Controller —— HTTP 语义层（不含 SQL）
 * ------------------------------------------------------------
 * 生鲜航班保障节点台账（一天一个航班一份，业务键 = 航班号 + 归属日期）
 *
 *   GET    /api/special?date=&from=&to=&callsign=  台账列表
 *   GET    /api/special/fields                     字段字典
 *   GET    /api/special/dates                      每日条数（日历徽标）
 *   GET    /api/special/key/:callsign/:belongTime  按业务键取一条
 *   POST   /api/special/upsert                     按业务键新增或覆盖（前端保存用）
 *   GET    /api/special/:id                        详情
 *   POST   /api/special                            新增（同 key 已存在返回 409）
 *   PUT    /api/special/:id                        更新（只更新传入字段）
 *   DELETE /api/special/:id                        删除
 *
 * ⚠️ 路由顺序：/fields、/dates、/upsert、/key/... 这些静态段必须排在 /:id 之前，
 *    否则 /api/special/dates 会被 /:id 当成 id='dates' 抢先匹配（详见 routes/specialRoutes.js）。
 * ============================================================
 */
import * as specialService from '../services/specialService.js';
import { SPECIAL_FIELDS } from '../db/tableMeta.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** 从 query 提取过滤条件（三者可任意组合，callsign 模糊匹配） */
function filterOf(req) {
  const { date, from, to, callsign } = req.query || {};
  const clean = (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  return { date: clean(date), from: clean(from), to: clean(to), callsign: clean(callsign) };
}

/** 校验写入体：callsign 必填、belongTime 必填且是合法日期 */
function validateWriteBody(body = {}) {
  const callsign = String(body.callsign ?? '').trim();
  if (!callsign) return { error: 'callsign（航班号）不能为空' };
  const belongTime = specialService.normalizeDate(body.belongTime);
  if (!belongTime) return { error: 'belongTime 必须是 YYYY-MM-DD 格式的日期' };
  return { callsign, belongTime };
}

/**
 * GET /api/special
 * @desc 台账列表（?date= 精确 / ?from=~?to= 范围 / ?callsign= 模糊）
 * @returns {{ total:number, overview:Object, items:Array }}
 * @access 公开
 */
export const listRows = asyncHandler(async (req, res) => {
  const items = await specialService.listRows(filterOf(req));
  res.json({
    total: items.length,
    overview: await specialService.getOverview(),
    items,
  });
});

/**
 * GET /api/special/fields
 * @desc 字段字典（列名 → 中文含义 / 类型 / 取值说明）
 * @access 公开
 */
export const getFields = asyncHandler(async (req, res) => {
  res.json({ total: SPECIAL_FIELDS.length, items: SPECIAL_FIELDS });
});

/**
 * GET /api/special/dates
 * @desc 每日条数（侧边栏日历徽标用）
 * @access 公开
 */
export const listDateCounts = asyncHandler(async (req, res) => {
  const items = await specialService.listDateCounts();
  res.json({ total: items.length, items });
});

/**
 * GET /api/special/key/:callsign/:belongTime
 * @desc 按业务键（航班号 + 归属日期）取一条
 * @access 公开
 */
export const getByKey = asyncHandler(async (req, res) => {
  const row = await specialService.getByKey(req.params.callsign, req.params.belongTime);
  if (!row) return res.status(404).json({ error: 'special 记录不存在' });
  res.json(row);
});

/**
 * GET /api/special/:id
 * @desc 详情
 * @access 公开
 */
export const getRow = asyncHandler(async (req, res) => {
  const row = await specialService.getRowById(req.params.id);
  if (!row) return res.status(404).json({ error: 'special 记录不存在' });
  res.json(row);
});

/**
 * POST /api/special
 * @desc 新增（body: { callsign, belongTime, nodesTime? }）；同 key 已存在返回 409
 * @access 公开
 */
export const createRow = asyncHandler(async (req, res) => {
  const v = validateWriteBody(req.body || {});
  if (v.error) return res.status(400).json({ error: v.error });
  try {
    const row = await specialService.createRow({ ...req.body, ...v });
    res.status(201).json(row);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({
        error: `该航班（${v.callsign} / ${v.belongTime}）的台账已存在，改用 PUT /api/special/upsert 覆盖`,
      });
    }
    throw err;
  }
});

/**
 * POST /api/special/upsert
 * @desc 按业务键新增或覆盖 nodesTime —— **前端「保存到台账」走这个**
 * @body  { callsign, belongTime, nodesTime }
 * @access 公开
 */
export const upsertRow = asyncHandler(async (req, res) => {
  const v = validateWriteBody(req.body || {});
  if (v.error) return res.status(400).json({ error: v.error });
  const row = await specialService.upsertByKey({ ...req.body, ...v });
  res.json(row);
});

/**
 * PUT /api/special/:id
 * @desc 更新（只更新传入字段；显式传 null 清空 nodesTime）
 * @access 公开
 */
export const updateRow = asyncHandler(async (req, res) => {
  const body = req.body || {};
  if (body.belongTime !== undefined && !specialService.normalizeDate(body.belongTime)) {
    return res.status(400).json({ error: 'belongTime 必须是 YYYY-MM-DD 格式的日期' });
  }
  try {
    const row = await specialService.updateRow(req.params.id, body);
    if (!row) return res.status(404).json({ error: 'special 记录不存在' });
    res.json(row);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: '改后的（航班号 / 归属日期）与另一条台账重复' });
    }
    throw err;
  }
});

/**
 * DELETE /api/special/:id
 * @desc 删除
 * @access 公开
 */
export const deleteRow = asyncHandler(async (req, res) => {
  const ok = await specialService.deleteRow(req.params.id);
  if (!ok) return res.status(404).json({ error: 'special 记录不存在' });
  res.json({ ok: true });
});
