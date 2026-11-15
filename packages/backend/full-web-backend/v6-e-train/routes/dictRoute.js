// v6-e-train/routes/dictRoute.js - 字典路由
const express = require("express");
const router = express.Router();
const dict = require("../controllers/dictController");

// 表单下拉选项：GET /api/dict/form-options
router.get("/form-options", dict.formOptions);

// 训练项目分组：GET /api/dict/training-groups
router.get("/training-groups", dict.trainingGroups);

// 评分项分组：GET /api/dict/score-groups
router.get("/score-groups", dict.scoreGroups);

module.exports = router;
