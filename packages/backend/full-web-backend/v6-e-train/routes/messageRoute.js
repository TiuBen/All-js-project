// v6-e-train/routes/messageRoute.js - 消息提醒 / 反馈记录路由
const express = require("express");
const router = express.Router();
const message = require("../controllers/messageController");

// 消息提醒列表：GET /api/messages
router.get("/", message.listMessages);

// 反馈记录列表：GET /api/messages/feedbacks
router.get("/feedbacks", message.listFeedbacks);

// 新增反馈记录：POST /api/messages/feedbacks
router.post("/feedbacks", message.addFeedback);

module.exports = router;
