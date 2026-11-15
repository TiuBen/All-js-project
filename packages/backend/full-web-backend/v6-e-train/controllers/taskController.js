// v6-e-train/controllers/taskController.js - 任务接口控制器（C R U D + 评分提交）
// 只做参数提取与响应包装，业务逻辑全部在 service 层

const taskService = require("../services/taskService");

// ---------- 查询列表（Read）----------
async function list(req, res) {
    try {
        const { status, keyword } = req.query;
        const data = await taskService.listTasks({ status, keyword });
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 查询单条（Read）----------
async function detail(req, res) {
    try {
        const task = await taskService.getTask(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: "任务不存在" });
        res.json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 新增（Create）----------
async function create(req, res) {
    try {
        const task = await taskService.createTask(req.body || {});
        res.json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 更新（Update）----------
async function update(req, res) {
    try {
        const task = await taskService.updateTask(req.params.id, req.body || {});
        if (!task) return res.status(404).json({ success: false, message: "任务不存在" });
        res.json({ success: true, data: task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 删除（Delete）----------
async function remove(req, res) {
    try {
        const ok = await taskService.deleteTask(req.params.id);
        if (!ok) return res.status(404).json({ success: false, message: "任务不存在" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 提交评分（Update：待办 -> 已办）----------
async function submitScore(req, res) {
    try {
        const task = await taskService.submitScore(req.params.id, req.body || {});
        res.json({ success: true, data: task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ---------- 统计（角标数量）----------
async function stats(req, res) {
    try {
        res.json({ success: true, data: await taskService.stats() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { list, detail, create, update, remove, submitScore, stats };
