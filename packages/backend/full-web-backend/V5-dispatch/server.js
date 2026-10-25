/**
 * ============================================================
 * V5-dispatch 后端入口
 * ------------------------------------------------------------
 * 分层架构：
 *   config/        全局配置（端口 / 数据库连接串 / 路径 / PG 会话时区）
 *   db/            Prisma Client 单例（+ JSON 列的可空语义小工具）
 *   utils/         纯函数，无业务语义：
 *                    date.js    时间口径（无时区列按 UTC 读 / timestamptz 按北京时区读）
 *                    http.js    HttpError 家族 + asyncHandler
 *                    values.js  cleanText / pickColumns / toInt / isUuid
 *   services/      业务逻辑，一张表一个模块：
 *                    fipsService     三张航班表（?source= 就是表名，读走 prisma[model]）
 *                    checklistService  records_checklist
 *                    specialService    records_special
 *                    settingService    两张码表
 *                    userLogService    user_login_log（登录 / 登出）
 *                    uploadService     检查项截图落盘
 *   controllers/   只解析入参 + 抛 HttpError
 *   routes/        URL 路由定义
 *
 *   ★ 航班监控：每天 00:01 建当日航班计划基线，之后每 N 分钟拉一次比对，
 *     新增 / 减少 / 变更都记事件并推通知。
 *     不走路由启动，而是 main() 里直接 monitorService.start()，
 *     节奏来自 config.monitor（.env 的 MONITOR_PLAN_HOUR/MINUTE、MONITOR_INTERVAL_MINUTES）。
 *
 * 接口一览（资源 = 一张表，详见 src/routes/index.js）：
 *   /api/fips       航班（?source=fips | ecyilang | manual_fips）
 *   /api/checklist  检查单填写记录（records_checklist）
 *   /api/special    生鲜航班保障节点台账（records_special）
 *   /api/setting    码表维护（航司码 / 机场码）
 *   /api/monitor    航班监控（records_flight_watch / records_flight_event）
 *   /api/user-log   用户登录日志（user_login_log）
 *
 * ★ 数据库访问统一走 Prisma Client（src/db/prisma.js），业务代码里没有 SQL 字符串。
 *   ⚠️ 因为 Prisma 7 生成的客户端是 TypeScript 源码，本服务必须由 **tsx** 执行
 *      （见 package.json 的 dev / start），直接 `node server.js` 会 import 失败。
 *
 * 启动流程：加载配置 → 挂载中间件/路由 → 监听端口
 *           （建表不在这里，见 prisma/schema.prisma + `pnpm db:push`）
 * ============================================================
 */
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { config } from "./src/config/index.js";
import { prisma } from "./src/db/prisma.js";
import * as monitorService from "./src/services/monitorService.js";
import { apiRouter } from "./src/routes/index.js";
import { isUniqueViolation, uniqueConflictMessage } from "./src/utils/http.js";

const app = express();

/* ---------- 中间件 ---------- */

// CORS 跨域（白名单来自 .env）
app.use(
    cors({
        origin: config.corsOrigins.length ? config.corsOrigins : true,
        credentials: true,
    })
);

// JSON 请求体解析（检查单 items 可能较大，放宽到 10mb）
app.use(express.json({ limit: "10mb" }));

// 请求日志：开发用 dev（彩色一行）；生产不打印 —— 每个请求一行太吵，也没有审计价值
if (config.env !== "production") app.use(morgan("dev"));

/* ---------- 路由 ---------- */

// 检查项截图（静态文件）：上传时落盘到 data/uploads，这里直接托管
// ⚠️ 挂在 /api 前缀下 —— 开发环境的 vite 代理与线上 nginx 都只反代 /api，
//    这样两个环境都不用改代理配置就能取到图（见 config.uploadsUrlPrefix）。
app.use(
    config.uploadsUrlPrefix,
    express.static(config.paths.uploads, {
        maxAge: "7d",       // 文件名自带时间戳+随机串，内容不会变 → 可放心缓存
        immutable: true,
        index: false,       // 不列目录
        dotfiles: "ignore",
    })
);

app.use("/api", apiRouter);

/* ---------- 404 兜底 ---------- */
app.use((req, res) => {
    res.status(404).json({ error: `route not found: ${req.method} ${req.path}` });
});

/* ---------- 全局错误处理 ---------- */
// 所有 service / controller 都用 utils/http.js 的 HttpError 表达"该回哪个状态码"，
// 这里统一读 err.status 转成 JSON —— 业务代码里不用到处写 res.status(4xx).json(...)。
// ★ 唯一性由**数据库 UNIQUE 约束**把关：service 里不查重、不 try/catch，
//   Prisma 的 P2002（PG 原生 23505）在这里统一翻译成 409。
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const duplicated = isUniqueViolation(err);
    const status = duplicated ? 409 : err.status || 500;
    const message = duplicated ? uniqueConflictMessage(err) : err.message || "Internal Server Error";

    if (status >= 500) {
        // 只有真正的服务端错误才打完整堆栈；4xx 是正常的业务拒绝，不需要噪音
        console.error("[ERR]", err);
    } else {
        console.warn(`[${status}] ${req.method} ${req.originalUrl} —— ${message}`);
    }
    res.status(status).json({ error: message });
});

/* ---------- 启动 ---------- */
async function main() {
    // ⚠️ 启动时**不再建表 / 迁移**：表结构由 prisma/schema.prisma 描述，
    //    改完跑 `pnpm db:push` 同步到库（想留迁移历史就 `pnpm prisma migrate dev`）。
    //    库里那 4 个自定义函数（base_flight_uuid / flight_no_variants / try_date /
    //    resolve_flight_uuid）不在 Prisma 视野内，统一放在
    //    prisma/migrations/0_init/migration.sql 里，用 `pnpm prisma migrate deploy` 建立。
    // 先真连一次库：连不上就当场退出，别等第一个请求进来才 500。
    // ⚠️ Prisma 的 driver adapter 是**懒连接**，不探一下就发现不了配置写错。
    await prisma.$queryRaw`SELECT 1`;
    console.log("[v5-dispatch] 数据库连接正常（Prisma Client）");

    const server = app.listen(config.port, config.host, () => {
        console.log(`[v5-dispatch] listening on http://${config.host}:${config.port}`);
    });

    // 航班监控：确保当天基线（从 ecyilang 重建或拉远程补建）→ 起两个定时器
    //   （每天 00:01 重灌当日计划进 ecyilang / 每 N 分钟增量比对 + SSE 通知）。
    // ⚠️ 放在 listen 之后 —— 建基线要拉远程 + 落库，别拖慢端口起来。
    //   拉不到会自己 catch 掉并保留库里数据，不会影响服务可用性。
    monitorService.start();

    // 优雅退出：先停收新连接，再断开 Prisma 的连接池，避免进程退出时连接泄漏
    const shutdown = async (signal) => {
        console.log(`\n[v5-dispatch] 收到 ${signal}，正在关闭…`);
        monitorService.stop(); // 别让定时器把进程钉住
        server.close(async () => {
            await prisma.$disconnect();
            console.log("[v5-dispatch] 已关闭");
            process.exit(0);
        });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
    console.error("启动失败：", err);
    process.exit(1);
});
