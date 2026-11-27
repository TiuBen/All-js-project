// v6-e-train/controllers/simulatorCategoryController.js - 模拟机目录树接口控制器（CRUD + 复制）
// 只做参数提取与响应包装，业务逻辑与权限规则全部在 service 层

const service = require("../services/simulatorCategoryService");

// ---------- 查询整棵树（Read）----------
// GET /api/simulator-categories → [{ ...字段含 tree_type, children: [...] }]
async function list(req, res) {
    try {
        res.json({ success: true, data: await service.listTree() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 新建目录（Create）----------
// POST /api/simulator-categories { name, parent_id } → 新建 CUSTOM 节点
async function create(req, res) {
    try {
        const { name, parent_id } = req.body || {};
        res.json({ success: true, data: await service.createCategory({ name, parent_id }) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ---------- 更新目录（Update：重命名 / 上移下移排序）----------
// PUT /api/simulator-categories/:id { name?, sort_order? } → YEAR 骨架节点拒绝
async function update(req, res) {
    try {
        const data = await service.updateCategory(req.params.id, req.body || {});
        if (!data) return res.status(404).json({ success: false, message: "目录不存在" });
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ---------- 删除目录（Delete）----------
// DELETE /api/simulator-categories/:id → YEAR 骨架节点拒绝，有子目录拒绝
async function remove(req, res) {
    try {
        const ok = await service.deleteCategory(req.params.id);
        if (!ok) return res.status(404).json({ success: false, message: "目录不存在" });
        res.json({ success: true, data: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ---------- 复制目录（Copy）----------
// POST /api/simulator-categories/:id/copy → 递归复制子树，副本插到原节点后面
async function copy(req, res) {
    try {
        const data = await service.copyCategory(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: "目录不存在" });
        res.json({ success: true, data });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

module.exports = { list, create, update, remove, copy };
