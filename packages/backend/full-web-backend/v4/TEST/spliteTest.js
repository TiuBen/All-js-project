const { FinalEditionDutyRowClip } = require("../utils/util/clipDutyRow");
const { calculateStatistics } = require("../utils/util/sumDutyRow");
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
const dutyRecord8 = [
    {
        id: 20234,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-05-31 22:27:20",
        outTime: "2026-06-01 03:15:43",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20324,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-03 12:56:11",
        outTime: "2026-06-03 19:06:40",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20333,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-03 22:57:31",
        outTime: "2026-06-04 02:54:17",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20355,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-04 12:57:27",
        outTime: "2026-06-04 19:03:00",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20447,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-07 08:30:52",
        outTime: "2026-06-07 13:03:24",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20463,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-07 19:00:30",
        outTime: "2026-06-07 22:36:28",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20480,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-08 06:57:34",
        outTime: "2026-06-08 10:03:08",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20490,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-08 14:21:00",
        outTime: "2026-06-08 17:38:01",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20518,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-09 06:57:03",
        outTime: "2026-06-09 08:32:41",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20614,
        userId: 3,
        username: "董志华",
        position: "西塔台",
        dutyType: "主班",
        inTime: "2026-06-12 03:16:45",
        outTime: "2026-06-12 05:27:43",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20646,
        userId: 3,
        username: "董志华",
        position: "放行",
        dutyType: null,
        inTime: "2026-06-13 03:06:25",
        outTime: "2026-06-13 05:17:31",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20737,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-15 22:29:13",
        outTime: "2026-06-16 03:18:25",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20759,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-16 12:57:59",
        outTime: "2026-06-16 15:25:32",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20764,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-16 15:42:38",
        outTime: "2026-06-16 18:40:16",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20779,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-17 03:08:06",
        outTime: "2026-06-17 07:06:55",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20869,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-19 22:28:22",
        outTime: "2026-06-20 03:15:12",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20913,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-21 03:06:42",
        outTime: "2026-06-21 07:04:36",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20980,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-23 08:28:47",
        outTime: "2026-06-23 12:58:48",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20994,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-23 18:29:11",
        outTime: "2026-06-23 20:48:33",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 20998,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-23 21:05:17",
        outTime: "2026-06-23 22:39:53",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 21011,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-24 07:01:42",
        outTime: "2026-06-24 12:57:44",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 21035,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-24 22:30:29",
        outTime: "2026-06-25 03:16:29",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 21126,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-27 12:29:43",
        outTime: "2026-06-27 15:35:26",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
    {
        id: 21134,
        userId: 3,
        username: "董志华",
        position: "领班",
        dutyType: null,
        inTime: "2026-06-27 18:30:03",
        outTime: "2026-06-27 22:37:55",
        roleType: null,
        relatedDutyTableRowId: null,
        roleStartTime: null,
        roleEndTime: null,
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
];
const ddd = dutyRecord8.flatMap((x) => FinalEditionDutyRowClip(x));
console.dir(ddd, { depth: null });

const ttt = calculateStatistics(ddd);
console.dir(ttt, { depth: null });

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
