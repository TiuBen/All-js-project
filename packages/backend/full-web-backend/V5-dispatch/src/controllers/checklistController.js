/**
 * ============================================================
 * checklist 控制器 —— 检查单填写记录（records_checklist）
 * ============================================================
 */
import * as checklistService from '../services/checklistService.js';
import * as uploadService from '../services/uploadService.js';
import { asyncHandler } from '../utils/http.js';

/**
 * GET /api/checklist?flightUuid=&callsign=&category=&date=&from=&to=
 * @desc 填写记录列表
 */
export const listRecords = asyncHandler(async (req, res) => {
  res.json(await checklistService.list(req.query));
});

/**
 * GET /api/checklist/:id
 * @desc 单条填写记录（:id = 整数自增主键）
 */
export const getRecord = asyncHandler(async (req, res) => {
  res.json(await checklistService.get(req.params.id));
});

/**
 * POST /api/checklist
 * @desc 新建填写记录（永远 INSERT 一条；必填 checklistCategory）
 */
export const createRecord = asyncHandler(async (req, res) => {
  res.status(201).json(await checklistService.create(req.body));
});

/**
 * PUT / PATCH /api/checklist/:id
 * @desc 更新填写记录（局部更新；已提交超 24 小时回 409）
 */
export const updateRecord = asyncHandler(async (req, res) => {
  res.json(await checklistService.update(req.params.id, req.body));
});

/**
 * DELETE /api/checklist/:id
 * @desc 删除填写记录
 */
export const deleteRecord = asyncHandler(async (req, res) => {
  res.json(await checklistService.remove(req.params.id));
});

/**
 * POST /api/checklist/uploads?name=x.png
 * @desc 上传检查项截图（请求体 = 图片原始二进制，见 routes 里的 express.raw）
 */
export const uploadImage = asyncHandler(async (req, res) => {
  const result = await uploadService.saveImage(req.body, req.headers['content-type'], req.query.name);
  res.status(201).json(result);
});
