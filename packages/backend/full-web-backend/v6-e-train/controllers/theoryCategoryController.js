// v6-e-train/controllers/theoryCategoryController.js - 目录树接口控制器（C R U D）
// 只做参数提取与响应包装，业务逻辑全部在 service 层

const service = require("../services/theoryCategoryService");

// ---------- 查询整棵树（Read）----------
// GET /api/theory-categories → [{ ...字段, children: [...] }]
async function list(req, res) {
    try {
        res.json({ success: true, data: await service.listTree() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 新增（Create）----------
// POST /api/theory-categories { name, parent_id }（仅地方题库内；tree_type 后端继承父节点，sort_order 后端计算）
async function create(req, res) {
    try {
        res.json({ success: true, data: await service.createCategory(req.body || {}) });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ---------- 更新（Update）----------
// PUT /api/theory-categories/:id { name?, sort_order? }（换父被禁止；执照题库/顶层根由 service 抛错拒绝）
async function update(req, res) {
    try {
        const category = await service.updateCategory(req.params.id, req.body || {});
        if (!category) return res.status(404).json({ success: false, message: "目录不存在" });
        res.json({ success: true, data: category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ---------- 删除（Delete）----------
// 有子目录或已挂题目时由 service 抛错拒绝
async function remove(req, res) {
    try {
        const ok = await service.deleteCategory(req.params.id);
        if (!ok) return res.status(404).json({ success: false, message: "目录不存在" });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

module.exports = { list, create, update, remove };
