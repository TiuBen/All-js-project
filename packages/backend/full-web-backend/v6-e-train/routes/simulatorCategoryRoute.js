// v6-e-train/routes/simulatorCategoryRoute.js - 模拟机目录树路由（CRUD + 复制）
// 权限规则在 service 层强制：YEAR 骨架（年份/月份）只读，CUSTOM 自建节点可编辑
const express = require("express");
const router = express.Router();
const category = require("../controllers/simulatorCategoryController");

// 整棵目录树：GET /api/simulator-categories
router.get("/", category.list);

// 新建目录：POST /api/simulator-categories { name, parent_id }
router.post("/", category.create);

// 更新目录（重命名 / 上移下移排序）：PUT /api/simulator-categories/:id { name?, sort_order? }
router.put("/:id", category.update);

// 复制目录（含子树）：POST /api/simulator-categories/:id/copy
router.post("/:id/copy", category.copy);

// 删除目录（有子目录时拒绝）：DELETE /api/simulator-categories/:id
router.delete("/:id", category.remove);

module.exports = router;
