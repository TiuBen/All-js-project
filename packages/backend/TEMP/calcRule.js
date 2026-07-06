const CalculationRules = {
    //! 所有席位的时间(管制的)
    totalTime: {
        filter: {
            // 包含所有管制相关岗位
            position: [
                "西塔台",
                "东塔台",
                "西地面",
                "东地面",
                "地面",
                "放行",
                "西放行",
                "东放行",
                "综合协调",
                "领班",
                "带班主任",
                "流控",
                "进近高扇",
                "进近低扇",
            ],
        },
        name: "总小时",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    //! 领班时间
    totalCommanderTime: {
        filter: {
            position: ["带班主任", "领班"],
        },
        name: "带班主任席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },

    totalTowerMainTime: {
        filter: {
            position: ["东塔台", "西塔台"],
            dutyType: ["主班"],
        },
        name: "塔台管制席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalTowerSubTime: {
        filter: {
            position: ["东塔台", "西塔台"],
            dutyType: ["副班"],
        },
        name: "塔台协调席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalGroundTime: {
        filter: {
            position: ["西地面", "东地面", "地面"],
        },
        name: "地面席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalDeliveryTime: {
        filter: {
            position: ["放行", "东放行", "西放行"],
        },
        name: "放行席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    //! 教员时间 *************** 去掉了
    totalTeacherTime: {
        filter: {
            position: [
                "西塔台",
                "东塔台",
                "西地面",
                "东地面",
                "地面",
                "放行",
                "西放行",
                "东放行",
                "综合协调",
                "带班主任",
                "流控",
                "进近高扇",
                "进近低扇",
            ],
        },
        operator: ["roleStartTime", "roleEndTime"],
        name: "教员",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalStudentTime: {
        filter: {
            position: [
                "西塔台",
                "东塔台",
                "西地面",
                "东地面",
                "地面",
                "放行",
                "西放行",
                "东放行",
                "综合协调",
                "领班",
                "带班主任",
                "流控",
                "进近高扇",
                "进近低扇",
            ],
        },
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
                "领班",
            ],
        },
        name: "管制席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalZongheTime: {
        filter: {
            position: ["综合协调"],
        },
        name: "管制综合协调席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalAOCTime: {
        filter: {
            position: ["航班调度席", "生产调度席"],
        },
        name: "现场调度席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
};

module.exports = { CalculationRules };
