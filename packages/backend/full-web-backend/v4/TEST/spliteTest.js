const { FinalEditionDutyRowClip } = require("../utils/util/clipDutyRow");
const dutyRecord = {
    id: 16256,
    userId: 23,
    username: "胡鑫",
    position: "西塔台",
    dutyType: "主班",
    inTime: "2026-02-02 16:11:03",
    outTime: "2026-02-02 18:36:19",
    roleType: null, // 原数据中为空
    relatedDutyTableRowId: [16257, 16258],
    roleStartTime: ["2026-02-02 16:11:14", "2026-02-02 18:01:33"],
    roleEndTime: ["2026-02-02 16:12:15", "2026-02-02 18:36:19"],
    roleTimes: null, // 原数据中为空
    status: null, // 原数据中为空
    relatedPrepareTableId: null, // 原数据中为空
};

const dutyRecord2 = {
    id: 15422,
    userId: 23,
    username: "胡鑫",
    position: "西塔台",
    dutyType: "主班",
    inTime: "2026-01-09 07:01:00",
    outTime: "2026-01-09 10:06:52",
    roleType: "", // 原始数据中该字段为空
    relatedDutyTableRowId: [15423, 15424], // 已转换为数组
    roleStartTime: ["2026-01-09 07:01:03", "2026-01-09 07:16:21"], // 已转换为数组
    roleEndTime: ["2026-01-09 07:01:21", "2026-01-09 10:06:52"], // 已转换为数组
    roleTimes: "", // 原始数据中该字段为空
    status: "", // 原始数据中该字段为空
    relatedPrepareTableId: "", // 原始数据中该字段为空
};

const dutyRecord3 = {
    id: 19624,
    userId: 28,
    username: "王建超",
    position: "放行",
    dutyType: "", // 原始数据中该字段为空
    inTime: "2026-05-14 03:05:01",
    outTime: "2026-05-14 05:20:01",
    roleType: "", // 原始数据中该字段为空
    relatedDutyTableRowId: [19625], // 已转换为数组
    roleStartTime: ["2026-05-14 03:05:03"], // 已转换为数组
    roleEndTime: ["2026-05-14 05:20:01"], // 已转换为数组
    roleTimes: "", // 原始数据中该字段为空
    status: "", // 原始数据中该字段为空
    relatedPrepareTableId: "", // 原始数据中该字段为空
};

const dutyRecord4 = {
    id: 18924,
    userId: 26,
    username: "张宗根",
    position: "西塔台",
    dutyType: "主班",
    inTime: "2026-04-22 22:50:12",
    outTime: "2026-04-23 02:46:25",
    roleType: "", // 原始数据中该字段为空
    relatedDutyTableRowId: [18925], // 已转换为数组
    roleStartTime: ["2026-04-22 22:50:14"], // 已转换为数组
    roleEndTime: ["2026-04-23 02:46:25"], // 已转换为数组
    roleTimes: "", // 原始数据中该字段为空
    status: "", // 原始数据中该字段为空
    relatedPrepareTableId: "", // 原始数据中该字段为空
};

const dutyRecord5 = {
    id: 15422,
    userId: 23,
    username: "胡鑫",
    position: "西塔台",
    dutyType: "主班",
    inTime: "2026-01-09 07:01:00",
    outTime: "2026-01-09 10:06:52",
    roleType: "", // 原始数据中该字段为空
    relatedDutyTableRowId: [15423, 15424], // 已转换为数组
    roleStartTime: ["2026-01-09 07:01:03", "2026-01-09 07:16:21"], // 已转换为数组
    roleEndTime: ["2026-01-09 07:01:21", "2026-01-09 10:06:52"], // 已转换为数组
    roleTimes: "", // 原始数据中该字段为空
    status: "", // 原始数据中该字段为空
    relatedPrepareTableId: "", // 原始数据中该字段为空
};
const dutyRecord6 = {
    id: 21364,
    userId: 9,
    username: "温若春",
    position: "放行",
    dutyType: "", // 原始数据中该字段为空
    inTime: "2026-05-05 00:43:35",
    outTime: "2026-05-05 02:35:35",
    roleType: "", // 原始数据中该字段为空
    relatedDutyTableRowId: [], // 原始数据中该字段为空
    roleStartTime: [], // 原始数据中该字段为空
    roleEndTime: [], // 原始数据中该字段为空
    roleTimes: "", // 原始数据中该字段为空
    status: "", // 原始数据中该字段为空
    relatedPrepareTableId: "", // 原始数据中该字段为空
};
const dutyRecord7 = {
    id: 21329,
    userId: 28,
    username: "王建超",
    position: "东塔台",
    dutyType: "主班",
    inTime: "2026-07-03 18:29:15",
    outTime: "2026-07-03 20:38:17",
    roleType: "", // 原始数据中该字段为空
    relatedDutyTableRowId: [], // 原始数据中该字段为空
    roleStartTime: [], // 原始数据中该字段为空
    roleEndTime: [], // 原始数据中该字段为空
    roleTimes: "", // 原始数据中该字段为空
    status: "", // 原始数据中该字段为空
    relatedPrepareTableId: "", // 原始数据中该字段为空
};
const ddd = FinalEditionDutyRowClip(dutyRecord);
// console.log(ddd);

// try {
//     const result = FinalEditionDutyRowClip(dutyRecord);
//     console.log("✅ 切割成功！共切分为", result.length, "段：");
//     console.table(
//         result.map((r) => ({
//             start: r.start,
//             end: r.end,
//             type: r.type || "普通",
//             role: r.role || "-",
//         }))
//     );
// } catch (err) {
//     console.error("❌ 运行出错:", err.message);
// }
