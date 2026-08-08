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
 * GET /api/checklists/records?flightId=&templateId=&date=&from=&to=
 * 查询填写记录列表
 */
export const listRecords = asyncHandler(async (req, res) => {
  const { flightId, templateId, date, from, to } = req.query;
  const items = await checklistService.listRecords({
    flightId,
    templateId,
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
 * 创建填写记录（必填：flightId + checklistTemplateId）
 */
export const createRecord = asyncHandler(async (req, res) => {
  const { flightId, checklistTemplateId } = req.body;
  if (!flightId || !checklistTemplateId) {
    return res
      .status(400)
      .json({ error: 'flightId and checklistTemplateId are required' });
  }
  const record = await checklistService.createRecord(req.body);
  res.status(201).json(record);
});

/**
 * PUT /api/checklists/records/:id
 * 更新填写记录（局部更新）
 */
export const updateRecord = asyncHandler(async (req, res) => {
  const record = await checklistService.updateRecord(req.params.id, req.body);
  if (!record) {
    return res.status(404).json({ error: 'record not found' });
  }
  res.json(record);
});
