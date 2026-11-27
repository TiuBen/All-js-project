// v6-e-train/routes/theoryDbRoute.js - 理论题库题目路由（R）
// 题目由导入脚本维护（scripts/import-questions.js），接口只开放查询
const express = require("express");
const router = express.Router();
const question = require("../controllers/theoryDbController");

// 分页查询题目：GET /api/theory-dbs?page=&page_size=&category_id=&type=&keyword=
// category_id 含全部后代目录；keyword 题干模糊；type 题型（SINGLE_CHOICE/TRUE_FALSE/...）
router.get("/", question.list);

// 单题详情：GET /api/theory-dbs/:id
router.get("/:id", question.detail);

module.exports = router;
