// v6-e-train/config/schema.js - 建表语句与种子数据
// 表结构按小程序功能对齐：任务、消息提醒、反馈记录、训练项目字典、评分项字典

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    student TEXT DEFAULT '',
    exercise_no TEXT DEFAULT '',
    train_category TEXT DEFAULT '',
    post_train_type TEXT DEFAULT '',
    form_name TEXT DEFAULT '',
    start_time TEXT DEFAULT '',
    end_time TEXT DEFAULT '',
    qual_type TEXT DEFAULT '',
    sector TEXT DEFAULT '',
    weather TEXT DEFAULT '',
    military TEXT DEFAULT '',
    sorties TEXT DEFAULT '',
    complexity TEXT DEFAULT '',
    teacher TEXT DEFAULT '',
    duration TEXT DEFAULT '',
    status TEXT DEFAULT 'todo',          -- todo=待办 done=已办
    score INTEGER,                       -- 提交评分后的最后得分
    overall TEXT DEFAULT '',             -- 总体情况
    counts TEXT DEFAULT '[]',            -- 各扣分项次数 JSON: [{name,score,count}]
    attachments INTEGER DEFAULT 0,       -- 附件数量
    created_at TEXT,
    finished_at TEXT
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS dict_training_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT NOT NULL,            -- 复杂情况处置训练 / 专项强化训练 / 不正常情况处置训练 / 个性化训练
    name TEXT NOT NULL,
    positions TEXT NOT NULL,             -- 适用席位 JSON: ["塔台","进近",...]
    sort INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dict_score_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT NOT NULL,            -- 管制意识和判断力(6) 等
    name TEXT NOT NULL,
    score INTEGER NOT NULL,              -- 单次扣分分值
    sort INTEGER DEFAULT 0
);
`;

module.exports = { SCHEMA_SQL };
