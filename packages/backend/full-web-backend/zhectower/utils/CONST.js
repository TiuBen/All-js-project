const server = "http://localhost:3104";

const serverActions = {
    GetWhoIsOnDuty: "GetWhoIsOnDuty",
    GetWhoIsPrepared: "GetWhoIsPrepared",
    TakeOverTheJob: "TakeOverTheJob",
    PrepareForTheJob: "PrepareForTheJob",
    GetThisPosition: "GetThisPosition",
};

const usernames = [
    "巴富毅",
    "刘琦",
    "金鼎",
    "李秋实",
    "明嘉",
    "边昊",
    "温若春",
    "李明",
    "刘国莲",
    "胡鑫",
    "黄恩",
    "叶大鹏",
    "潘伟生",
    "周岸",
    "张文中",
    "张虎",
    "王建超",
    "吴疆",
    "张宗根",
    "王风瑞",
    "杜涛",
    "耿若岩",
    "邓心豪",
    "蔡昊霖",
    "张笑延",
    "严亮",
    "詹泽彬",
    "姜文夫",
    "宋天霖",
    "董志华",
    "郭永杰",
    "朱永春",
    "沈宁",
    "马莲花",
    "徐万友",
    "蓝宇航",
    "郑文卓",
    "陈宏伟",
    "蒋露裕",
    "程卓",
];

const Positions = [
    "带班主任",
    "放行",
    "地面",
    "综合协调",

    "西塔台",
    "西地面",
    "西放行",
    "东塔台",
    "东地面",
    "东放行",
    "领班",
    "流控",
    "进近高扇",
    "进近低扇",
];

const usernamesRow0 = ["巴富毅", "刘琦"];
const usernamesRow1 = [
    "姜文夫",
    "董志华",
    "金鼎",
    "徐万友",
    "马莲花",
    "李秋实",
    "明嘉",
    "温若春",
    "张虎",
    "李明",
    "刘国莲",
    "周岸",
    "杜涛",
    "张笑延",
    "耿若岩",
    "张文中",
    "詹泽彬",
];
const usernamesRow2 = [
    "朱永春",
    "郭永杰",
    "吴疆",
    "边昊",
    "胡鑫",
    "黄恩",
    "叶大鹏",
    "张宗根",
    "潘伟生",
    "王建超",
    "王风瑞",
    "邓心豪",
    "蔡昊霖",
    "严亮",
    "宋天霖",
    "沈宁",
];
const usernamesRow3 = ["蓝宇航", "郑文卓", "陈宏伟", "蒋露裕", "程卓"];

const OrderedUsername = [usernamesRow0, usernamesRow1, usernamesRow2, usernamesRow3];

const PositionsWithDutyType = [
    { id: 0, position: "西塔台", dutyType: ["主班", "副班"], display: true },
    { id: 1, position: "西地面", dutyType: ["主班", "副班"], display: false },
    { id: 2, position: "西放行", dutyType: ["主班", "副班"], display: false },
    { id: 3, position: "进近高扇", dutyType: ["主班", "副班"], display: false },
    { id: 4, position: "进近低扇", dutyType: ["主班", "副班"], display: false },
    { id: 5, position: "东塔台", dutyType: ["主班", "副班"], display: true },
    { id: 6, position: "东地面", dutyType: ["主班", "副班"], display: false },
    { id: 7, position: "东放行", dutyType: ["主班", "副班"], display: false },
    { id: 8, position: "领班", display: true },
    { id: 9, position: "流控", display: false },
    { id: 10, position: "放行", display: true },
    { id: 11, position: "综合协调", display: true },
    { id: 12, position: "地面", dutyType: ["主班", "副班"], display: true },
];

const RoleTypes=[
    "主班","副班","教员","见习"
]


const AllSumTimeWithFilter = {
    totalTime: 0,
    totalCommanderTime: {
        filter: {
            position: ["带班主任","领班"],
            dutyType: [null],
            roleType: [null],
            relatedDutyTableRowId: [null, "NOT NULL"],
        },
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalTeacherTime: {
        filter: {
            position: [
                "放行",
                "地面",
                "综合协调",
                "西塔台",
                "西地面",
                "西放行",
                "东塔台",
                "东地面",
                "东放行",
                "流控",
                "进近高扇",
                "进近低扇",
            ],
            dutyType: ["主班", "副班", null],
            roleType: [null],
            relatedDutyTableRowId: ["NOT NULL"],
        },
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalTowerTime: {
        filter: {
            position: ["东塔台", "西塔台"],
            dutyType: ["主班", "副班"],
            roleType: [null],
            relatedDutyTableRowId: [null],
        },

        dayShift: 0,
        nightShift: 0,
    },
    totalTowerMainTime: {
        filter: {
            position: ["东塔台", "西塔台"],
            dutyType: ["主班"],
            roleType: [null],
            relatedDutyTableRowId: [null],
        },

        dayShift: 0,
        nightShift: 0,
    },
    totalTowerSubTime: {
        filter: {
            position: ["东塔台", "西塔台"],
            dutyType: ["副班"],
            roleType: [null],
            relatedDutyTableRowId: [null],
        },
        dayShift: 0,
        nightShift: 0,
    },
    totalGroundTime: {
        filter: {
            position: ["西地面", "东地面", "地面"],
            dutyType: ["主班", "副班", null],
            roleType: [null],
            relatedDutyTableRowId: [null],
        },
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalDeliveryTime: {
        filter: {
            position: ["放行", "东放行", "西放行"],
            dutyType: ["主班", "副班", null],
            roleType: [null],
            relatedDutyTableRowId: [null],
        },
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },

    totalStudentTime: {
        filter: {
            position: Positions.filter((x) => {
                return x !== "领班" && x != "带班主任";
            }),
            dutyType: ["主班", "副班", null],
            roleType: ["见习"],
            relatedDutyTableRowId: [null],
        },
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalPositionTime: {
        filter: {
            position: [
                "放行",
                "地面",
                "综合协调",
                "西塔台",
                "西地面",
                "西放行",
                "东塔台",
                "东地面",
                "东放行",
                "流控",
                "进近高扇",
                "进近低扇",
            ],

            dutyType: ["主班", "副班", null],
            roleType: [null],
            relatedDutyTableRowId: [null],
        },
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalZongheTime: {
        filter: {
            position: ["综合协调"],
            dutyType: [null],
            roleType: [null],
            relatedDutyTableRowId: [null],
        },
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalAOCTime: {
        filter: {
            position: ["航班调度席","生产调度席"],
            dutyType: [null],
            roleType: [null],
            relatedDutyTableRowId: [null],
        },
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
};

module.exports = {
    server,
    serverActions,
    Positions,
    PositionsWithDutyType,
    usernames,
    OrderedUsername,
    AllSumTimeWithFilter,
    RoleTypes
};
