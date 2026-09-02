const dayjs = require("dayjs");

/**
 * 计算两个时间段的重叠小时数
 * @param {Dayjs} start1 时间段1开始
 * @param {Dayjs} end1 时间段1结束
 * @param {Dayjs} start2 时间段2开始
 * @param {Dayjs} end2 时间段2结束
 * @returns {number} 重叠小时数（保留4位小数）
 */
function getOverlapHours(start1, end1, start2, end2) {
    const overlapStart = dayjs(start1).isAfter(dayjs(start2)) ? dayjs(start1) : dayjs(start2);
    const overlapEnd = dayjs(end1).isBefore(dayjs(end2)) ? dayjs(end1) : dayjs(end2);

    if (overlapEnd.isAfter(overlapStart)) {
        return parseFloat(overlapEnd.diff(overlapStart, "hour", true).toFixed(4));
    }
    return 0;
}
