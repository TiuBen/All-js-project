// v6-e-train/services/dictService.js - 字典查询（训练项目 / 评分项 / 表单选项）
const { all } = require("../utils/dbHelper");

// 表单下拉选项（简单枚举，量小且稳定，作为常量维护）
const FORM_OPTIONS = {
    students: ["李依玲", "王思远", "赵子墨", "陈晓岚", "刘一帆"],
    trainCategories: ["初始培训", "岗前培训", "岗位培训", "复习培训", "资质排查"],
    postTrainTypes: ["资格培训", "熟练培训", "复训"],
    formNames: [
        "（进近）指挥席位培训记录表",
        "（塔台）指挥席位培训记录表",
        "（区域）指挥席位培训记录表",
    ],
    qualTypes: ["PLC", "SID", "STAR"],
    sectors: ["AP01", "AP02", "AP03", "AP04"],
    weathers: ["简单气象", "复杂气象"],
    militaryOptions: ["无", "有"],
    complexityLevels: ["一般", "较复杂", "复杂"],
    durations: ["0.5", "1", "1.5", "2", "2.5", "3", "4", "6", "8"],
    positions: ["塔台", "进近", "区域", "飞服", "运行"],
};

// ---------- 查询（Read）----------
// 表单选项（常量）
function getFormOptions() {
    return FORM_OPTIONS;
}

// 训练项目字典：按分组归并，positions 由 JSON 还原为数组
async function getTrainingGroups() {
    const rows = await all("SELECT * FROM dict_training_items ORDER BY sort");
    const groups = [];
    const groupMap = new Map();
    for (const row of rows) {
        if (!groupMap.has(row.group_name)) {
            const group = { name: row.group_name, items: [] };
            groupMap.set(row.group_name, group);
            groups.push(group);
        }
        groupMap.get(row.group_name).items.push({
            id: row.id,
            name: row.name,
            positions: JSON.parse(row.positions || "[]"),
        });
    }
    return groups;
}

// 评分项字典：按分组归并
async function getScoreGroups() {
    const rows = await all("SELECT * FROM dict_score_items ORDER BY sort");
    const groups = [];
    const groupMap = new Map();
    for (const row of rows) {
        if (!groupMap.has(row.group_name)) {
            const group = { name: row.group_name, items: [] };
            groupMap.set(row.group_name, group);
            groups.push(group);
        }
        groupMap.get(row.group_name).items.push({
            id: row.id,
            name: row.name,
            score: row.score,
        });
    }
    return groups;
}

module.exports = { getFormOptions, getTrainingGroups, getScoreGroups };
