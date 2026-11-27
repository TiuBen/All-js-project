// v6-e-train/routes/router.js - 路由总入口（仅路由声明，无业务逻辑）
const express = require("express");
const router = express.Router();

const task = require("./taskRoute");
const message = require("./messageRoute");
const dict = require("./dictRoute");
const user = require("./userRoute");
const theoryCategory = require("./theoryCategoryRoute");
const theoryDb = require("./theoryDbRoute");
const simulatorCategory = require("./simulatorCategoryRoute");

router.use("/tasks", task);
router.use("/messages", message);
router.use("/dict", dict);
router.use("/users", user);
router.use("/theory-categories", theoryCategory);
router.use("/theory-dbs", theoryDb);
router.use("/simulator-categories", simulatorCategory);

module.exports = router;
