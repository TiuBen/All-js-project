const dayjs = require("dayjs");

const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");

dayjs.extend(isSameOrAfter);
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");

dayjs.extend(isSameOrBefore);
const { DutyDb } = require("../../config/sqliteDb.js");

function queryDuty({ userId, username, startTime, endTime }) {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT *
            FROM duty
            WHERE outTime IS NOT NULL
        `;

        const params = [];

        if (userId != null) {
            sql += ` AND userId=?`;
            params.push(userId);
        }

        if (username != null) {
            sql += ` AND username=?`;
            params.push(username);
        }

        if (startTime) {
            sql += ` AND outTime >= ?`;
            params.push(startTime);
        }

        if (endTime) {
            sql += ` AND inTime <= ?`;
            params.push(endTime);
        }
        console.log(sql);
        console.log(params);

        DutyDb.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else console.log("rows.length", rows.length);
            // ✨ 在此处对每行数据进行清洗和派生字段计算
            const processedRows = rows.map((row) => {
                // 1. 初始化所有要求的 8 个派生字段
                row.shift = 0; // 管制总白班
                row.dayShift = 0; // 管制总白班
                row.nightShift = 0; // 管制总晚班
                row.teacherShift = 0; // 教员带教总时间
                row.teacherDayShift = 0; // 教员带教白班
                row.teacherNightShift = 0; // 教员带教晚班
                row.studentShift = 0; // 见习总时间
                row.studentDayShift = 0; // 见习白班
                row.studentNightShift = 0; // 见习晚班

                // 2. 计算当前记录的原始总时间分片
                const totalShift = calculateDayNightMinutes(row.inTime, row.outTime);
                row.dayShift = totalShift.day;
                row.nightShift = totalShift.night;
                row.shift = totalShift.day + totalShift.night;

                console.log(row.id + "relatedDutyTableRowId:" + typeof row.relatedDutyTableRowId);
                console.log("roleStartTime:" + typeof row.roleStartTime);
                console.log("roleEndTime:" + typeof row.roleEndTime);

                if (row.roleType === "见习") {
                    // 这是见习时间
                    if (row.roleStartTime && row.roleEndTime) {
                        const student = calculateDayNightMinutes(row.roleStartTime, row.roleEndTime);
                        row.studentShift = student.day + student.night;
                        row.studentDayShift = student.day;
                        row.studentNightShift = student.night;
                    }
                } else if (row.relatedDutyTableRowId && row.roleStartTime && row.roleEndTime) {
                    // 这是带教时间
                    const roles = parseRoleTimes(row);

                    for (const role of roles) {
                        const teacher = calculateDayNightMinutes(role.start, role.end);

                        row.teacherShift += teacher.day + teacher.night;

                        row.teacherDayShift += teacher.day;

                        row.teacherNightShift += teacher.night;
                    }
                }

                if (row.position !== "领班") {
                    row.shift -= row.teacherShift;
                    row.dayShift -= row.teacherDayShift;
                    row.nightShift -= row.teacherNightShift;
                }

                // 5. 将计算好的字段安全地合并到 row 对象中
                return {
                    ...row,
                    date: dayjs(row.inTime).format("YYYY-MM-DD"),
                };
            });
            console.log("processedRows", processedRows);

            resolve(processedRows);
        });
    });
}
//  将 roleStartTime 和 roleEndTime 解析为数组形式，返回一个包含 start 和 end 的对象数组
function parseRoleTimes(row) {
    if (!row.roleStartTime || !row.roleEndTime) {
        return [];
    }

    let starts = row.roleStartTime;
    let ends = row.roleEndTime;

    if (typeof starts === "string") {
        starts = JSON.parse(starts);
    }

    if (typeof ends === "string") {
        ends = JSON.parse(ends);
    }

    return starts
        .map((start, i) => ({
            start,
            end: ends[i],
        }))
        .filter((item) => item.start && item.end);
}

function matchFilter(row, filter) {
    for (const key in filter) {
        const rule = filter[key];

        // 如果 row 根本没有这个字段，直接跳过（视为不限制）
        if (!(key in row)) {
            continue;
        }

        let matched = false;

        for (const value of rule) {
            if (value === null) {
                if (row[key] == null) {
                    matched = true;
                    break;
                }
            } else if (value === "NOT NULL") {
                // 新增：只要值不是 null 且不是 undefined，就匹配成功
                if (row[key] !== null && row[key] !== undefined) {
                    matched = true;
                    break;
                }
            } else {
                if (row[key] === value) {
                    matched = true;
                    break;
                }
            }
        }

        // 只要有一个过滤字段不匹配，整个 row 就被排除
        if (!matched) {
            return false;
        }
    }

    return true;
}
/**
 * 计算两个时间段的交集毫秒数 [start1, end1] 和 [start2, end2]
 */
function overlapMinute(start1, end1, start2, end2) {
    const s = Math.max(dayjs(start1).valueOf(), dayjs(start2).valueOf());

    const e = Math.min(dayjs(end1).valueOf(), dayjs(end2).valueOf());

    return Math.max(0, (e - s) / 60000);
}

// ==================== 自定义配置：夜班起止时间 ====================
// 支持跨天，例如 18:00 到次日 08:30 算夜班，其余时间算白班
const NIGHT_SHIFT_START = "18:00";
const NIGHT_SHIFT_END = "08:30";

// ==================== 辅助工具函数 ====================

/**
 * 精准到分钟的白夜班拆分函数
 * @param {number} startTimeMs 开始时间戳
 * @param {number} endTimeMs 结束时间戳
 * @param {string} nightStartStr 夜班开始时间 "HH:mm"
 * @param {string} nightEndStr 夜班结束时间 "HH:mm"
 */
function calculateDayNightMinutes(start, end, nightStart = NIGHT_SHIFT_START, nightEnd = NIGHT_SHIFT_END) {
    const startTime = dayjs(start);
    const endTime = dayjs(end);

    const totalMinutes = endTime.diff(startTime, "minute", true);

    let nightMinutes = 0;

    let currentDay = startTime.startOf("day");

    // 多算一天，避免最后一天凌晨属于前一天夜班
    const lastDay = endTime.startOf("day").add(1, "day");

    while (currentDay.isBefore(lastDay) || currentDay.isSame(lastDay)) {
        const date = currentDay.format("YYYY-MM-DD");

        const nightBegin = dayjs(`${date} ${nightStart}`);

        const [endHour, endMinute] = nightEnd.split(":").map(Number);

        const nightFinish = nightBegin.add(1, "day").hour(endHour).minute(endMinute).second(0);

        nightMinutes += overlapMinute(start, end, nightBegin, nightFinish);

        currentDay = currentDay.add(1, "day");
    }

    return {
        night: nightMinutes,

        day: totalMinutes - nightMinutes,
    };
}

function calculateRule(rows, rule) {
    let result = {
        name: rule.name,
        time: 0,
        dayShift: 0,
        nightShift: 0,
    };

    for (const row of rows) {
        if (!matchFilter(row, rule.filter)) {
            continue;
        }

        let start = row[rule.operator[0]];

        let end = row[rule.operator[1]];

        let minutes = dayjs(end).diff(dayjs(start), "minute");

        if (rule.operator.includes("needExcludeTime")) {
            const roles = parseRoleTimes(row);

            for (const role of roles) {
                minutes -= dayjs(role.end).diff(dayjs(role.start), "minute");
            }
        }

        const shift = calculateDayNightMinutes(start, end);

        let day = shift.day;

        let night = shift.night;

        if (rule.operator.includes("needExcludeTime")) {
            const roles = parseRoleTimes(row);

            for (const role of roles) {
                const s = calculateDayNightMinutes(role.start, role.end);

                day -= s.day;

                night -= s.night;
            }
        }

        result.time += minutes;

        result.dayShift += day;

        result.nightShift += night;
    }
    const roundHour = (minutes) => Number((minutes / 60).toFixed(2));

    return {
        name: result.name,
        time: roundHour(result.time),
        dayShift: roundHour(result.dayShift),
        nightShift: roundHour(result.nightShift),
    };
}

async function calculate({ userId, username, startTime, endTime }) {
    const rows = await queryDuty({
        userId,
        username,
        startTime,
        endTime,
    });

    const result = {};

    for (const key in CalculationRules) {
        result[key] = calculateRule(rows, CalculationRules[key]);
    }

    return result;
}

module.exports = { calculate };
