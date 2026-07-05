const { calculateTimeInDailyRange } = require("./calculateDuration");
const dayjs = require("dayjs");
const { normalizeRow } = require("./sqliteSaveReadArrayTools");
const { DutyDb } = require("../../config/sqliteDb.js");

function fromDutyDbGetData(query) {
    console.log("utils fromDutyDbGetData");
    console.log(query);
    const {
        id,
        userId,
        username,
        position,
        dutyType,
        inTime,
        outTime,
        roleType,
        relatedDutyTableRowId,
        roleStartTime,
        roleEndTime,
        roleTimes,
        status,
        relatedPrepareTableId,
        year,
        month,
        // page = 1,
        // limit = 10,
    } = query;
    //#region 获取数据

    let sql = "SELECT * FROM duty WHERE 1=1";
    let params = [];

    if (id) {
        sql += ` AND id = ?`; // Add filter for 'id' if provided
        params.push(id);
    }
    if (userId) {
        sql += ` AND userId = ?`; // Add filter for 'id' if provided
        params.push(userId);
    }
    if (username) {
        sql += ` AND username = ?`; // Add filter for 'username' if provided
        params.push(username);
    }
    if (position) {
        // Split the 'position' input string by ';'
        // Trim to avoid leading/trailing spaces
        const positionsArray = position.split(",").map((p) => p.trim());
        //console.log(positionsArray);

        for (let index = 0; index < positionsArray.length; index++) {
            const p = positionsArray[index];
            if (index === 0 && p !== "") {
                sql += ` AND position =?`;
                params.push(`${p}`);
            } else if (index > 0 && p !== "") {
                sql += ` OR position LIKE ?`;
                params.push(`%${p}%`);
            } else {
            }
        }
        sql += ``;
    }

    if (dutyType !== undefined) {
        // Split the 'position' input string by ';'

        sql += ` AND dutyType LIKE ?`;
        params.push(`%${dutyType}%`);

        sql += ``;
    } else if (dutyType === undefined) {
        // sql += ` AND dutyType IS NULL`;
    }
    if (inTime) {
        const _inTime = outTime;

        sql += ` AND inTime <=DATETIME(?)`; // Add filter for 'inTime' if provided
        params.push(_inTime);
    }

    if (outTime) {
        if (outTime === "null") {
            // //console.log("outTime is null");

            sql += " AND outTime IS NULL";
        } else {
            const _outTime = inTime;

            sql += ` AND outTime  >=DATETIME(?) `; // Add filter for 'outTime' if provided
            params.push(_outTime);
        }
    }
    //#endregion
    // ✅ 计算 offset 并拼接分页 SQL
    // const offset = (Number(page) - 1) * Number(limit);
    // const pagedSql = `${sql} ORDER BY inTime DESC LIMIT ? OFFSET ?`;
    // const pagedParams = [...params, Number(limit), offset];

    // // ✅ 同时执行两条 SQL: 一条分页，一条总数
    // const countSql = `SELECT COUNT(*) AS totalCount FROM duty WHERE 1=1 ${sql.replace(
    //     "SELECT * FROM duty WHERE 1=1",
    //     ""
    // )}`;
    // //console.log("SQL:" + sql);
    // //console.log(params);
    //! 数据库中能获取的文件
    //! "id", "username", "position", "dutyType", "inTime", "outTime",
    //!  "roleType", "relatedDutyTableRowId", "roleStartTime", "roleEndTime", "roleTimes",
    //!  "status", "relatedPrepareTableId";

    return new Promise((resolve, reject) => {
        DutyDb.all(sql, params, (err, rows) => {
            console.log("SQL:" + sql);
            console.log("params:" + params);
            if (err) {
                console.error("查询失败:", err);
                reject(new Error("数据库查询失败"));
                return;
            }
            // //console.log("rows");

            // //console.log(rows);
            // 类型转换（如果需要）
            const records = rows.map((row) => {
                const _inTime = row.inTime;
                const _outTime = row.outTime ?? dayjs().format("YYYY-MM-DD HH:mm:ss"); //! 如果没有outTime，则默认为当前时间

                const _dayShift = calculateTimeInDailyRange(dayjs(_inTime), dayjs(_outTime), "08:00", "24:00");
                const _nightShift = calculateTimeInDailyRange(dayjs(_inTime), dayjs(_outTime), "00:00", "08:00");

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

                return {
                    ...row,
                    // inTime: dayjs(_inTime).format("YYYY-MM-DD HH:mm:ss"), // 转为Date对象
                    outTime: _outTime,
                    date: dayjs(_inTime).format("YYYY-MM-DD"),
                    // dayShift: _dayShift,
                    // nightShift: _nightShift,
                    shift: roundTwo(row.shift),
                    dayShift: roundTwo(row.dayShift),
                    nightShift: roundTwo(row.nightShift),
                    teacherShift: roundTwo(row.teacherShift),
                    teacherDayShift: roundTwo(row.teacherDayShift),
                    teacherNightShift: roundTwo(row.teacherNightShift),
                    studentShift: roundTwo(row.studentShift),
                    studentDayShift: roundTwo(row.studentDayShift),
                    studentNightShift: roundTwo(row.studentNightShift),
                };
            });

            console.log("getAll:" + records?.length);
            //console.log(records);
            resolve(records.map(normalizeRow));
        });
    });
}

function roundTwo(num) {
    // 四舍五入保留2位小数
    const fixed = Math.round((num / 60) * 100) / 100;
    // 判断整数直接返回，避免 0.00
    return fixed === 0 ? 0 : fixed;
}

/**
 * 计算两个时间段的交集毫秒数 [start1, end1] 和 [start2, end2]
 */
function overlapMinute(start1, end1, start2, end2) {
    const s = Math.max(dayjs(start1).valueOf(), dayjs(start2).valueOf());

    const e = Math.min(dayjs(end1).valueOf(), dayjs(end2).valueOf());

    return Math.max(0, (e - s) / 60000);
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
// ==================== 自定义配置：夜班起止时间 ====================
// 支持跨天，例如 18:00 到次日 08:30 算夜班，其余时间算白班
const NIGHT_SHIFT_START = "18:00";
const NIGHT_SHIFT_END = "08:30";

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

async function useDutyDataGetRelatedTeachData(dutyData) {
    //console.log("utils useDutyDataGetRelatedTeachData");
    const allIds = dutyData.flatMap((d) => (String(d.relatedDutyTableRowId) ?? "").split(";").filter(Boolean));

    if (allIds.length === 0) return [];

    const placeholders = allIds.map(() => "?").join(",");
    const sql = `SELECT * FROM duty WHERE id IN (${placeholders})`;

    const rows = await new Promise((resolve, reject) => {
        DutyDb.all(sql, allIds, (err, rows) => {
            if (err) reject(err);
            else resolve(normalizeRow(rows));
        });
    });

    rows.map((row) => ({
        ...row,
        outTime: (row.outTime ||= dayjs().format("YYYY-MM-DD HH:mm:ss")),
    }));
    // //console.log("rows");
    // //console.log(rows);
    return rows;
}

module.exports = { fromDutyDbGetData, useDutyDataGetRelatedTeachData };
