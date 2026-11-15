// v6-e-train/utils/seed.js - 首次建库时写入种子数据
// 训练项目与评分项来自小程序截图/录屏还原；任务预置 3 条李依玲待办

const { run, get, all, now } = require("./dbHelper");

const TRAINING_GROUPS = [
    {
        name: "复杂情况处置训练",
        items: [
            { name: "其他空域用户活动", positions: ["塔台", "进近", "区域", "运行"] },
            { name: "复杂气象条件下的管制运行", positions: ["塔台", "进近", "区域", "运行"] },
            { name: "大流量下的管制运行", positions: ["进近", "区域", "运行"] },
        ],
    },
    {
        name: "专项强化训练",
        items: [
            { name: "机组复诵错误（五个必须有之一）", positions: ["塔台", "进近", "区域"] },
            { name: "冲突解脱", positions: ["塔台", "进近", "区域"] },
            { name: "区域内或边界附近的目标突然改变实行避免军航飞机冲突（五个必须有之一）", positions: ["进近", "区域"] },
            { name: "预期管理（航空器计划或雷达上/下降/转向过程中，机组对计划的下/上/高度、改变航向的预期）（五个必须有之一）", positions: ["进近", "区域"] },
            { name: "机组误执行管制指令（五个必须有之一）", positions: ["塔台", "进近", "区域"] },
            { name: "相似航空器呼号（五个必须有之一）", positions: ["塔台", "进近", "区域", "飞服"] },
        ],
    },
    {
        name: "不正常情况处置训练",
        items: [
            { name: "航空器遭遇非法干扰", positions: ["塔台", "进近", "区域"] },
            { name: "航空器遭鸟击", positions: ["塔台", "进近", "区域"] },
            { name: "航空器失火", positions: ["塔台", "进近", "区域"] },
            { name: "航空器座舱失压", positions: ["进近", "区域"] },
            { name: "航空器液压系统故障", positions: ["进近", "区域"] },
            { name: "航空器空中放油", positions: ["进近", "区域", "运行"] },
            { name: "航空器应答机故障", positions: ["塔台", "进近", "区域"] },
            { name: "应急接管", positions: ["进近", "区域"] },
            { name: "通信链路失效", positions: ["塔台", "进近", "区域"] },
            { name: "航空器油量问题", positions: ["进近", "区域"] },
            { name: "航空器发动机故障", positions: ["塔台", "进近", "区域"] },
            { name: "不明空中活动", positions: ["塔台", "进近", "区域"] },
            { name: "GPS信号干扰", positions: ["塔台", "进近", "区域"] },
            { name: "空管监视设备故障（仅适用于雷达或ADS-B管制）", positions: ["进近", "区域"] },
        ],
    },
];

const SCORE_GROUPS = [
    {
        name: "管制意识和判断力(6)",
        items: [
            { name: "陆空通话用语不标准", score: 2 },
            { name: "陆空通话语音、语速、语调不恰当", score: 2 },
            { name: "未及时发现并纠正自身发话中的错误", score: 3 },
            { name: "未及时发现机组报告（或复诵）内容的错误", score: 3 },
            { name: "情景意识丢失，未掌握飞行动态", score: 3 },
            { name: "未按规定进行监控与提醒", score: 3 },
        ],
    },
    {
        name: "方法和程序(6)",
        items: [
            { name: "移交和脱波程序、时机不符合规范，或未在标牌（进程单）正确标识", score: 3 },
            { name: "改变高度程序、时机不符合规范，或未在标牌（进程单）正确标识", score: 3 },
            { name: "标牌、进程单操作不符合规范（高亮、连线等，不含3C操作）", score: 2 },
            { name: "标牌、进程单信息填写不符合规范", score: 2 },
            { name: "未遵守本单位管制移交协议和运行手册的其他规定", score: 2 },
            { name: "管制指令发布时机、顺序不恰当", score: 2 },
        ],
    },
    {
        name: "设备操作(4)",
        items: [
            { name: "通信设备使用不当", score: 2 },
            { name: "雷达工具使用不当（测量、轨迹等）", score: 2 },
            { name: "电子进程单系统操作不当", score: 2 },
            { name: "自动化系统告警设置不当", score: 2 },
        ],
    },
    {
        name: "应急处置(3)",
        items: [
            { name: "特情通报程序不熟练", score: 3 },
            { name: "应急处置预案执行不规范", score: 3 },
            { name: "复杂情况处置权限意识不足", score: 3 },
        ],
    },
    {
        name: "一票否决项(8)",
        items: [
            { name: "（塔）因本人判断、调配等原因，导致跑道侵入并需要冲突解脱的情况", score: 12 },
            { name: "（塔）因本人判断、调配等原因，导致航空器使用与机型不匹配的道面，滑入施工或限制区域等", score: 12 },
            { name: "（塔进）因管制原因向航空器提供了错误的高度表拨正值且未及时纠正的", score: 12 },
            { name: "（进区）因本人判断、调配等原因，导致航空器飞入危险区、限制区、禁区等", score: 12 },
            { name: "（进区）因本人判断、调配等原因，导致航空器高度低于MVA、MSA等情况", score: 12 },
            { name: "（塔进区）遗忘飞行动态，飞行动态进入或离开管制责任区未及时处置", score: 12 },
            { name: "（塔进区）特情判断错误，处置流程严重偏离特情处置程序", score: 12 },
            { name: "（塔进区）因指挥原因造成航空器间纵向、侧向间隔小于规定间隔", score: 12 },
        ],
    },
];

