// v6-e-train/services/userService.js - 用户业务逻辑（PostgreSQL e_train 库）
// 字段名与 PG 列名（snake_case）原样进出；只做 user 单表 CRUD，不处理关联数据

const pool = require("../config/pg");

// ---------- 查询（Read）----------
// 按关键词（姓名/电话/邮箱模糊匹配）+ 教员资格过滤查列表
async function listUsers({ keyword, is_instructor } = {}) {
    let sql = 'SELECT * FROM "user"';
    const where = [];
    const params = [];
    if (keyword) {
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
        const [a, b, c] = [params.length - 2, params.length - 1, params.length];
        where.push(`(name ILIKE $${a} OR phone ILIKE $${b} OR email ILIKE $${c})`);
    }
    if (is_instructor === true || is_instructor === "true") {
        where.push("is_instructor = true");
    } else if (is_instructor === false || is_instructor === "false") {
        where.push("is_instructor = false");
    }
    if (where.length) sql += " WHERE " + where.join(" AND ");
    sql += " ORDER BY created_at DESC";

    const { rows } = await pool.query(sql, params);
    return rows;
}

// 按 id 查单条
async function getUser(id) {
    const { rows } = await pool.query('SELECT * FROM "user" WHERE id = $1', [id]);
    return rows[0] || null;
}

// ---------- 新增（Create）----------
// 姓名必填；profile 支持对象（pg 自动序列化为 JSONB）
async function createUser(data) {
    if (!data.name) throw new Error("姓名不能为空");
    const { rows } = await pool.query(
        `INSERT INTO "user" (name, gender, phone, email, profile, is_instructor)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
            data.name,
            data.gender || null,
            data.phone || null,
            data.email || null,
            data.profile || null,
            data.is_instructor === true || data.is_instructor === "true",
        ]
    );
    return rows[0];
}

// ---------- 更新（Update）----------
// 动态拼 SET：只更新传了的字段，updated_at 同步刷新
async function updateUser(id, data) {
    const cols = { name: "name", gender: "gender", phone: "phone", email: "email", profile: "profile", is_instructor: "is_instructor" };
    const fields = [];
    const params = [];
    for (const [key, col] of Object.entries(cols)) {
        if (key in data) {
            params.push(data[key]);
            fields.push(`${col} = $${params.length}`);
        }
    }
    if (!fields.length) return getUser(id); // 没传任何字段，直接返回当前值
    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    const { rows } = await pool.query(
        `UPDATE "user" SET ${fields.join(", ")} WHERE id = $${params.length + 1} RETURNING *`,
        [...params, id]
    );
    return rows[0] || null;
}

// ---------- 删除（Delete）----------
// 返回是否真的删了（id 不存在返回 false）
async function deleteUser(id) {
    const { rowCount } = await pool.query('DELETE FROM "user" WHERE id = $1', [id]);
    return rowCount > 0;
}

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser };
