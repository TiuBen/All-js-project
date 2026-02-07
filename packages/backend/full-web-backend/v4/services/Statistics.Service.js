const BaseService = require("./Base.Service");
const { UserDb, DutyDb } = require("../config/sqliteDb.js");
const { CalculationRules } = require("../config/CalculationRules.js");

const { calculateNightShifts } = require("../utils/calculateNightShifts");
const { calDurationV3 } = require("../utils/calculateDuration");
const { fromDutyDbGetData, useDutyDataGetRelatedTeachData } = require("../utils/fromDutyDbGetData");
const dayjs = require("dayjs");

function removeKeys(obj, keys) {
    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => {
            if (value && typeof value === "object" && !Array.isArray(value)) {
                // 解构去掉指定的 keys
                const cleaned = Object.fromEntries(Object.entries(value).filter(([k]) => !keys.includes(k)));
                return [key, cleaned];
            }
            return [key, value];
        })
    );
}

// ! 用这个来 变成 姓名	18:00-21:00	21:00-24:00	+1天00:00-08:30	18点-次日次数	总次数/补贴
function formate(month, nightShiftData) {
    let bySlot = {};
    for (const [username, values] of Object.entries(nightShiftData)) {
        if (!bySlot[username]) {
            bySlot[username] = {
                // "2025-01": {
                //     "1800-2100": 0,
                //     "2100-2400": 0,
                //     "+1天0000-0830": 0,
                // },
            };
            bySlot[username][month] = {
                "1800-2100": 0,
                "2100-2400": 0,
                "+1天0000-0830": 0,
            };
        }

        for (const [key, x] of Object.entries(values)) {
            console.log(key.slice(0, 7));
            if (key.slice(0, 7) === month) {
                console.log(x);

                if (x["1800-2100"] >= 0.01) {
                    bySlot[username][month]["1800-2100"] += 1;
                }
                if (x["2100-2400"] >= 0.01) {
                    bySlot[username][month]["2100-2400"] += 1;
                }
                if (x["+1天0000-0830"] >= 0.01) {
                    bySlot[username][month]["+1天0000-0830"] += 1;
                }
            } else {
                // console.log(username);
                // console.log(values);
                // console.log(key);
                // console.log(x);
            }
        }
    }
    return bySlot;
}

class StatisticsService extends BaseService {
    constructor() {
        super("duty", DutyDb);
    }

    async getAll(query) {
        return {};
    }

    async getDurationStatisticsByUserId(id, query) {
        

        const userDutyData = await fromDutyDbGetData({ ...query, userId: id });
        // console.log(userDutyData);
        const { startDate, startTime, endDate, endTime } = query;

        const startDateTime = new dayjs(`${startDate} ${startTime}`, "YYYY-MM-DD HH:mm:ss");
        const endDateTime = new dayjs(`${endDate} ${endTime}`, "YYYY-MM-DD HH:mm:ss");

        const timeStatistics = calDurationV3(userDutyData, CalculationRules, startDateTime, endDateTime);
        // console.log(timeStatistics);
        // 在这里去掉 不要 的 filter operator 属性
        const cleaned = removeKeys(timeStatistics, ["filter", "operator"]);
        return cleaned;
        // return timeStatistics;
    }

    async getNightShiftCountStatisticsByUserId(id, query) {
        // console.log("getNightShiftCountStatisticsByUser");
        const userDutyData = await fromDutyDbGetData({ ...query, userId: id });

        const nightShiftStatistics = calculateNightShifts(userDutyData);
        return nightShiftStatistics;
    }

    // // ! 这个 用来获取  按 时间段 分类的 夜班次数 统计
    // async getNightShiftCountStatisticsByUserAndReturnBySlot(id, query) {
    //     console.log("getNightShiftCountStatisticsByUserAnd       ReturnBySlot");
    //     const userDutyData = await fromDutyDbGetData({ ...query, userId: id }, DutyDb);

    //     const nightShiftStatistics = calculateUserNightSlots(userDutyData);
    //     return nightShiftStatistics;
    //     // const { startDate } = query;
    //     // const YYYYMM = dayjs(startDate, "YYYY-MM-DD").format("YYYY-MM");
    //     // return formate(YYYYMM, nightShiftStatistics);
    // }

    // async getTeachTimeStatisticsByUser(id, query) {
    //     //console.log("StatisticsService getTeachTimeStatisticsByUser");
    //     //console.log({ ...query, userId: id });
    //     const userDutyData = await fromDutyDbGetData({ ...query, userId: id }, DutyDb);
    //     const userTeachDutyData = await useDutyDataGetRelatedTeachData(userDutyData, DutyDb);
    //     const calRule = {
    //         totalTeacherTime: {
    //             filter: {},
    //             name: "教员",
    //             time: 0,
    //             dayShift: 0,
    //             nightShift: 0,
    //         },
    //     };
    //     const teachTimeStatistics = calDuration(userTeachDutyData, calRule);

    //     return teachTimeStatistics;
    // }
}

module.exports = StatisticsService;
