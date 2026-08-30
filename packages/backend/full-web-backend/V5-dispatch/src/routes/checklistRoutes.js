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
 *          支持 ?flightId= / ?templateId= / ?date= / ?from= / ?to=
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
 * @desc    创建填写记录
 *          必填：flightId、checklistTemplateId
 * @access  公开
 */
router.post('/records', checklistController.createRecord);

/**
 * @route   PUT /api/checklists/records/:id
 * @desc    更新填写记录（局部更新）
 * @access  公开
 */
router.put('/records/:id', checklistController.updateRecord);

/**
 * @route   DELETE /api/checklists/records/:id
 * @desc    删除填写记录（清理测试/误建数据用）
 * @access  公开
 */
router.delete('/records/:id', checklistController.deleteRecord);

export { router as checklistRouter };
