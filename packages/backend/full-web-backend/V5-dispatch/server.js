/**
 * ============================================================
 * V5-dispatch 后端入口
 * ------------------------------------------------------------
 * 分层架构：
 *   config/        全局配置（端口 / 数据库 / 路径）
 *   db/            数据库连接池 + 建表
 *   utils/         工具（异步包装 / 字段映射 / 时间）
 *   services/      业务逻辑（SQL 访问）
 *   controllers/   HTTP 请求处理
 *   routes/        URL 路由定义
 *
 * 启动流程：加载配置 → 初始化数据库 → 挂载中间件/路由 → 监听端口
 * ============================================================
 */
import express from "express";
import cors from "cors";
import morgan from "morgan";

import { config } from "./src/config/index.js";
import { initDb } from "./src/db/schema.js";
import { apiRouter } from "./src/routes/index.js";

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

// 请求日志
app.use(morgan("dev"));

/* ---------- 路由 ---------- */
app.use("/api", apiRouter);

/* ---------- 404 兜底 ---------- */
app.use((req, res) => {
    res.status(404).json({ error: `route not found: ${req.method} ${req.path}` });
});

/* ---------- 全局错误处理 ---------- */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error("[ERR]", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
});

/* ---------- 启动 ---------- */
async function main() {
    await initDb(); // 自动建库建表
    console.log("PG_HOST =", process.env.PG_HOST);
    console.log("PG_PORT =", process.env.PG_PORT);
    console.log("PG_USER =", process.env.PG_USER);
    console.log("PG_PASSWORD =", process.env.PG_PASSWORD ? "有密码" : "没有密码");
    console.log("PG_DATABASE =", process.env.PG_DATABASE);
    app.listen(config.port, config.host, () => {
        console.log(`[v5-dispatch] listening on http://${config.host}:${config.port}`);
    });
}

main().catch((err) => {
    console.error("启动失败：", err);
    process.exit(1);
});
