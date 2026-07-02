const ATC_POSITIONS = [
    "东塔台",
    "西塔台",
    "东地面",
    "西地面",
    "地面",
    "东放行",
    "西放行",
    "放行",
    "进近高扇",
    "进近低扇",
    "流控",
];

const RULES = {
    MAX_CONSECUTIVE_HOURS: 10,
    MAX_24H_CUMULATIVE_HOURS: 10,
    REST_HOURS_AFTER_10H: 8,
    MAX_WEEKLY_HOURS: 40,
    MAX_POSITION_CONSECUTIVE_HOURS: 6,
    MIN_POSITION_BREAK_MINUTES: 30,
};
