const { queryDuty } = require("../utils/queryDuty");

function getOverlapHours(inTime, outTime, segDate, startH, startM, endH, endM) {
    let segmentStart = dayjs(`${segDate} ${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}:00`);
    let segmentEnd;
    if (endH === 24) {
        segmentEnd = dayjs(`${segDate} 00:00:00`).add(1, "day");
    } else {
        segmentEnd = dayjs(`${segDate} ${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`);
    }

    const overlapStart = dayjs.max(inTime, segmentStart);
    const overlapEnd = dayjs.min(outTime, segmentEnd);

    if (overlapEnd.isAfter(overlapStart)) {
        return parseFloat(overlapEnd.diff(overlapStart, "hour", true).toFixed(4));
    }
    return 0;
}

// remove 函数：移除具体考勤为空数组的日期
function remove(result) {
    for (const userId in result) {
        const monthResult = result[userId];

        for (const key of Object.keys(monthResult)) {
            if (key === "summary") continue;

            const day = monthResult[key];

            if (
                // day["1800-2100"] === 0 &&
                // day["2100-2400"] === 0 &&
                // day["+1天0000-0830"] === 0 &&
                // day["夜班次数"] === 0 &&
                // day["夜班段数"] === 0 &&
                Array.isArray(day["具体考勤"]) &&
                day["具体考勤"].length === 0
            ) {
                delete monthResult[key];
            }
        }
    }

    return result;
}

//!  这里有点问题，可能需要再改
async function calcNightCount({ year, month, inTime, outTime }) {
    console.log("================== Service GetNightCount called with year and month: ==================");

    const dutyRows = await queryDuty({ inTime, outTime });
    console.log("查询结果:", dutyRows.length);
    // ========= 第一步：按 userId 分组 =========

    const userMap = {};
    for (const row of dutyRows) {
        if (!userMap[row.userId]) {
            userMap[row.userId] = [];
        }
        userMap[row.userId].push(row);
    }

    // ========= 第二步：统计所有用户 =========

    const result = {};

    const daysInMonth = dayjs().year(year).month(month).date(1).daysInMonth();

    for (const userId in userMap) {
        const rows = userMap[userId];

        const monthResult = {};

        for (let d = 1; d <= daysInMonth; d++) {
            const date = dayjs().year(year).month(month).date(d).format("YYYY-MM-DD");
            const nextDay = dayjs(date).add(1, "day").format("YYYY-MM-DD");

            const dayResult = {
                "1800-2100": 0,
                "2100-2400": 0,
                "+1天0000-0830": 0,
                夜班次数: 0,
                夜班段数: 0,
                具体考勤: [],
            };

            for (const row of rows) {
                const inTime = dayjs(row.inTime);
                const outTime = dayjs(row.outTime);

                const nightStart = dayjs(`${date} 18:00:00`);
                const nightEnd = dayjs(`${nextDay} 08:30:00`);

                if (inTime.isAfter(nightEnd) || outTime.isBefore(nightStart)) continue;

                dayResult["1800-2100"] += getOverlapHours(inTime, outTime, date, 18, 0, 21, 0);
                dayResult["2100-2400"] += getOverlapHours(inTime, outTime, date, 21, 0, 24, 0);
                dayResult["+1天0000-0830"] += getOverlapHours(inTime, outTime, nextDay, 0, 0, 8, 30);

                dayResult["具体考勤"].push({
                    id: row.id,
                    userId: row.userId,
                    username: row.username,
                    position: row.position,
                    dutyType: row.dutyType,
                    inTime: row.inTime,
                    outTime: row.outTime,
                    roleType: row.roleType,
                    relatedDutyTableRowId: row.relatedDutyTableRowId,
                    roleStartTime: row.roleStartTime,
                    roleEndTime: row.roleEndTime,
                    roleTimes: row.roleTimes,
                    status: row?.status,
                    relatedPrepareTableId: row?.relatedPrepareTableId,
                    date,
                    dayShift: row?.dayShift,
                    nightShift: row?.nightShift,
                });
            }

            if (dayResult["1800-2100"] > 0.7 || dayResult["2100-2400"] > 0.7 || dayResult["+1天0000-0830"] > 0.7) {
                dayResult["夜班次数"] = 1;
            }

            let grade = 0;
            if (dayResult["1800-2100"] >= 0.75) grade++;
            if (dayResult["2100-2400"] >= 0.75) grade++;
            if (dayResult["+1天0000-0830"] >= 0.75) grade++;

            dayResult["夜班段数"] = grade;

            monthResult[date] = dayResult;
        }

        let totalNightCount = 0;
        let totalNightSegments = 0;

        for (const dateKey in monthResult) {
            totalNightCount += monthResult[dateKey]["夜班次数"];
            totalNightSegments += monthResult[dateKey]["夜班段数"];
        }

        monthResult.summary = {
            夜班次数: totalNightCount,
            夜班段数: totalNightSegments,
        };

        result[userId] = monthResult;
    }

    return remove(result);
}

module.exports = { calcNightCount };
