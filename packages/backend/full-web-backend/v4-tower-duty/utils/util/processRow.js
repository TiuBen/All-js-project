const { calculateDayNight } = require("./calculateDayNightMinutes");
const dayjs = require("dayjs");
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

function processRow(row) {
    if (!row) return;
    // 1. 初始化所有要求的 8 个派生字段
    row.rawDuration = 0;
    row.rawDayDuration = 0;
    row.rawNightDuration = 0;
    row.shift = 0; // 管制总白班
    row.dayShift = 0; // 管制总白班
    row.nightShift = 0; // 管制总晚班
    row.teacherShift = 0; // 教员带教总时间
    row.teacherDayShift = 0; // 教员带教白班
    row.teacherNightShift = 0; // 教员带教晚班
    row.studentShift = 0; // 见习总时间
    row.studentDayShift = 0; // 见习白班
    row.studentNightShift = 0; // 见习晚班
    row.isError = false;

    console.log(typeof row.outTime);

    if (row.outTime === null) {
        row.isError = true;
        row.outTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
        console.log("row.outTime is null " + row.id);
        console.log("row.outTime is null " + row.outTime);
    }

    const inTime = dayjs(row.inTime);
    const outTime = dayjs(row.outTime);

    // 如果没有 outTime，无法计算
    if (!outTime) {
        row.isError = true;
        return { ...row, date: inTime.format("YYYY-MM-DD") };
    }

    // 如果超过2天 直接报错
    if (outTime.diff(inTime, "hour", true) > 6.0) {
        row.isError = true;
        // return { ...row, date: inTime.format("YYYY-MM-DD") };
    }

    const rawDuration = calculateDayNight(row.inTime, row.outTime);
    row.rawDuration = rawDuration.total;
    row.rawDayDuration = rawDuration.day;
    row.rawNightDuration = rawDuration.night;

    if (row.roleType === "见习") {
        // 这是见习时间
        if (row.roleStartTime && row.roleEndTime) {
            const student = calculateDayNight(row.roleStartTime, row.roleEndTime);
            row.studentShift = student.day + student.night;
            row.studentDayShift = student.day;
            row.studentNightShift = student.night;
        } else {
            row.isError = true;
        }
    }

    if (Array.isArray(row.roleStartTime) && Array.isArray(row.roleEndTime)) {
        if (row.roleStartTime.length !== row.roleEndTime.length) {
            row.isError = true;
        } else {
            // 这是带教时间
            for (let index = 0; index < row.roleStartTime.length; index++) {
                const teacher = calculateDayNight(row.roleStartTime[index], row.roleEndTime[index]);
                row.teacherShift += teacher.total;
                row.teacherDayShift += teacher.day;
                row.teacherNightShift += teacher.night;
            }
        }
    }

    if (row.position !== "领班") {
        row.shift = row.rawDuration - row.teacherShift - row.studentShift;
        row.dayShift = row.rawDayDuration - row.teacherDayShift - row.studentDayShift;
        row.nightShift = row.rawNightDuration - row.teacherNightShift - row.studentNightShift;
    }

    // ========= 新增：计算该记录涉及的所有日期的夜班统计 =========
    const nightSegments = {};

    // 获取该记录覆盖的所有日期
    let currentDate = inTime.clone().startOf("day");
    const endDate = outTime.clone().startOf("day");

    // 最多循环 3 天，防止死循环（一个班次不会超过7天）
    let daysChecked = 0;
    while (currentDate.isSameOrBefore(endDate) && daysChecked < 3) {
        console.log("000000000000000000000000000000000000000000");

        const dateStr = currentDate.format("YYYY-MM-DD");
        const nextDayStr = currentDate.add(1, "day").format("YYYY-MM-DD");

        // 计算该记录在这个日期的夜班覆盖
        const seg1 = getOverlapHours(inTime, outTime, dateStr, 18, 0, 21, 0);
        const seg2 = getOverlapHours(inTime, outTime, dateStr, 21, 0, 24, 0);
        const seg3 = getOverlapHours(inTime, outTime, nextDayStr, 0, 0, 8, 30);

        // 只有当有覆盖时才记录
        if (seg1 > 0 || seg2 > 0 || seg3 > 0) {
            // 计算该日期的夜班段数
            let grade = 0;
            if (seg1 >= 0.75) grade++;
            if (seg2 >= 0.75) grade++;
            if (seg3 >= 0.75) grade++;

            // 判断是否为夜班（任一时段超过0.7小时）
            const isNight = seg1 > 0.7 || seg2 > 0.7 || seg3 > 0.7;

            nightSegments[dateStr] = {
                "1800-2100": seg1,
                "2100-2400": seg2,
                "+1天0000-0830": seg3,
                夜班次数: isNight ? 1 : 0,
                夜班段数: grade,
                具体考勤: [
                    {
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
                    },
                ],
            };
        }

        // 移动到下一天
        currentDate = currentDate.add(1, "day");
        daysChecked++;
    }

    return {
        ...row,
        date: dayjs(row.inTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD"),
        nightSegments: nightSegments,
    };
}

module.exports = { processRow };
