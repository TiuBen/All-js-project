const {
    calculateMonthlyNightShiftCount,
    fromDutyDbGetData,
    calDurationV3,
    checkRule,
    calculatePositionSummary,
    calculate,
} = require("../utils/index");
const { CalculationRules } = require("../config/CalculationRules");
const { DutyDb } = require("../config/sqliteDb.js");

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

function _queryDutyByMonth(userId, year, month) {
    console.log(year, month);
    const firstDay = dayjs()
        .year(year)
        .month(month - 1)
        .startOf("month");

    const monthStart = firstDay.startOf("day");
    const monthEnd = firstDay.endOf("month").endOf("day");

    console.log(monthStart.format("YYYY-MM-DD HH:mm:ss"));

    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM duty WHERE userId = ? AND inTime <= DATETIME(?)  AND outTime >= DATETIME(?) `;
        const params = [userId, monthEnd.format("YYYY-MM-DD HH:mm:ss"), monthStart.format("YYYY-MM-DD HH:mm:ss")];
        console.log(sql);
        console.log(params);
        // const sql = `SELECT * FROM duty WHERE userId = ?`;
        // const params = [userId];
        DutyDb.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows || []);
        });
    });
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
        console.log("================== service getNightCount called with year and month: ==================");
        console.log("year" + year, "month" + month);
        return calculateMonthlyNightShiftCount(year, month);
    },

    // 时长检查
    async checkDuration(userId, year, month) {
        const allRecords = await _queryDutyByMonth(userId, year, month);
        console.log("checkDuration allRecords.length", allRecords.length);
        const result24hour = checkRule(allRecords, {
            windowHours: 24,
            thresholdHours: 10,
            mergeGapMinutes: 30,
            removeGapHours: 8, // 没有则传 null
        });
        const result7day = checkRule(allRecords, {
            windowHours: 168,
            thresholdHours: 40,
            mergeGapMinutes: 30,
        });

        return {
            hasViolation: result24hour.some((item) => item.hasOvertime) || result7day.some((item) => item.hasOvertime),

            result24hour,

            result7day,
        };
    },

    async getPositionSummary(year, month) {
        console.log("=====service getPositionSummary");

        return await calculatePositionSummary(year, month);
    },

    async getDurationStatisticsByUserIdV2(userId, startTime, endTime) {
        console.log("=====service getDurationStatisticsByUse======================");

        return await calculate({ userId, startTime, endTime });
    },
};

module.exports = statisticsService;
