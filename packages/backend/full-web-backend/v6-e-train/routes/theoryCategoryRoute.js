// v6-e-train/routes/theoryCategoryRoute.js - 理论题库目录树路由（C R U D）
const express = require("express");
const router = express.Router();
const category = require("../controllers/theoryCategoryController");

// 整棵目录树：GET /api/theory-categories
router.get("/", category.list);

// 新建目录：POST /api/theory-categories { name, parent_id }（仅限地方题库内；tree_type 由后端继承父节点）
router.post("/", category.create);

// 更新目录（改名/排序；换父被禁止，跨题库移动从接口上杜绝）：PUT /api/theory-categories/:id
router.put("/:id", category.update);

// 删除目录（执照题库/顶层根/有子目录或挂题时拒绝）：DELETE /api/theory-categories/:id
router.delete("/:id", category.remove);

module.exports = router;
