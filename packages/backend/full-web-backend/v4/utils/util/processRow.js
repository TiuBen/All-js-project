const { calculateDayNight } = require("./calculateDayNightMinutes");
const dayjs = require("dayjs");

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

    return {
        ...row,
        date: dayjs(row.inTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD"),
    };
}

module.exports = { processRow };
