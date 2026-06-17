// SELECT DISTINCT position FROM duty ;
// 西塔台
// 西地面
// 领班
// 西放行
// 进近高扇
// 进近低扇
// 东塔台
// 东放行
// 流控
// 东地面
// 综合协调
// 地面
// 放行
// 航班调度席
// 生产调度席=================现场调度

// filter 如国没有 position dutyType roleType relatedDutyTableRowId
// ! 如果没有某项 则表示 任何 该项的值 都可以

// 带班主任席
// 塔台管制席
// 塔台协调席
// 放行席
// 地面席
// 综合协调席
// 现场调度席
// 见习
// 教员

// 所有 duty row 的属性 都可以 当作 filter 使用
// dutyType 主班 副班
// roleType 教员 见习
//  如果 【null】 则表示 需要 该项为 null
// 特别注意 如果  没有 某个 属性 则 表示 该filter.属性 不考虑
const CalculationRules = {
    //! 所有席位的时间(管制的)
    totalTime: {
        filter: {
        },
        operator: ["inTime", "outTime"],
        name: "总小时",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    //! 领班时间
    totalCommanderTime: {
        filter: {
            position: ["带班主任", "领班"],
            roleType: [null],//排除 见习人员的时间
        },
        operator: ["inTime", "outTime"],
        name: "带班主任席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalTowerTime: {
        filter: {
            position: ["东塔台", "西塔台"],
            roleType: [null],//排除 见习人员的时间
        },
        operator: ["inTime", "outTime","needExcludeTime"],
        name: "塔台席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalTowerMainTime: {
        filter: {
            position: ["东塔台", "西塔台"],
            dutyType: ["主班"],
            roleType: [null],
        },
        operator: ["inTime", "outTime","needExcludeTime"],
        name: "塔台管制席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalTowerSubTime: {
        filter: {
            position: ["东塔台", "西塔台"],
            dutyType: ["副班"],
            roleType: [null],
        },
        operator: ["inTime", "outTime","needExcludeTime"],
        name: "塔台协调席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalGroundTime: {
        filter: {
            position: ["西地面", "东地面", "地面"],
            // dutyType: ["主班", "副班", null],
            roleType: [null],
        },
        operator: ["inTime", "outTime","needExcludeTime"],
        name: "地面席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalDeliveryTime: {
        filter: {
            position: ["放行", "东放行", "西放行"],
            // dutyType: ["主班", "副班", null],
            roleType: [null],
            // relatedDutyTableRowId: [null],
        },
        operator: ["inTime", "outTime","needExcludeTime"],
        name: "放行席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    //! 教员时间 *************** 去掉了
    totalTeacherTime: {
        filter: {
            roleType: ["教员"],
            // relatedDutyTableRowId: ["NOT NULL"],
        },
        operator: ["roleStartTime", "roleEndTime"],
        name: "教员",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalStudentTime: {
        filter: {
            // position: [
            //     "放行",
            //     "地面",
            //     "综合协调",
            //     "西塔台",
            //     "西地面",
            //     "西放行",
            //     "东塔台",
            //     "东地面",
            //     "东放行",
            //     "流控",
            //     "进近高扇",
            //     "进近低扇",
            // ],
            // dutyType: ["主班", "副班", null],
            roleType: ["见习"],
            // relatedDutyTableRowId: [null],
        },
        operator: ["inTime", "outTime"],
        name: "见习",
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

            // dutyType: ["主班", "副班", null],
            roleType: [null],
            // relatedDutyTableRowId: [null],
        },
        operator: ["inTime", "outTime","needExcludeTime"],
        name: "管制席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalZongheTime: {
        filter: {
            position: ["综合协调"],
        },
        operator: ["inTime", "outTime"],
        name: "管制综合协调席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalAOCTime: {
        filter: {
            position: ["航班调度席", "生产调度席"],
        },
        operator: ["inTime", "outTime"],
        name: "现场调度席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
};

module.exports = { CalculationRules };
