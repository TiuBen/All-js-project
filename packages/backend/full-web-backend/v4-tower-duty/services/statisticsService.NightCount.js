// ==========================================
// statisticsService.NightCountV2.js
// 当月夜班频次统计 V2
//
// 与 V1 的核心差异:
//   1. 统计窗口改为「当月 01 日 08:30:00 → 次月 01 日 08:30:00」
//      夜班周期是 d 日 18:00 → d+1 日 08:30,以 08:30 作为「天」的日界,
//      因此整月窗口整体右移 8.5 小时,才能完整覆盖月末最后一天夜班的
//      次日凌晨段(00:00-08:30),同时排除上月尾巴已结束的夜班。
//   2. month 按「自然月 1~12」解析(旧版误用 dayjs 0 基索引,导致错位一个月)。
//   3. 算法改为「先 queryDuty 一次性拉取窗口内记录 → 对记录数组循环,
//      按每条记录命中的夜班日进行统计」。
//   4. 支持 userId:传入则只统计该用户;不传则统计窗口内全部用户,
//      结果一律按 userId 分组返回。
// ==========================================
const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
dayjs.extend(minMax);

const NIGHT_SEGMENTS = [
    {
        name: "1800-2100",
        startHour: 18,
        startMinute: 0,
        endHour: 21,
        endMinute: 0,
        nextDay: false,
    },
    {
        name: "2100-2400",
        startHour: 21,
        startMinute: 0,
        endHour: 24,
        endMinute: 0,
        nextDay: false,
    },
    {
        name: "+1天0000-0830",
        startHour: 0,
        startMinute: 0,
        endHour: 8,
        endMinute: 30,
        nextDay: true,
    },
];

/**
 * 计算 [inTime, outTime] 与 [segStart, segEnd] 的重叠小时数(保留4位小数)
 */
function getOverlapHours(inTime, outTime, segStart, segEnd) {
    const overlapStart = dayjs.max(inTime, segStart);
    const overlapEnd = dayjs.min(outTime, segEnd);
    if (overlapEnd.isAfter(overlapStart)) {
        return parseFloat(overlapEnd.diff(overlapStart, "hour", true).toFixed(4));
    }
    return 0;
}

/** * ========================================================= * 根据 nightDate 构造实际夜班时间段 * ========================================================= * *
 * 例如： * * buildNightSegments("2026-05-01") * *
 * 返回： * * [ *
 * { * name: "1800-2100", * start: 2026-05-01 18:00, * end: 2026-05-01 21:00 * }, * * { * name: "2100-2400", * start: 2026-05-01 21:00, * end: 2026-05-02 00:00 * }, * * { * name: "+1天0000-0830", * start: 2026-05-02 00:00, * end: 2026-05-02 08:30 * } * ] */
function buildNightSegments(nightDate) {
    const date = dayjs(nightDate).startOf("day");
    return NIGHT_SEGMENTS.map((segment) => {
        const start = date
            .add(segment.startDay, "day")
            .hour(segment.startHour)
            .minute(segment.startMinute)
            .second(0)
            .millisecond(0);
        const end = date
            .add(segment.endDay, "day")
            .hour(segment.endHour)
            .minute(segment.endMinute)
            .second(0)
            .millisecond(0);
        return { name: segment.name, start, end };
    });
}
/**
 * 从结果中移除「没有任何具体考勤」的空日期
 */
function removeEmptyDates(result) {
    for (const userId in result) {
        const monthResult = result[userId];
        for (const key of Object.keys(monthResult)) {
            if (key === "summary") continue;
            const day = monthResult[key];
            if (Array.isArray(day["具体考勤"]) && day["具体考勤"].length === 0) {
                delete monthResult[key];
            }
        }
    }
    return result;
}

/**
 * 当月夜班统计(主入口)
 */

