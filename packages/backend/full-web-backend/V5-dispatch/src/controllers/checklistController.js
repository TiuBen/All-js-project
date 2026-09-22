/**
 * ============================================================
 * 检查单 Controller —— HTTP 请求处理层
 * ------------------------------------------------------------
 * 解析请求 → 调用 templateService / checklistService → 组装响应。
 * 包括两个子资源：
 *   /api/checklists/templates   模板（JSON 文件）
 *   /api/checklists/records     填写记录（PG）
 * ============================================================
 */
import * as templateService from '../services/templateService.js';
import * as checklistService from '../services/checklistService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/* ==================== 模板相关 ==================== */

/**
 * GET /api/checklists/templates
 * 检查单模板列表（元信息）
 */
export const listTemplates = asyncHandler(async (req, res) => {
  const items = templateService.listTemplateMeta();
  res.json({ total: items.length, items });
});

/**
 * GET /api/checklists/templates/:id
 * 单个模板完整详情
 */
export const getTemplate = asyncHandler(async (req, res) => {
  const tpl = templateService.getTemplateById(req.params.id);
  if (!tpl) {
    return res.status(404).json({ error: 'template not found' });
  }
  res.json(tpl);
});

/* ==================== 填写记录相关 ==================== */

/**
 * GET /api/checklists/records?flightId=&category=&date=&from=&to=
 * 查询填写记录列表
 */
export const listRecords = asyncHandler(async (req, res) => {
  const { flightId, category, date, from, to } = req.query;
  const items = await checklistService.listRecords({
    flightId,
    category,
    date,
    from,
    to,
  });
  res.json({ total: items.length, items });
});

/**
 * GET /api/checklists/records/:id
 * 查询单个填写记录
 */
export const getRecord = asyncHandler(async (req, res) => {
  const record = await checklistService.getRecord(req.params.id);
  if (!record) {
    return res.status(404).json({ error: 'record not found' });
  }
  res.json(record);
});

/**
 * POST /api/checklists/records
 * **新建**填写记录（必填：flightId + checklistCategory）→ 永远 INSERT 一条新记录
 * 一个航班允许多份检查单；要改已有记录必须走 PUT /records/:id（不存在隐式 upsert）
 */
export const createRecord = asyncHandler(async (req, res) => {
  const { flightId, checklistCategory } = req.body;
  if (!flightId || !checklistCategory) {
    return res
      .status(400)
      .json({ error: 'flightId and checklistCategory are required' });
  }
  const record = await checklistService.createRecord(req.body);
  res.status(201).json(record);
});

/**
 * PUT /api/checklists/records/:id
 * **更新**填写记录（只改 id 指定的这一条；局部更新，未传字段保持原值）
 */
export const updateRecord = asyncHandler(async (req, res) => {
  const record = await checklistService.updateRecord(req.params.id, req.body);
  if (!record) {
    return res.status(404).json({ error: 'record not found' });
  }
  res.json(record);
});

/**
 * DELETE /api/checklists/records/:id
 * **删除**填写记录（只删 id 指定的这一条）
 */
export const deleteRecord = asyncHandler(async (req, res) => {
  const deleted = await checklistService.deleteRecord(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'record not found' });
  }
  res.json({ success: true });
});
