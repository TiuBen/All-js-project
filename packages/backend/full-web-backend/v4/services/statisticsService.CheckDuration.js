const { queryDuty } = require("../utils/queryDuty");
const { checkRule } = require("../utils/util/checkV3");

//!  这里有点问题，可能需要再改
async function checkDuration(userId, year, month, inTime, outTime) {
    // console.log("================== Service checkDuration called with year and month: ==================");

    const dutyRows = await queryDuty({ userId, inTime, outTime });
    // console.log("查询结果:", dutyRows.length);

    const result24hour = checkRule(dutyRows, {
        windowHours: 24,
        thresholdHours: 10,
        mergeGapMinutes: 30,
        removeGapHours: 8, // 没有则传 null
    });
    const result7day = checkRule(dutyRows, {
        windowHours: 168,
        thresholdHours: 40,
        mergeGapMinutes: 30,
    });

    return {
        hasViolation: result24hour.some((item) => item.hasOvertime) || result7day.some((item) => item.hasOvertime),

        result24hour,

        result7day,
    };
}

module.exports = { checkDuration };
