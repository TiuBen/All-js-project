// v6-e-train/routes/userRoute.js - 用户路由（C R U D）
const express = require("express");
const router = express.Router();
const user = require("../controllers/userController");

// 用户列表：GET /api/users?keyword=张&is_instructor=true
router.get("/", user.list);

// 查询单个用户：GET /api/users/:id
router.get("/:id", user.detail);

// 新建用户：POST /api/users
router.post("/", user.create);

// 更新用户：PUT /api/users/:id
router.put("/:id", user.update);

// 删除用户：DELETE /api/users/:id
router.delete("/:id", user.remove);

module.exports = router;
