// v6-e-train/controllers/dictController.js - 字典接口控制器
const dictService = require("../services/dictService");

// ---------- 查询（Read）----------
async function formOptions(req, res) {
    res.json({ success: true, data: dictService.getFormOptions() });
}

async function trainingGroups(req, res) {
    try {
        res.json({ success: true, data: await dictService.getTrainingGroups() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

async function scoreGroups(req, res) {
    try {
        res.json({ success: true, data: await dictService.getScoreGroups() });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { formOptions, trainingGroups, scoreGroups };
