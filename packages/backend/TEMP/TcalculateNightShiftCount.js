const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
dayjs.extend(minMax);
const { DutyDb } = require("../../config/sqliteDb.js");

function calculateNightShiftCount(userId, date) {
    return new Promise((resolve, reject) => {
        const nightStart = `${date} 18:00:00`;
        const nextDay = dayjs(date).add(1, "day").format("YYYY-MM-DD");
        const nightEnd = `${nextDay} 08:30:00`;

        const sql = `
            SELECT * FROM duty 
            WHERE userId = ? 
            AND inTime <= DATETIME(?)
            AND outTime >= DATETIME(?)
            ORDER BY inTime ASC
        `;

        DutyDb.all(sql, [userId, nightEnd, nightStart], (err, rows) => {
            if (err) {
                console.error("查询夜班数据失败:", err);
                reject(new Error("数据库查询失败"));
                return;
            }

            if (!rows || rows.length === 0) {
                resolve({
                    [date]: {
                        "1800-2100": 0,
                        "2100-2400": 0,
                        "+1天0000-0830": 0,
                        夜班次数: 0,
                        夜班段数: 0,
                        具体考勤: [],
                    },
                });
                return;
            }

            const result = {
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

                // 各段独立计算重叠时长
                result["1800-2100"] += getOverlapHours(inTime, outTime, date, 18, 0, 21, 0);
                result["2100-2400"] += getOverlapHours(inTime, outTime, date, 21, 0, 24, 0);
                result["+1天0000-0830"] += getOverlapHours(inTime, outTime, nextDay, 0, 0, 8, 30);

                result["具体考勤"].push({
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
                    date: date,
                    dayShift: row?.dayShift,
                    nightShift: row?.nightShift,
                });
            }

            if (result["1800-2100"] > 0.7 || result["2100-2400"] > 0.7 || result["+1天0000-0830"] > 0.7) {
                result["夜班次数"] = 1;
            }

            let grade = 0;
            if (result["1800-2100"] >= 0.75) grade++;
            if (result["2100-2400"] >= 0.75) grade++;
            if (result["+1天0000-0830"] >= 0.75) grade++;
            result["夜班段数"] = grade;

            resolve({ [date]: result });
        });
    });
}

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

function calculateMonthlyNightShiftCount(userId, year, month) {
    return new Promise((resolve, reject) => {
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = dayjs(startDate).add(1, "month").format("YYYY-MM-DD");

        const sql = `
            SELECT * FROM duty 
            WHERE userId = ? 
            AND inTime <= DATETIME(?)
            AND outTime >= DATETIME(?)
            ORDER BY inTime ASC
        `;

        DutyDb.all(sql, [userId, `${endDate} 08:30:00`, `${startDate} 18:00:00`], (err, rows) => {
            if (err) {
                console.error("查询月度夜班数据失败:", err);
                reject(new Error("数据库查询失败"));
                return;
            }

            const daysInMonth = dayjs(startDate).daysInMonth();
            const monthResult = {};

            for (let d = 1; d <= daysInMonth; d++) {
                const date = dayjs(startDate).date(d).format("YYYY-MM-DD");
                const nextDay = dayjs(date).add(1, "day").format("YYYY-MM-DD");

                const dayResult = {
                    "1800-2100": 0,
                    "2100-2400": 0,
                    "+1天0000-0830": 0,
                    夜班次数: 0,
                    夜班段数: 0,
                    具体考勤: [],
                };

                if (!rows || rows.length === 0) {
                    monthResult[date] = dayResult;
                    continue;
                }

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
                        date: date,
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
                "夜班次数": totalNightCount,
                "夜班段数": totalNightSegments,
            };

            resolve(monthResult);
        });
    });
}

module.exports = { calculateNightShiftCount, calculateMonthlyNightShiftCount };