async function seed() {
    // ---------- 训练项目字典 ----------
    const trainCount = await get("SELECT COUNT(*) AS c FROM dict_training_items");
    if (trainCount.c === 0) {
        let sort = 0;
        for (const group of TRAINING_GROUPS) {
            for (const item of group.items) {
                await run(
                    "INSERT INTO dict_training_items (group_name, name, positions, sort) VALUES (?, ?, ?, ?)",
                    [group.name, item.name, JSON.stringify(item.positions), sort++]
                );
            }
        }
        console.log("训练项目字典已写入");
    }

    // ---------- 评分项字典 ----------
    const scoreCount = await get("SELECT COUNT(*) AS c FROM dict_score_items");
    if (scoreCount.c === 0) {
        let sort = 0;
        for (const group of SCORE_GROUPS) {
            for (const item of group.items) {
                await run(
                    "INSERT INTO dict_score_items (group_name, name, score, sort) VALUES (?, ?, ?, ?)",
                    [group.name, item.name, item.score, sort++]
                );
            }
        }
        console.log("评分项字典已写入");
    }

    // ---------- 消息提醒 ----------
    const msgCount = await get("SELECT COUNT(*) AS c FROM messages");
    if (msgCount.c === 0) {
        await run("INSERT INTO messages (title, created_at) VALUES (?, ?)", [
            "您有一条新的培训考核反馈待查看",
            now(),
        ]);
        await run("INSERT INTO messages (title, created_at) VALUES (?, ?)", [
            "本月模拟机培训/考核计划已发布",
            now(),
        ]);
    }

    // ---------- 待办任务样本 ----------
    const taskCount = await get("SELECT COUNT(*) AS c FROM tasks");
    if (taskCount.c === 0) {
        const sample = {
            student: "李依玲",
            train_category: "岗位培训",
            post_train_type: "资格培训",
            form_name: "（进近）指挥席位培训记录表",
            start_time: "2026-07-29 01:18:30",
            qual_type: "PLC",
            sector: "AP04",
            teacher: "吴其奇",
        };
        const times = ["2026-07-29 03:04:52", "2026-07-29 02:01:40", "2026-07-28 23:08:27"];
        for (const t of times) {
            await run(
                `INSERT INTO tasks
                (title, student, train_category, post_train_type, form_name, start_time,
                 qual_type, sector, teacher, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'todo', ?)`,
                [
                    `${sample.student}【${sample.form_name}】需录入关联表单`,
                    sample.student,
                    sample.train_category,
                    sample.post_train_type,
                    sample.form_name,
                    sample.start_time,
                    sample.qual_type,
                    sample.sector,
                    sample.teacher,
                    t,
                ]
            );
        }
        console.log("待办任务样本已写入");
    }
}

module.exports = { seed };
