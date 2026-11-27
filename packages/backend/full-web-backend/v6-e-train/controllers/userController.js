// v6-e-train/controllers/userController.js - 用户接口控制器（C R U D）
// 只做参数提取与响应包装，业务逻辑全部在 service 层

const userService = require("../services/userService");

// ---------- 查询列表（Read）----------
// GET /api/users?keyword=张&is_instructor=true
async function list(req, res) {
    try {
        const { keyword, is_instructor } = req.query;
        const data = await userService.listUsers({ keyword, is_instructor });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 查询单条（Read）----------
async function detail(req, res) {
    try {
        const user = await userService.getUser(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "用户不存在" });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 新增（Create）----------
async function create(req, res) {
    try {
        const user = await userService.createUser(req.body || {});
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ---------- 更新（Update）----------
async function update(req, res) {
    try {
        const user = await userService.updateUser(req.params.id, req.body || {});
        if (!user) return res.status(404).json({ success: false, message: "用户不存在" });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ---------- 删除（Delete）----------
async function remove(req, res) {
    try {
        const ok = await userService.deleteUser(req.params.id);
        if (!ok) return res.status(404).json({ success: false, message: "用户不存在" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { list, detail, create, update, remove };
