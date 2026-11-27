// v6-e-train/services/theoryDbService.js - 理论题库题目业务逻辑（PG e_train）
// 题目由 scripts/import-questions.js 从 V0-atctiku rawFiles 导入（执照题库只读数据）
// 当前只开放查询（Read）；增删改由导入脚本负责，接口暂不提供

const pool = require("../config/pg");

// ---------- 分页查询（Read）----------
// query: { page, page_size, category_id, type, keyword }
//   category_id 传入时含其全部后代目录（WITH RECURSIVE），选中部分节点也能看到子目录题目
//   type 题型过滤（QuestionType 枚举值）；keyword 题干模糊匹配
// 返回 { list, total, page, page_size }；按试题编号排序（长度优先，兼容 8/9 位编号体系）
async function listQuestions(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.page_size, 10) || 20));
    const offset = (page - 1) * pageSize;

    // 拼过滤条件（参数化，防注入）
    const where = [];
    const params = [];
    if (query.category_id) {
        params.push(query.category_id);
        const idx = params.length;
        where.push(`d."category_id" IN (
            WITH RECURSIVE sub(id) AS (
                SELECT id FROM "theory-category" WHERE id = $${idx}
                UNION ALL
                SELECT c.id FROM "theory-category" c JOIN sub ON c."parent_id" = sub.id
            ) SELECT id FROM sub
        )`);
    }
    if (query.type) {
        params.push(query.type);
        where.push(`d."type" = $${params.length}::"QuestionType"`);
    }
    if (query.keyword) {
        params.push(`%${query.keyword}%`);
        where.push(`d."content" LIKE $${params.length}`);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // 总数
    const countSql = `SELECT COUNT(*)::int AS total
        FROM "theory-db" d ${whereSql}`;
    const { rows: countRows } = await pool.query(countSql, params);

    // 分页数据：带目录名（列表展示用）；exam_no 空值排最后
    const listParams = [...params, pageSize, offset];
    const limitIdx = listParams.length - 1;
    const offsetIdx = listParams.length;
    const listSql = `
        SELECT d.*, c."name" AS "category_name"
        FROM "theory-db" d
        LEFT JOIN "theory-category" c ON c."id" = d."category_id"
        ${whereSql}
        ORDER BY d."exam_no" IS NULL, LENGTH(d."exam_no"), d."exam_no"
        LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
    const { rows } = await pool.query(listSql, listParams);

    return {
        list: rows,
        total: countRows[0].total,
        page,
        page_size: pageSize,
    };
}

// 按 id 查单题（详情）
async function getQuestion(id) {
    const { rows } = await pool.query(
        `SELECT d.*, c."name" AS "category_name"
        FROM "theory-db" d
        LEFT JOIN "theory-category" c ON c."id" = d."category_id"
        WHERE d."id" = $1`,
        [id]
    );
    return rows[0] || null;
}

module.exports = { listQuestions, getQuestion };
