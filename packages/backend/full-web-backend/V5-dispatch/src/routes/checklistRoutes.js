/**
 * ============================================================
 * 检查单路由
 * ------------------------------------------------------------
 * 挂载路径：/api/checklists（由 routes/index.js 统一挂载）
 * 包含两个子资源：
 *   /templates   检查单模板（JSON 文件，只读）
 *   /records     检查单填写记录（PG，CRUD）
 * ============================================================
 */
import express from 'express';
import * as checklistController from '../controllers/checklistController.js';

const router = express.Router();

/* ==================== 模板 ==================== */

/**
 * @route   GET /api/checklists/templates
 * @desc    检查单模板列表（元信息）
 * @access  公开
 */
router.get('/templates', checklistController.listTemplates);

/**
 * @route   GET /api/checklists/templates/:id
 * @desc    单个模板完整详情（cargo-checklist / passenger-checklist）
 * @access  公开
 */
router.get('/templates/:id', checklistController.getTemplate);

/* ==================== 填写记录 ==================== */

/**
 * @route   GET /api/checklists/records
 * @desc    查询填写记录列表
 *          支持 ?flightId= / ?category= / ?date= / ?from= / ?to=
 * @access  公开
 */
router.get('/records', checklistController.listRecords);

/**
 * @route   GET /api/checklists/records/:id
 * @desc    查询单个填写记录
 * @access  公开
 */
router.get('/records/:id', checklistController.getRecord);

/**
 * @route   POST /api/checklists/records
 * @desc    新建填写记录（永远 INSERT 一条新记录，一个航班可有多份）
 *          必填：flightId、checklistCategory
 * @access  公开
 */
router.post('/records', checklistController.createRecord);

/**
 * @route   PUT /api/checklists/records/:id
 * @desc    更新填写记录（只改 id 指定的这一条；局部更新）
 * @access  公开
 */
router.put('/records/:id', checklistController.updateRecord);

/**
 * @route   PATCH /api/checklists/records/:id
 * @desc    局部更新填写记录（与 PUT 等价的 REST 语义别名，同一控制器）
 * @access  公开
 */
router.patch('/records/:id', checklistController.updateRecord);

/**
 * @route   DELETE /api/checklists/records/:id
 * @desc    删除填写记录（清理测试/误建数据用）
 * @access  公开
 */
router.delete('/records/:id', checklistController.deleteRecord);

/* ==================== 截图上传 ==================== */

/**
 * @route   POST /api/checklists/uploads?name=xxx.png
 * @desc    上传检查项截图（请求体 = 图片**原始二进制**，Content-Type: image/*）
 *          返回 { url, name, type, size }；url 形如 /api/uploads/xxx.png
 * @access  公开
 *
 * ⚠️ 这里单独挂 express.raw：全局是 express.json，它只解析 application/json，
 *    遇到 image/* 会跳过（不消费请求体），所以到这里 req.body 是 Buffer。
 *    刻意不用 multer / FormData —— 单文件无字段，raw 足够且不引新依赖。
 */
router.post(
  '/uploads',
  express.raw({ type: 'image/*', limit: '10mb' }),
  checklistController.uploadImage,
);

export { router as checklistRouter };
