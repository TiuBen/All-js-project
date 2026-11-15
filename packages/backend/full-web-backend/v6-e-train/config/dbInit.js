// v6-e-train/config/dbInit.js - 建表 + 种子数据初始化（app.js 启动时调用）
const { exec } = require("../utils/dbHelper");
const { SCHEMA_SQL } = require("./schema");
const { seed } = require("../utils/seed");

async function initDb() {
    await exec(SCHEMA_SQL);
    await seed();
    console.log("培训数据库初始化完成");
}

module.exports = { initDb };
