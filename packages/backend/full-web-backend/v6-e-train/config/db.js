// v6-e-train/config/db.js - SQLite3 连接与建库初始化
// 培训业务数据直接入库（不依赖 JSON 文件）：tasks / messages / feedbacks /
// dict_training_items（训练项目字典）/ dict_score_items（评分扣分项字典）
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "e-train.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("培训数据库连接失败:", err.message);
    else console.log("培训数据库连接正常:", dbPath);
});

module.exports = db;
