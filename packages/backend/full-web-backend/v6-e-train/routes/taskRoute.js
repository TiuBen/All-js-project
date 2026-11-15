// v6-e-train/routes/taskRoute.js - 任务路由（C R U D + 评分提交 + 统计）
const express = require("express");
const router = express.Router();
const task = require("../controllers/taskController");

// 查询任务列表：GET /api/tasks?status=todo&keyword=李依玲
router.get("/", task.list);

// 统计角标：GET /api/tasks/stats（必须放在 /:id 之前，避免 stats 被当作 id）
router.get("/stats", task.stats);

// 查询单条任务：GET /api/tasks/:id
router.get("/:id", task.detail);

// 新建待办任务：POST /api/tasks
router.post("/", task.create);

// 更新任务字段：PUT /api/tasks/:id
router.put("/:id", task.update);

// 删除任务：DELETE /api/tasks/:id
router.delete("/:id", task.remove);

// 提交评分（待办转已办）：POST /api/tasks/:id/score
router.post("/:id/score", task.submitScore);

module.exports = router;
