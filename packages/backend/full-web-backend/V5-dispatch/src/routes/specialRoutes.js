/**
 * ============================================================
 * special 路由 —— URL → Controller 映射
 * ------------------------------------------------------------
 * @route  /api/special
 * 生鲜航班保障节点台账（一天一个航班一份，业务自然键 = 航班号 + 归属日期）
 *
 * ⚠️ 顺序敏感：静态段（/fields、/dates、/upsert）必须写在 /:id 之前，
 *    否则 /api/special/dates 会被 /:id 当成 id='dates' 抢先匹配。
 * ============================================================
 */
import { Router } from 'express';
import * as specialController from '../controllers/specialController.js';

const router = Router();

/* ---------- 元信息（必须放在 /:id 之前） ---------- */

/**
 * @route   GET /api/special/fields
 * @desc    字段字典（列名 → 中文含义 / 类型 / 取值说明）
 * @access  公开
 */
router.get('/fields', specialController.getFields);

/**
 * @route   GET /api/special/dates
 * @desc    每日条数（侧边栏日历徽标用）
 * @access  公开
 */
router.get('/dates', specialController.listDateCounts);

/* ---------- 按业务键（航班号 + 归属日期） ---------- */

/**
 * @route   POST /api/special/upsert
 * @desc    按 (callsign, belongTime) 新增或覆盖 nodesTime —— 前端保存到台账走这里
 * @body    { callsign, belongTime, nodesTime }
 * @access  公开
 */
router.post('/upsert', specialController.upsertRow);

/**
 * @route   GET /api/special/key/:callsign/:belongTime
 * @desc    按业务键取一条（如 /api/special/key/O3182/2026-09-01）
 * @access  公开
 */
router.get('/key/:callsign/:belongTime', specialController.getByKey);

/* ---------- 通用 CRUD ---------- */

/**
 * @route   GET /api/special
 * @desc    台账列表
 * @query   date / from / to / callsign
 * @access  公开
 */
router.get('/', specialController.listRows);

/**
 * @route   POST /api/special
 * @desc    新增（同 key 已存在返回 409，覆盖请走 /upsert）
 * @access  公开
 */
router.post('/', specialController.createRow);

/**
 * @route   GET /api/special/:id
 * @desc    详情
 * @access  公开
 */
router.get('/:id', specialController.getRow);

/**
 * @route   PUT /api/special/:id
 * @desc    更新（只更新传入字段）
 * @access  公开
 */
router.put('/:id', specialController.updateRow);

/**
 * @route   DELETE /api/special/:id
 * @desc    删除
 * @access  公开
 */
router.delete('/:id', specialController.deleteRow);

export { router as specialRouter };