function calcNightCount(dutyRows) {
    if (!Array.isArray(dutyRows)) {
        return [];
    }

    const result = [];

    // =========================================================
    // 1. 先处理每一条 dutyRow
    // =========================================================
    for (const row of dutyRows) {
        const rIn = dayjs(row.inTime);
        const rOut = dayjs(row.outTime);

        // 单条记录时间非法
        if (!rIn.isValid() || !rOut.isValid() || !rIn.isBefore(rOut)) {
            result.push({
                ...row,
                night: [],
            });

            continue;
        }

        const night = [];

        // 从 inTime 所在日期的前一天开始检查
        //
        // 例如：
        // 2026-05-01 06:59
        //
        // 它属于：
        // 2026-04-30 的夜班
        //
        let nightDate = rIn.startOf("day").subtract(1, "day");

        // 最后检查到 outTime 所在日期
        const lastNightDate = rOut.startOf("day");

        while (nightDate.isSame(lastNightDate) || nightDate.isBefore(lastNightDate)) {
            const nightSegments = buildNightSegments(nightDate);

            const nightItem = {
                nightBelongDate: nightDate.format("YYYY-MM-DD"),

                "1800-2100": 0,
                "2100-2400": 0,
                "+1天0000-0830": 0,

                夜班次数: 0,
                夜班段数: 0,
            };

            let hasOverlap = false;

            // ---------------------------------------------
            // 计算这条 duty 对这个夜班的三个时间段分别覆盖多少小时
            // ---------------------------------------------
            for (const segment of nightSegments) {
                const overlap = getOverlapHours(rIn, rOut, segment.start, segment.end);

                if (overlap > 0) {
                    hasOverlap = true;

                    nightItem[segment.name] = Number(overlap.toFixed(4));
                }
            }

            // ---------------------------------------------
            // 这个 nightBelongDate 确实有夜班时间
            // ---------------------------------------------
            if (hasOverlap) {
                nightItem["夜班次数"] =
                    nightItem["1800-2100"] > 0.7 || nightItem["2100-2400"] > 0.7 || nightItem["+1天0000-0830"] > 0.7
                        ? 1
                        : 0;

                nightItem["夜班段数"] =
                    (nightItem["1800-2100"] >= 0.75 ? 1 : 0) +
                    (nightItem["2100-2400"] >= 0.75 ? 1 : 0) +
                    (nightItem["+1天0000-0830"] >= 0.75 ? 1 : 0);

                night.push(nightItem);
            }

            nightDate = nightDate.add(1, "day");
        }

        result.push({
            ...row,
            night,
        });
    }

    // =========================================================
    // 2. 再次按照 nightBelongDate 合并
    // =========================================================
    //
    // 例如：
    //
    // duty 1:
    // night: [
    //   {
    //      nightBelongDate: "2026-05-01",
    //      "1800-2100": 0.5,
    //      "2100-2400": 0,
    //      "+1天0000-0830": 0
    //   }
    // ]
    //
    // duty 2:
    // night: [
    //   {
    //      nightBelongDate: "2026-05-01",
    //      "1800-2100": 0.4,
    //      "2100-2400": 1,
    //      "+1天0000-0830": 0
    //   }
    // ]
    //
    // 最终：
    //
    // {
    //    nightBelongDate: "2026-05-01",
    //    "1800-2100": 0.9,
    //    "2100-2400": 1,
    //    "+1天0000-0830": 0,
    //    夜班次数: 1,
    //    夜班段数: 2
    // }
    //
    // 注意：
    // 夜班次数、夜班段数必须在所有小时数合并完成以后重新计算。
    // =========================================================

    const nightMap = new Map();

    for (const row of result) {
        if (!Array.isArray(row.night)) {
            continue;
        }

        for (const nightItem of row.night) {
            const date = nightItem.nightBelongDate;

            if (!nightMap.has(date)) {
                nightMap.set(date, {
                    nightBelongDate: date,

                    "1800-2100": 0,
                    "2100-2400": 0,
                    "+1天0000-0830": 0,

                    夜班次数: 0,
                    夜班段数: 0,
                });
            }

            const merged = nightMap.get(date);

            merged["1800-2100"] += nightItem["1800-2100"] || 0;
            merged["2100-2400"] += nightItem["2100-2400"] || 0;
            merged["+1天0000-0830"] += nightItem["+1天0000-0830"] || 0;
        }
    }

    // =========================================================
    // 3. 合并完成后，重新计算 夜班次数 / 夜班段数
    // =========================================================

    for (const nightItem of nightMap.values()) {
        // 保留 4 位小数
        nightItem["1800-2100"] = Number(nightItem["1800-2100"].toFixed(4));

        nightItem["2100-2400"] = Number(nightItem["2100-2400"].toFixed(4));

        nightItem["+1天0000-0830"] = Number(nightItem["+1天0000-0830"].toFixed(4));

        // -----------------------------------------------------
        // 夜班次数
        //
        // 任意一个时间段累计 > 0.7 小时
        // 就算这个 nightBelongDate 有 1 次夜班
        // -----------------------------------------------------
        if (nightItem["1800-2100"] > 0.7 || nightItem["2100-2400"] > 0.7 || nightItem["+1天0000-0830"] > 0.7) {
            nightItem["夜班次数"] = 1;
        }

        // -----------------------------------------------------
        // 夜班段数
        //
        // 每个时间段累计 >= 0.75 小时
        // 就算 1 个夜班段
        // -----------------------------------------------------
        if (nightItem["1800-2100"] >= 0.75) {
            nightItem["夜班段数"]++;
        }

        if (nightItem["2100-2400"] >= 0.75) {
            nightItem["夜班段数"]++;
        }

        if (nightItem["+1天0000-0830"] >= 0.75) {
            nightItem["夜班段数"]++;
        }
    }

    // =========================================================
    // 4. 返回
    // =========================================================
    //
    // 如果你最终只需要“合并后的夜班统计”，直接：
    //
    // return [...nightMap.values()];
    //
    // 如果还需要保留每条 dutyRow，则 result 继续保留。
    // =========================================================

    return {
        dutyRows: result,
        night: [...nightMap.values()],
    };
}

