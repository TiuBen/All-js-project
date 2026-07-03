const { calculateMonthlyNightShiftCount, fromDutyDbGetData, calDurationV3 } = require("../utils/index");
const { CalculationRules } = require("../config/CalculationRules");
const dayjs = require("dayjs");

function removeKeys(obj, keys) {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            if (value && typeof value === "object" && !Array.isArray(value)) {
                const cleaned = Object.fromEntries(Object.entries(value).filter(([k]) => !keys.includes(k)));
                return [key, cleaned];
            }
            return [key, value];
        })
    );
}

const statisticsService = {
    async getDurationStatisticsByUserId(query) {
        console.log("service" + query);
        const { startDate, startTime, endDate, endTime } = query;
        const userDutyData = await fromDutyDbGetData({ ...query }); //! 这个没有对 userId 进行过滤，应该在 query 中传入 userId

        const startDateTime = new dayjs(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm:ss");
        const endDateTime = new dayjs(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm:ss");

        const timeStatistics = calDurationV3(userDutyData, CalculationRules, startDateTime, endDateTime);
        const cleaned = removeKeys(timeStatistics, ["filter", "operator"]);
        return cleaned;
    },

    // async getNightShiftCountStatisticsByUserId(query) {
    //     const userDutyData = await fromDutyDbGetData({ ...query });

    //     const nightShiftStatistics = calculateNightShifts(userDutyData);
    //     return nightShiftStatistics;
    // },

    // 获取夜班个数
    async getNightCount(year, month) {
        return calculateMonthlyNightShiftCount(year, month);
    },
};

module.exports = statisticsService;
