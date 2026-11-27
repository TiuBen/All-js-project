// v6-e-train/controllers/theoryDbController.js - 理论题库题目接口控制器（R）
// 只做参数提取与响应包装，业务逻辑全部在 service 层

const service = require("../services/theoryDbService");

// ---------- 分页查询题目（Read）----------
// GET /api/theory-dbs?page=&page_size=&category_id=&type=&keyword=
// category_id 含全部后代目录；题库为导入的只读数据，暂不提供写接口
async function list(req, res) {
    try {
        res.json({ success: true, data: await service.listQuestions(req.query || {}) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ---------- 查询单题详情（Read）----------
// GET /api/theory-dbs/:id
async function detail(req, res) {
    try {
        const question = await service.getQuestion(req.params.id);
        if (!question) return res.status(404).json({ success: false, message: "题目不存在" });
        res.json({ success: true, data: question });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { list, detail };
