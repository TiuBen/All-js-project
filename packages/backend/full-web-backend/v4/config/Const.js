const Tower_POSITIONS = ["东塔台", "西塔台"];
const Ground_POSITIONS = ["东地面", "西地面", "地面"];
const Delivery_POSITIONS = ["东放行", "西放行", "放行"];
const App_POSITIONS = ["进近高扇", "进近低扇"];
const Leader_POSITIONS = ["流控", "领班"];

const AOC_POSITIONS = ["综合协调"];
const DD_POSITIONS = ["航班调度席", "生产调度席"];

const RULES = {
    MAX_CONSECUTIVE_HOURS: 10,
    MAX_24H_CUMULATIVE_HOURS: 10,
    REST_HOURS_AFTER_10H: 8,
    MAX_WEEKLY_HOURS: 40,
    MAX_POSITION_CONSECUTIVE_HOURS: 6,
    MIN_POSITION_BREAK_MINUTES: 30,
};

const CalcRule = {
    totalTime: {
        filter: {
            position: [
                ...Tower_POSITIONS,
                ...Ground_POSITIONS,
                ...Delivery_POSITIONS,
                ...Leader_POSITIONS,
                ...AOC_POSITIONS,
                ...DD_POSITIONS,
            ],
        },
        name: "总小时",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalCommanderTime: {
        filter: {
            position: Leader_POSITIONS,
        },
        name: "总小时",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalTowerMainTime: {
        filter: {
            position: Tower_POSITIONS,
            dutyType: ["主班"],
        },
        name: "塔台管制席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalTowerSubTime: {
        filter: {
            position: Tower_POSITIONS,
            dutyType: ["副班"],
        },
        name: "塔台协调席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalDeliveryTime: {
        filter: {
            position: Delivery_POSITIONS,
        },
        name: "放行席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalGroundTime: {
        filter: {
            position: Ground_POSITIONS,
        },
        name: "地面席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalAOCTime: {
        filter: {
            position: AOC_POSITIONS,
        },
        name: "管制综合协调席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
    totalDDTime: {
        filter: {
            position: DD_POSITIONS,
        },
        name: "现场调度席",
        time: 0,
        dayShift: 0,
        nightShift: 0,
    },
};
