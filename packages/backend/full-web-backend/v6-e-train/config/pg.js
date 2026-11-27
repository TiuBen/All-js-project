// v6-e-train/config/pg.js - PostgreSQL（e_train 库）连接池
// user 等业务主表在 PG 里（由 scripts/init-db.js 建表），与 SQLite 微服务数据并存
const { Pool } = require("pg");

const pool = new Pool({
    connectionString:
        process.env.E_TRAIN_PG_URL || "postgresql://postgres:admin@127.0.0.1:5432/e_train",
    max: 5, // 微服务内部使用，5 个连接足够
});

module.exports = pool;
