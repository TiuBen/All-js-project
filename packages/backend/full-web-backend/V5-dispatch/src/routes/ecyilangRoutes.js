/**
 * ============================================================
 * ecyilang 路由 —— URL → Controller 映射
 * ------------------------------------------------------------
 * @route  /api/ecyilang
 * ⚠️ 顺序敏感：静态段（/flights、/fields）必须写在 /:id 之前，
 *    否则 /api/ecyilang/flights 会被 /:id 抢先匹配。
 * ============================================================
 */
import { Router } from 'express';
import * as ecyilangController from '../controllers/ecyilangController.js';

const router = Router();

/* ---------- 航班计划投影（前端航班列表页的数据源） ---------- */

/**
 * @route   GET /api/ecyilang/flights
 * @desc    航班计划列表（每组 d_/a_ 拆成离港 + 进港两条）
 * @query   date / from / to  批次日期过滤
 * @access  公开
 */
router.get('/flights', ecyilangController.listFlightPlans);

/**
 * @route   GET /api/ecyilang/flights/:id
 * @desc    单条航班计划（ecy-<行id>-d / ecy-<行id>-a）
 * @access  公开
 */
router.get('/flights/:id', ecyilangController.getFlightPlan);

/* ---------- 元信息 ---------- */

/**
 * @route   GET /api/ecyilang/fields
 * @desc    字段字典（列名 → 中文含义 / 取值说明）
 * @access  公开
 */
router.get('/fields', ecyilangController.getFields);

/* ---------- 原始行 CRUD ---------- */

/**
 * @route   GET /api/ecyilang
 * @desc    原始行列表（一行 = 一组成对航班）
 * @access  公开
 */
router.get('/', ecyilangController.listRows);

/**
 * @route   POST /api/ecyilang
 * @desc    新增原始行
 * @access  公开
 */
router.post('/', ecyilangController.createRow);

/**
 * @route   GET /api/ecyilang/:id
 * @desc    原始行详情
 * @access  公开
 */
router.get('/:id', ecyilangController.getRow);

/**
 * @route   PUT /api/ecyilang/:id
 * @desc    更新原始行（只更新传入列）
 * @access  公开
 */
router.put('/:id', ecyilangController.updateRow);

/**
 * @route   DELETE /api/ecyilang/:id
 * @desc    删除原始行
 * @access  公开
 */
router.delete('/:id', ecyilangController.deleteRow);

export { router as ecyilangRouter };
