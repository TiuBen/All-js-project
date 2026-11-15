// v6-e-train/services/messageService.js - 消息提醒与反馈记录

const { run, all, now } = require("../utils/dbHelper");

// ---------- 查询（Read）----------
function listMessages() {
    return all("SELECT * FROM messages ORDER BY created_at DESC");
}

function listFeedbacks() {
    return all("SELECT * FROM feedbacks ORDER BY created_at DESC");
}

// ---------- 新增（Create）----------
async function addFeedback({ title, content }) {
    const result = await run("INSERT INTO feedbacks (title, content, created_at) VALUES (?, ?, ?)", [
        title || "未命名反馈",
        content || "",
        now(),
    ]);
    const { get } = require("../utils/dbHelper");
    return get("SELECT * FROM feedbacks WHERE id = ?", [result.lastID]);
}

module.exports = { listMessages, listFeedbacks, addFeedback };
