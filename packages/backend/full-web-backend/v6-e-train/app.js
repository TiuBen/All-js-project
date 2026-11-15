// v6-e-train/app.js - 培训/考核微服务入口（Express + SQLite3）
// 与 v4-tower-duty 同模式：本文件只负责组装中间件与路由，由根 index.js 挂载端口
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

// 启动时建表 + 写入种子数据
const { initDb } = require("./config/dbInit");
initDb();

const routes = require("./routes/router");

const app = express();

// 中间件
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// 业务路由统一挂在 /api 下
app.use("/api", routes);

// 健康检查
app.get("/health", (req, res) => {
    res.json({ status: "OK", service: "e-train API", timestamp: new Date().toISOString() });
});

// 404
app.use("*", (req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// 全局错误兜底
app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;
