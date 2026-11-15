// v6-e-train/controllers/messageController.js - 消息提醒与反馈记录控制器
const messageService = require("../services/messageService");

// ---------- 查询（Read）----------
async function listMessages(req, res) {
    try {
        res.json({ success: true, data: await messageService.listMessages() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

async function listFeedbacks(req, res) {
    try {
        res.json({ success: true, data: await messageService.listFeedbacks() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 新增（Create）----------
async function addFeedback(req, res) {
    try {
        const fb = await messageService.addFeedback(req.body || {});
        res.json({ success: true, data: fb });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { listMessages, listFeedbacks, addFeedback };
