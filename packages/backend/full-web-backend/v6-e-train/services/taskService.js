// v6-e-train/services/taskService.js - 任务业务逻辑
// 前后端字段名统一用数据库原始列名（snake_case）原样进出，不做转换层

const { run, get, all, now } = require("../utils/dbHelper");

// ---------- 查询（Read）----------
// 按状态 + 关键词查任务列表，status 为空时返回全部
async function listTasks({ status, keyword } = {}) {
    let sql = "SELECT * FROM tasks";
    const where = [];
    const params = [];
    if (status) {
        where.push("status = ?");
        params.push(status);
    }
    if (keyword) {
        where.push("title LIKE ?");
        params.push(`%${keyword}%`);
    }
    if (where.length) sql += " WHERE " + where.join(" AND ");
    sql += " ORDER BY created_at DESC";
    return all(sql, params);
}

// 按 id 查单条任务
async function getTask(id) {
    return get("SELECT * FROM tasks WHERE id = ?", [id]);
}

// ---------- 新增（Create）----------
// 学员姓名或表单名称未填时用默认文案，title 自动拼装
async function createTask(data) {
    const student = data.student || "";
    const formName = data.form_name || "";
    const title =
        data.title || `${student}【${formName}】需录入关联表单`;

    const result = await run(
        `INSERT INTO tasks
        (title, student, exercise_no, train_category, post_train_type, form_name,
         start_time, end_time, qual_type, sector, weather, military, sorties, complexity,
         teacher, duration, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?)`,
        [
            title,
            student,
            data.exercise_no || "",
            data.train_category || "",
            data.post_train_type || "",
            formName,
            data.start_time || now(),
            data.end_time || "",
            data.qual_type || "",
            data.sector || "",
            data.weather || "",
            data.military || "",
            data.sorties || "",
            data.complexity || "",
            data.teacher || "吴其奇",
            data.duration || "",
            now(),
        ]
    );
    return getTask(result.lastID);
}

// ---------- 更新（Update）----------
// student / form_name 变化时同步刷新 title
async function updateTask(id, patch) {
    const task = await getTask(id);
    if (!task) return null;

    const merged = Object.assign({}, task, patch);
    const title = `${merged.student}【${merged.form_name}】需录入关联表单`;

    await run(
        `UPDATE tasks SET
        title = ?, student = ?, exercise_no = ?, train_category = ?, post_train_type = ?,
        form_name = ?, start_time = ?, end_time = ?, qual_type = ?, sector = ?,
        weather = ?, military = ?, sorties = ?, complexity = ?, teacher = ?, duration = ?
        WHERE id = ?`,
        [
            title,
            merged.student,
            merged.exercise_no,
            merged.train_category,
            merged.post_train_type,
            merged.form_name,
            merged.start_time,
            merged.end_time,
            merged.qual_type,
            merged.sector,
            merged.weather,
            merged.military,
            merged.sorties,
            merged.complexity,
            merged.teacher,
            merged.duration,
            id,
        ]
    );
    return getTask(id);
}

// ---------- 删除（Delete）----------
async function deleteTask(id) {
    const result = await run("DELETE FROM tasks WHERE id = ?", [id]);
    return result.changes > 0;
}

// ---------- 提交评分：待办 -> 已办 ----------
// counts: [{ name, count }]，分值按字典匹配；得分 = 100 - Σ(次数×分值)，最低 0
async function submitScore(id, { counts = [], overall = "", attachments = 0 } = {}) {
    const task = await getTask(id);
    if (!task) return null;
    if (task.status !== "todo") {
        throw new Error("该任务已提交，不能重复评分");
    }
    if (!overall || !overall.trim()) {
        throw new Error("总体情况为必填项");
    }

    // 从字典表取每个扣分项的分值
    const dictRows = await all("SELECT name, score FROM dict_score_items");
    const scoreMap = new Map(dictRows.map((r) => [r.name, r.score]));

    let total = 0;
    const detail = [];
    for (const c of counts) {
        const score = scoreMap.get(c.name);
        if (score === undefined) continue;
        const count = Math.max(0, Number(c.count) || 0);
        total += score * count;
        if (count > 0) detail.push({ name: c.name, score, count });
    }
    const finalScore = Math.max(0, 100 - total);

    await run(
        `UPDATE tasks SET
        status = 'done', score = ?, overall = ?, counts = ?,
        attachments = ?, end_time = ?, finished_at = ?
        WHERE id = ?`,
        [finalScore, overall.trim(), JSON.stringify(detail), attachments, now(), now(), id]
    );
    return getTask(id);
}

// ---------- 统计（角标）----------
async function stats() {
    const todo = await get("SELECT COUNT(*) AS c FROM tasks WHERE status = 'todo'");
    const done = await get("SELECT COUNT(*) AS c FROM tasks WHERE status = 'done'");
    const msg = await get("SELECT COUNT(*) AS c FROM messages");
    const fb = await get("SELECT COUNT(*) AS c FROM feedbacks");
    return {
        todo: todo.c,
        done: done.c,
        message: msg.c,
        feedback: fb.c,
    };
}

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask, submitScore, stats };
