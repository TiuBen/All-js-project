const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
dayjs.extend(minMax);
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
function calculateDayNight(start, end, nightStart = NIGHT_SHIFT_START, nightEnd = NIGHT_SHIFT_END, unit = "hour") {
    const startTime = dayjs(start);
    const endTime = dayjs(end);

    if (!startTime.isValid() || !endTime.isValid() || !startTime.isBefore(endTime)) {
        return {
            total: 0,
            day: 0,
            night: 0,
        };
    }

    const total = endTime.diff(startTime, unit, true);

    let night = 0;

    const [startHour, startMinute] = NIGHT_SHIFT_START.split(":").map(Number);
    const [endHour, endMinute] = NIGHT_SHIFT_END.split(":").map(Number);

    let currentDay = startTime.startOf("day");

    // 多算一天，避免最后一天凌晨属于前一天夜班
    const lastDay = endTime.startOf("day").add(1, "day");

    while (currentDay.isSame(lastDay) || currentDay.isBefore(lastDay)) {
        const nightBegin = currentDay.hour(startHour).minute(startMinute).second(0).millisecond(0);

        let nightFinish = currentDay.hour(endHour).minute(endMinute).second(0).millisecond(0);

        // 如果结束时间 <= 开始时间，则表示跨天
        if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
            nightFinish = nightFinish.add(1, "day");
        }

        const overlapStart = dayjs.max(startTime, nightBegin);
        const overlapEnd = dayjs.min(endTime, nightFinish);

        if (overlapStart.isBefore(overlapEnd)) {
            night += overlapEnd.diff(overlapStart, unit, true);
        }

        currentDay = currentDay.add(1, "day");
    }

    return {
        total: Number(total.toFixed(2)),
        night: Number(night.toFixed(2)),
        day: Number((total - night).toFixed(2)),
    };
}

module.exports = { calculateDayNight };
