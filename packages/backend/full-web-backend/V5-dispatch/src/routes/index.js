/**
 * ============================================================
 * 路由汇总 —— 所有子路由在此挂载，server.js 只引用本文件
 * ------------------------------------------------------------
 *   /api/health      服务存活 + PG 连接探测
 *   /api/fips        航班（三张表共用一个入口）
 *   /api/checklist   检查单填写记录（records_checklist）+ 截图上传
 *   /api/special     生鲜航班保障节点台账（records_special）
 *   /api/setting     码表维护（航司码 / 机场码）
 *   /api/monitor     航班监控（定时拉快照 → 差分 → 事件 + 通知）
 *   /api/user        值班员花名册（user；检查人 / 登录日志引用它）
 *   /api/user-log    用户登录日志（user_login_log）
 *
 * ★ 「资源 = 一张表」的对应关系：
 *   GET    /api/fips?source=fips          历史流量明细（只读）
 *   GET    /api/fips?source=ecyilang      航班计划快照（只读）
 *   GET    /api/fips?source=manual_fips   手动添加的航班
 *   POST / PUT / DELETE /api/fips/...     固定写 manual_fips（不带 source）
 *   records_checklist → /api/checklist                可写
 *   records_special   → /api/special                  可写
 *   airplane_company_name_code / airport_name_code → /api/setting/:kind
 *   records_flight_watch / records_flight_event → /api/monitor/...（系统自动写，只读开放）
 *   user              → /api/user                     可写（花名册 CRUD）
 *   user_login_log    → /api/user-log                 可写
 * ============================================================
 */
import express from 'express';
import { healthCheck } from '../controllers/healthController.js';
import { fipsRouter } from './fipsRoutes.js';
import { checklistRouter } from './checklistRoutes.js';
import { specialRouter } from './specialRoutes.js';
import { settingRouter } from './settingRoutes.js';
import { monitorRouter } from './monitorRoutes.js';
import { userLogRouter } from './userLogRoutes.js';
import { userRouter } from './userRoutes.js';

const router = express.Router();

/** 健康检查 */
router.get('/health', healthCheck);

/** 航班（fips / ecyilang / manual_fips 三张表，靠 ?source= 区分） */
router.use('/fips', fipsRouter);

/** 检查单填写记录（records_checklist）+ 检查项截图上传 */
router.use('/checklist', checklistRouter);

/** 生鲜航班保障节点台账（records_special） */
router.use('/special', specialRouter);

/** 码表维护（airplane_company_name_code / airport_name_code） */
router.use('/setting', settingRouter);

/** 航班监控（records_flight_watch / records_flight_event；定时轮询见 monitorService） */
router.use('/monitor', monitorRouter);

/** 用户登录日志（user_login_log） */
router.use('/user-log', userLogRouter);

/** 值班员花名册（user；检查单 / 台账 / 登录日志的检查人都指向它） */
router.use('/user', userRouter);

export { router as apiRouter };
