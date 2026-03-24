import express from "express";
import pkg from "pg";
import cors from "cors";

const { Pool } = pkg;

// 👉 修改成你自己的数据库配置
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "handover_db",
    password: "admin", // 你的密码
    port: 5432,
});

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ✅ 创建
 */
app.post("/handover", async (req, res) => {
    try {
        const { data } = req.body;

        const result = await pool.query("INSERT INTO handovers (data) VALUES ($1) RETURNING *", [data]);

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "create failed" });
    }
});

/**
 * ✅ 查询全部
 */
app.get("/handover", async (req, res) => {
    console.log("get list");
    try {
        const result = await pool.query("SELECT * FROM handovers ORDER BY id DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "get list failed" });
    }
});

/**
 * ✅ 查询单个
 */
app.get("/handover/:id", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM handovers WHERE id = $1", [req.params.id]);

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "get failed" });
    }
});

/**
 * ✅ 更新（整体替换 JSON）
 */
app.put("/handover/:id", async (req, res) => {
    try {
        const { data } = req.body;

        const result = await pool.query(
            `UPDATE handovers 
       SET data = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
            [data, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "update failed" });
    }
});

/**
 * ✅ 删除
 */
app.delete("/handover/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM handovers WHERE id = $1", [req.params.id]);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "delete failed" });
    }
});

app.listen(3300, () => {
    console.log("🚀 http://localhost:3300");
});
