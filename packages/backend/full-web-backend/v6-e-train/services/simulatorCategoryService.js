// v6-e-train/services/simulatorCategoryService.js - 模拟机培训目录树业务逻辑（PG e_train）
// 自引用邻接表：顶层 parent_id 为 NULL（2025 年 / 2026 年），二级 = 1 月 - 12 月
//
// 权限规则（后端强制，仿 theory-category 的 tree_type 模式）：
//   YEAR（年份/月份骨架，seed 灌入）：整棵只读 —— 新建子级/同级、上移下移、重命名、复制、删除全部拒绝
//   CUSTOM（用户自建节点）：可新建子级/同级、上移下移（改 sort_order）、重命名、复制、删除
//   顶层年份节点固定：API 不允许新建根；年份下固定 12 个月，不允许在年份下新建（即月份没有同级新建）
//   换父（跨层级移动）：一律拒绝，parent_id 不接受修改
// tree_type 由后端强制写 CUSTOM（新建/复制），前端传什么都被忽略

const pool = require("../config/pg");

// ---------- 查询树（Read）----------
// 平铺查出后内存组树：按 sort_order 排序（年份 0/1，月份 1-12），children 嵌套返回
async function listTree() {
    const { rows } = await pool.query(
        'SELECT * FROM "simulator-category" ORDER BY sort_order, name'
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

// 按 id 查单条
async function getCategory(id) {
    const { rows } = await pool.query('SELECT * FROM "simulator-category" WHERE id = $1', [id]);
    return rows[0] || null;
}

// ---------- 新增（Create）----------
// parent_id 必填（不允许新建根 = 新年份）；父节点是顶层年份 → 拒绝（年份下固定 12 个月骨架）；
// 父节点是月份或自建节点 → 允许，tree_type 强制 CUSTOM，sort_order = 同级最大值 + 1
async function createCategory(data) {
    if (!data.name || !String(data.name).trim()) throw new Error("目录名不能为空");
    if (!data.parent_id) throw new Error("顶层年份由系统固定，不允许新建根目录");

    const parent = await getCategory(data.parent_id);
    if (!parent) throw new Error("父目录不存在");
    if (!parent.parent_id) throw new Error("年份节点下固定为 12 个月骨架，不允许新建");

    const { rows: last } = await pool.query(
        'SELECT COALESCE(MAX("sort_order"), 0) AS max FROM "simulator-category" WHERE parent_id = $1',
        [parent.id]
    );

    const { rows } = await pool.query(
        `INSERT INTO "simulator-category" ("name", "parent_id", "tree_type", "sort_order")
        VALUES ($1, $2, 'CUSTOM', $3) RETURNING *`,
        [String(data.name).trim(), parent.id, last[0].max + 1]
    );
    return rows[0];
}

// ---------- 更新（Update）----------
// 只接受 name / sort_order（上移下移 = 改 sort_order）；换父一律拒绝；
// YEAR 骨架节点（年份/月份）只读
async function updateCategory(id, data) {
    const current = await getCategory(id);
    if (!current) return null;

    if ("parent_id" in data && (data.parent_id || null) !== current.parent_id) {
        throw new Error("不允许移动目录（换父已被禁止）");
    }
    if (current.tree_type === "YEAR") {
        throw new Error("年份/月份为系统固定骨架，不允许修改");
    }

    const name = "name" in data ? data.name : current.name;
    if (!name || !String(name).trim()) throw new Error("目录名不能为空");
    const sortOrder = "sort_order" in data ? Number(data.sort_order) : current.sort_order;
    if (!Number.isInteger(sortOrder)) throw new Error("sort_order 必须是整数");

    const { rows } = await pool.query(
        `UPDATE "simulator-category"
        SET "name" = $1, "sort_order" = $2, "updated_at" = CURRENT_TIMESTAMP
        WHERE "id" = $3 RETURNING *`,
        [String(name).trim(), sortOrder, id]
    );
    return rows[0] || null;
}

// ---------- 删除（Delete）----------
// YEAR 骨架不允许删除；有子目录时拒绝（防误删整棵子树）
async function deleteCategory(id) {
    const current = await getCategory(id);
    if (!current) return null;

    if (current.tree_type === "YEAR") {
        throw new Error("年份/月份为系统固定骨架，不允许删除");
    }

    const { rows: children } = await pool.query(
        'SELECT 1 FROM "simulator-category" WHERE parent_id = $1 LIMIT 1',
        [id]
    );
    if (children.length) throw new Error("该目录下还有子目录，请先删除子目录");

    const { rowCount } = await pool.query('DELETE FROM "simulator-category" WHERE id = $1', [id]);
    return rowCount > 0;
}

// ---------- 复制（Copy）----------
// 递归复制整棵子树（tree_type 强制 CUSTOM），顶层副本名加「-副本」后缀，
// 插到原节点后面（同父下重排 sort_order 1..n）
async function copyCategory(id) {
    const orig = await getCategory(id);
    if (!orig) return null;
    if (orig.tree_type === "YEAR") {
        throw new Error("年份/月份为系统固定骨架，不允许复制");
    }

    // 递归复制子树（内部保持原 sort_order，最后统一重排同级）
    async function copySubtree(node, parentId) {
        const { rows } = await pool.query(
            `INSERT INTO "simulator-category" ("name", "parent_id", "tree_type", "sort_order")
            VALUES ($1, $2, 'CUSTOM', $3) RETURNING *`,
            [node.name, parentId, node.sort_order]
        );
        const copy = rows[0];
        const { rows: kids } = await pool.query(
            'SELECT * FROM "simulator-category" WHERE parent_id = $1 ORDER BY sort_order, created_at',
            [node.id]
        );
        for (const kid of kids) await copySubtree(kid, copy.id);
        return copy;
    }

    const copy = await copySubtree(orig, orig.parent_id);
    // 顶层副本改名
    const topName = `${orig.name}-副本`;
    await pool.query(
        'UPDATE "simulator-category" SET "name" = $1, "updated_at" = CURRENT_TIMESTAMP WHERE id = $2',
        [topName, copy.id]
    );

    // 同父兄弟按 (sort_order, created_at) 排序后重排 1..n，副本插到原节点后面
    const { rows: siblings } = await pool.query(
        'SELECT id, sort_order FROM "simulator-category" WHERE parent_id = $1 ORDER BY sort_order, created_at',
        [orig.parent_id]
    );
    const order = siblings.filter((s) => s.id !== copy.id).map((s) => s.id);
    order.splice(order.indexOf(orig.id) + 1, 0, copy.id); // 副本紧跟原节点
    for (let i = 0; i < order.length; i++) {
        await pool.query(
            'UPDATE "simulator-category" SET "sort_order" = $1, "updated_at" = CURRENT_TIMESTAMP WHERE id = $2',
            [i + 1, order[i]]
        );
    }

    return getCategory(copy.id);
}

module.exports = { listTree, createCategory, updateCategory, deleteCategory, copyCategory, getCategory };
