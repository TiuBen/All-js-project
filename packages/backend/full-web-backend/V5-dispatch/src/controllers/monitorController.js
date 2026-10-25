/**
 * ============================================================
 * monitor 控制器 —— 航班监控（每日 00:01 灌 ecyilang → 定时增量比对 → SSE 通知）
 * ------------------------------------------------------------
 * 控制器只做「读入参 → 调 service → 回 JSON」，
 * 错误一律由 service 抛 HttpError，交给 server.js 的全局错误中间件。
 *
 * ★ 监控没有自己的表：基线 = ecyilang 里当天的数据，
 *   变更流水在 ecyilang.changelog，比对基准在内存（重启从库重建）。
 * ============================================================
 */
import * as monitorService from '../services/monitorService.js';
import { asyncHandler } from '../utils/http.js';

/**
 * GET /api/monitor/status
 * @desc 运行态：比对间隔 / 基线时刻 / 基线条数 / 上次统计 / SSE 订阅数
 */
export const getStatus = asyncHandler(async (req, res) => {
    res.json(monitorService.status());
});

/**
 * GET /api/monitor/stream
 * @desc SSE 实时订阅（前端 EventSource 直接连）
 *       推送：{"type":"diff", day, totals, added[], removed[], changed[]}
 *       changed[].changes = [{ field, fieldLabel, oldValue, newValue, updateTime }]
 */
export const stream = monitorService.streamHandler;

/**
 * GET /api/monitor/events?limit=
 * @desc 最近通知（内存最近 200 条；前端重连后先拉这个再订阅 SSE）
 */
export const listEvents = asyncHandler(async (req, res) => {
    res.json(monitorService.listEvents(req.query));
});

/**
 * POST /api/monitor/trigger
 * @desc 手动跑一轮比对。不传 body = 拉远程；
 *       传 { rows: [...] } = 离线喂样本（拿 db_seed/ecyilang/*.json 试，不碰远程）
 */
export const trigger = asyncHandler(async (req, res) => {
    res.json(await monitorService.trigger(req.body));
});

/**
 * POST /api/monitor/rebuild
 * @desc 只重建内存 map（从 ecyilang 按当天读行，不拉远程、不写库）。
 *       用途：跑完 db:replay 回放后 uuid 全换了，调一下让运行中的服务重新对上，
 *       不用重启服务。
 */
export const rebuild = asyncHandler(async (req, res) => {
    res.json(await monitorService.rebuildFromDb());
});

/**
 * POST /api/monitor/plan
 * @desc 手动建基线（00:01 自动跑；这里用于补建 / 调试）。
 *       语义 = 重灌当天：删 ecyilang 当天旧行 → 按本轮数据重插 → 重建内存 map。
 */
export const triggerPlan = asyncHandler(async (req, res) => {
    res.json(await monitorService.triggerBaseline(req.body));
});