module.exports = { calcNightCount };

// const { queryDuty } = require("../utils/queryDuty");
// const dayjs = require("dayjs");

// function getOverlapHours(inTime, outTime, segDate, startH, startM, endH, endM) {
//     let segmentStart = dayjs(`${segDate} ${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`);
//     let segmentEnd;
//     if (endH === 24) {
//         segmentEnd = dayjs(`${segDate} 00:00:00`).add(1, "day");
//     } else {
//         segmentEnd = dayjs(`${segDate} ${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`);
//     }

//     const overlapStart = dayjs.max(inTime, segmentStart);
//     const overlapEnd = dayjs.min(outTime, segmentEnd);

//     if (overlapEnd.isAfter(overlapStart)) {
//         return parseFloat(overlapEnd.diff(overlapStart, "hour", true).toFixed(4));
//     }
//     return 0;
// }

// // remove 函数：移除具体考勤为空数组的日期
// function remove(result) {
//     for (const userId in result) {
//         const monthResult = result[userId];

//         for (const key of Object.keys(monthResult)) {
//             if (key === "summary") continue;

//             const day = monthResult[key];

//             if (
//                 // day["1800-2100"] === 0 &&
//                 // day["2100-2400"] === 0 &&
//                 // day["+1天0000-0830"] === 0 &&
//                 // day["夜班次数"] === 0 &&
//                 // day["夜班段数"] === 0 &&
//                 Array.isArray(day["具体考勤"]) &&
//                 day["具体考勤"].length === 0
//             ) {
//                 delete monthResult[key];
//             }
//         }
//     }

//     return result;
// }

// //!  这里有点问题，可能需要再改
// async function calcNightCount({ year, month, inTime, outTime, userId }) {
//     console.log("================== Service GetNightCount called with year and month: ==================");

