/**
 * ============================================================
 * monitor 路由 —— 航班监控（URL → Controller 映射）
 * ------------------------------------------------------------
 * 挂载路径：/api/monitor
 *
 * 【自动流程不在路由里，在 server.js 启动时跑】
 *   ① 每天 00:01 拉当日计划灌进 ecyilang   monitorService.buildBaseline
 *   ② 每 N 分钟增量比对                    monitorService.runOnce
 *   ③ 服务重启从 ecyilang 重建内存 map      monitorService.ensureBaseline
 *   节奏都在 .env：MONITOR_PLAN_HOUR/MINUTE、MONITOR_INTERVAL_MINUTES
 *   留 POST /plan 与 /trigger 是为了调试：不用等到点就能立刻验证一遍。
 * ============================================================
 */
import express from 'express';
import * as monitorController from '../controllers/monitorController.js';
import { config } from '../config/index.js';

const router = express.Router();

/**
 * 推送鉴权：本地电脑把拉到的航班数据推给 /plan 与 /trigger 时用。
 * 生产必须配 MONITOR_PUSH_TOKEN，请求头带 x-push-token；留空 = 不校验（本地开发）。
 */
function requirePushToken(req, res, next) {
    const token = config.monitor.pushToken;
    if (!token) return next();
    if (req.get('x-push-token') === token) return next();
    return res.status(401).json({ error: '无效的推送令牌（x-push-token）' });
}

/**
 * @route   GET /api/monitor/status
 * @desc    运行态（比对间隔 / 基线时刻 / 基线条数 / 上次统计 / SSE 订阅数）
 * @access  公开
 */
router.get('/status', monitorController.getStatus);

/**
 * @route   GET /api/monitor/stream
 * @desc    SSE 实时订阅（新增 / 减少 / 变更都从这里推，带具体更新内容）
 * @access  公开
 */
router.get('/stream', monitorController.stream);

/**
 * @route   GET /api/monitor/events?limit=
 * @desc    最近通知（内存最近 200 条，前端重连后先拉齐再订阅）
 * @access  公开
 */
router.get('/events', monitorController.listEvents);

/**
 * @route   POST /api/monitor/trigger
 * @desc    手动跑一轮比对；body { rows: [...] } = 离线喂样本，不碰远程
 * @access  公开
 */
router.post('/trigger', requirePushToken, monitorController.trigger);

/**
 * @route   POST /api/monitor/plan
 * @desc    手动建基线（= 重灌当天进 ecyilang 并重建内存 map）
 * @access  公开
 */
router.post('/plan', requirePushToken, monitorController.triggerPlan);

/**
 * @route   POST /api/monitor/rebuild
 * @desc    只重建内存 map（回放 / 手动改库后让运行中的服务重新对上，不碰远程不写库）
 * @access  公开
 */
router.post('/rebuild', monitorController.rebuild);

export { router as monitorRouter };
