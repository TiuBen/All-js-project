// v6-e-train/services/theoryCategoryService.js - 理论题库目录树业务逻辑（PG e_train）
// 自引用邻接表：顶层 parent_id 为 NULL（执照题库 / 地方题库），题目（theory-db）挂在大类叶子
//
// 目录权限规则（后端强制，前端隐藏菜单只是辅助）：
//   执照题库（tree_type = LICENSE）：整棵子树只读，新建/改名/排序/删除全部拒绝
//   地方题库（tree_type = LOCAL）：可以新建子级/同级、上移下移、重命名、删除
//   顶层根节点（parent_id 为 NULL）：系统固定，不允许 API 新建根、改名、排序、删除
//   跨题库移动：接口上直接禁止换父节点（parent_id 一律不接受修改）
// tree_type 由后端从父节点继承，前端传什么都被忽略

const pool = require("../config/pg");

// ---------- 查询树（Read）----------
// 平铺查出后内存组树：顶层按固定 sort_order（执照题库 0 最上 / 地方题库 1），children 嵌套返回
async function listTree() {
    const { rows } = await pool.query(
        'SELECT * FROM "theory-category" ORDER BY sort_order, name'
    );
    const byId = {};
    rows.forEach((r) => (byId[r.id] = { ...r, children: [] }));
    const tree = [];
    for (const r of rows) {
        if (r.parent_id && byId[r.parent_id]) byId[r.parent_id].children.push(byId[r.id]);
        else tree.push(byId[r.id]); // parent 不存在或为顶层，兜底挂到根
    }
    return tree;
}

// ---------- 新增（Create）----------
// 只允许在地方题库内新建：parent_id 必填（顶层根由系统固定，API 不开放建根），
// tree_type 继承父节点真实值（不信前端），sort_order = 同级最大值 + 1（后端计算）
async function createCategory(data) {
    if (!data.name) throw new Error("目录名不能为空");
    if (!data.parent_id) throw new Error("顶层目录由系统固定，不允许新建根目录");

    const parent = await getCategory(data.parent_id);
    if (!parent) throw new Error("父目录不存在");
    if (parent.tree_type !== "LOCAL") throw new Error("执照题库为系统固定目录，不允许修改");

    // 同级最大 sort_order + 1，追加到末尾
    const { rows: last } = await pool.query(
        'SELECT COALESCE(MAX("sort_order"), -1) AS max FROM "theory-category" WHERE parent_id = $1',
        [parent.id]
    );

    const { rows } = await pool.query(
        `INSERT INTO "theory-category" ("name", "parent_id", "tree_type", "sort_order")
        VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.name, parent.id, parent.tree_type, last[0].max + 1]
    );
    return rows[0];
}

// ---------- 更新（Update）----------
// 只接受 name / sort_order；换父（parent_id）一律拒绝 —— 跨题库移动从接口上杜绝；
// 执照题库子树只读；顶层根目录固定不允许改名/排序
async function updateCategory(id, data) {
    const current = await getCategory(id);
    if (!current) return null;

    if ("parent_id" in data && (data.parent_id || null) !== current.parent_id) {
        throw new Error("不允许移动目录（跨题库移动已被禁止）");
    }
    if (current.tree_type !== "LOCAL") throw new Error("执照题库为系统固定目录，不允许修改");
    if (!current.parent_id) throw new Error("根目录由系统固定，不允许修改");

    const name = "name" in data ? data.name : current.name;
    if (!name) throw new Error("目录名不能为空");
    const sortOrder = "sort_order" in data ? data.sort_order : current.sort_order;

    const { rows } = await pool.query(
        `UPDATE "theory-category"
        SET "name" = $1, "sort_order" = $2, "updated_at" = CURRENT_TIMESTAMP
        WHERE "id" = $3 RETURNING *`,
        [name, sortOrder, id]
    );
    return rows[0] || null;
}

// ---------- 删除（Delete）----------
// 执照题库与顶层根不允许删除；有子目录或已挂题目时拒绝（防误删整棵子树/悬空题目）
async function deleteCategory(id) {
    const current = await getCategory(id);
    if (!current) return null;

    if (!current.parent_id) throw new Error("根目录由系统固定，不允许删除");
    if (current.tree_type !== "LOCAL") throw new Error("执照题库为系统固定目录，不允许删除");

    const { rows: children } = await pool.query(
        'SELECT 1 FROM "theory-category" WHERE parent_id = $1 LIMIT 1',
        [id]
    );
    if (children.length) throw new Error("该目录下还有子目录，请先删除子目录");

    const { rows: items } = await pool.query(
        'SELECT 1 FROM "theory-db" WHERE category_id = $1 LIMIT 1',
        [id]
    );
    if (items.length) throw new Error("该目录下已挂有题目，请先移走题目");

    const { rowCount } = await pool.query('DELETE FROM "theory-category" WHERE id = $1', [id]);
    return rowCount > 0;
}

// 按 id 查单条
async function getCategory(id) {
    const { rows } = await pool.query('SELECT * FROM "theory-category" WHERE id = $1', [id]);
    return rows[0] || null;
}

module.exports = { listTree, createCategory, updateCategory, deleteCategory, getCategory };