//     console.log("================== Service GetNightCount ==", { year, month, inTime, outTime });

//     const dutyRows = await queryDuty({ inTime, outTime, userId });
//     console.log("查询结果:", dutyRows.length);
//     console.log("查询结果:", dutyRows[2]);
//     // ========= 第一步：按 userId 分组 =========

//     const userMap = {};
//     for (const row of dutyRows) {
//         if (!userMap[row.userId]) {
//             userMap[row.userId] = [];
//         }
//         userMap[row.userId].push(row);
//     }

//     // console.log("分组结果:", userMap);
//     // ========= 第二步：统计所有用户 =========

//     const result = {};

//     const daysInMonth = dayjs().year(year).month(month).date(1).daysInMonth();

//     for (const userId in userMap) {
//         const rows = userMap[userId];

//         const monthResult = {};

//         for (let d = 1; d <= daysInMonth; d++) {
//             const date = dayjs().year(year).month(month).date(d).format("YYYY-MM-DD");
//             const nextDay = dayjs(date).add(1, "day").format("YYYY-MM-DD");

//             const dayResult = {
//                 "1800-2100": 0,
//                 "2100-2400": 0,
//                 "+1天0000-0830": 0,
//                 夜班次数: 0,
//                 夜班段数: 0,
//                 具体考勤: [],
//             };

//             for (const row of rows) {
//                 const inTime = dayjs(row.inTime);
//                 const outTime = dayjs(row.outTime);

//                 const nightStart = dayjs(`${date} 18:00:00`);
//                 const nightEnd = dayjs(`${nextDay} 08:30:00`);

//                 if (inTime.isAfter(nightEnd) || outTime.isBefore(nightStart)) continue;

//                 dayResult["1800-2100"] += getOverlapHours(inTime, outTime, date, 18, 0, 21, 0);
//                 dayResult["2100-2400"] += getOverlapHours(inTime, outTime, date, 21, 0, 24, 0);
//                 dayResult["+1天0000-0830"] += getOverlapHours(inTime, outTime, nextDay, 0, 0, 8, 30);

//                 dayResult["具体考勤"].push({
//                     id: row.id,
//                     userId: row.userId,
//                     username: row.username,
//                     position: row.position,
//                     dutyType: row.dutyType,
//                     inTime: row.inTime,
//                     outTime: row.outTime,
//                     roleType: row.roleType,
//                     relatedDutyTableRowId: row.relatedDutyTableRowId,
//                     roleStartTime: row.roleStartTime,
//                     roleEndTime: row.roleEndTime,
//                     roleTimes: row.roleTimes,
//                     status: row?.status,
//                     relatedPrepareTableId: row?.relatedPrepareTableId,
//                     date,
//                     dayShift: row?.dayShift,
//                     nightShift: row?.nightShift,
//                 });
//             }

//             if (dayResult["1800-2100"] > 0.7 || dayResult["2100-2400"] > 0.7 || dayResult["+1天0000-0830"] > 0.7) {
//                 dayResult["夜班次数"] = 1;
//             }

//             let grade = 0;
//             if (dayResult["1800-2100"] >= 0.75) grade++;
//             if (dayResult["2100-2400"] >= 0.75) grade++;
//             if (dayResult["+1天0000-0830"] >= 0.75) grade++;

//             dayResult["夜班段数"] = grade;

//             monthResult[date] = dayResult;
//         }

//         let totalNightCount = 0;
//         let totalNightSegments = 0;

//         for (const dateKey in monthResult) {
//             totalNightCount += monthResult[dateKey]["夜班次数"];
//             totalNightSegments += monthResult[dateKey]["夜班段数"];
//         }

//         monthResult.summary = {
//             夜班次数: totalNightCount,
//             夜班段数: totalNightSegments,
//         };

//         result[userId] = monthResult;
//     }

//     return remove(result);
// }

// module.exports = { calcNightCount };
