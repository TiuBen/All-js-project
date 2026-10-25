/**
 * ============================================================
 * checklist 路由 —— 检查单填写记录（URL → Controller 映射）
 * ------------------------------------------------------------
 * 挂载路径：/api/checklist，落地表 records_checklist（主键是整数自增）
 *
 * ⚠️ 顺序敏感：静态段 /uploads 要写在 /:id 之前。
 * ============================================================
 */
import express from 'express';
import * as checklistController from '../controllers/checklistController.js';

const router = express.Router();

/**
 * @route   GET /api/checklist?flightUuid=&callsign=&category=&date=&from=&to=
 * @desc    填写记录列表
 * @access  公开
 */
router.get('/', checklistController.listRecords);

/**
 * @route   POST /api/checklist
 * @desc    新建填写记录（永远 INSERT 一条；一个航班可以有多份检查单）
 *          必填 checklistCategory；可选 flightUuid（航班 uuid）、callsign、items…
 * @access  公开
 */
router.post('/', checklistController.createRecord);

/**
 * @route   POST /api/checklist/uploads?name=x.png
 * @desc    上传检查项截图（请求体 = 图片**原始二进制**，Content-Type: image/*）
 *          返回 { url, name, type, size }，url 形如 /api/uploads/xxx.png
 * @access  公开
 *
 * ⚠️ 这里单独挂 express.raw：全局是 express.json，它只解析 application/json，
 *    遇到 image/* 会跳过（不消费请求体），所以到这里 req.body 就是 Buffer。
 *    刻意不上 multer —— 单文件无字段，raw 足够且不引新依赖。
 */
router.post(
  '/uploads',
  express.raw({ type: 'image/*', limit: '10mb' }),
  checklistController.uploadImage,
);

/**
 * @route   GET /api/checklist/:id
 * @desc    单条填写记录
 * @access  公开
 */
router.get('/:id', checklistController.getRecord);

/**
 * @route   PUT / PATCH /api/checklist/:id
 * @desc    更新填写记录（局部更新；已提交超 24 小时回 409）
 * @access  公开
 */
router.put('/:id', checklistController.updateRecord);
router.patch('/:id', checklistController.updateRecord);

/**
 * @route   DELETE /api/checklist/:id
 * @desc    删除填写记录
 * @access  公开
 */
router.delete('/:id', checklistController.deleteRecord);

export { router as checklistRouter };
