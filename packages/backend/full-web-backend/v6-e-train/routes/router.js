// v6-e-train/routes/router.js - 路由总入口（仅路由声明，无业务逻辑）
const express = require("express");
const router = express.Router();

const task = require("./taskRoute");
const message = require("./messageRoute");
const dict = require("./dictRoute");

router.use("/tasks", task);
router.use("/messages", message);
router.use("/dict", dict);

module.exports = router;
