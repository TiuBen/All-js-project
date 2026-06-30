const dayjs = require("dayjs");

/**
 * 合并间隔小于gap分钟的值班记录
 * @param {Array} records - 值班记录数组
 * @param {number} gap - 间隔阈值（分钟）
 * @param {string} startField - 开始时间字段名
 * @param {string} endField - 结束时间字段名
 * @returns {Object} { mergedRecords, mergeInfo }
 */
function mergeDutyRecordsByGap(records, gap = 30, startField = "inTime", endField = "outTime") {
    if (!records || records.length === 0) {
        return { mergedRecords: [], mergeInfo: [] };
    }

    const sorted = [...records].sort((a, b) => dayjs(a[startField]).diff(dayjs(b[startField])));

    const mergedRecords = [];

    let currentGroup = {
        records: [sorted[0]],
        start: dayjs(sorted[0][startField]),
        end: dayjs(sorted[0][endField]),
        isMerged: false,
        mergedFrom: [sorted[0].id],
    };

    for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i];
        const currentStart = dayjs(current[startField]);
        const currentEnd = dayjs(current[endField]);

        const intervalMinutes = currentStart.diff(currentGroup.end, "minute");

        if (intervalMinutes < gap) {
            currentGroup.records.push(current);
            currentGroup.mergedFrom.push(current.id);
            currentGroup.isMerged = true;

            if (currentEnd.isAfter(currentGroup.end)) {
                currentGroup.end = currentEnd;
            }
        } else {
            mergedRecords.push({
                id: currentGroup.records.map((r) => r.id).join("_"),
                originalIds: currentGroup.records.map((r) => r.id),
                userId: currentGroup.records[0].userId,
                inTime: currentGroup.start.format("YYYY-MM-DD HH:mm:ss"),
                outTime: currentGroup.end.format("YYYY-MM-DD HH:mm:ss"),
                isMerged: currentGroup.isMerged,
                mergedFrom: currentGroup.mergedFrom,
                records: currentGroup.records,
                durationHours: parseFloat((currentGroup.end.diff(currentGroup.start, "minute") / 60).toFixed(2)),
            });

            currentGroup = {
                records: [current],
                start: currentStart,
                end: currentEnd,
                isMerged: false,
                mergedFrom: [current.id],
            };
        }
    }

    mergedRecords.push({
        id: currentGroup.records.map((r) => r.id).join("_"),
        originalIds: currentGroup.records.map((r) => r.id),
        userId: currentGroup.records[0].userId,
        inTime: currentGroup.start.format("YYYY-MM-DD HH:mm:ss"),
        outTime: currentGroup.end.format("YYYY-MM-DD HH:mm:ss"),
        isMerged: currentGroup.isMerged,
        mergedFrom: currentGroup.mergedFrom,
        records: currentGroup.records,
        durationHours: parseFloat((currentGroup.end.diff(currentGroup.start, "minute") / 60).toFixed(2)),
    });

    const mergeInfoList = mergedRecords
        .filter((r) => r.isMerged)
        .map((r) => ({
            mergedId: r.id,
            originalIds: r.originalIds,
            mergedFrom: r.mergedFrom,
            records: r.records,
            start: r.inTime,
            end: r.outTime,
            totalDuration: r.durationHours,
        }));

    return {
        mergedRecords,
        mergeInfo: mergeInfoList,
        hasMerged: mergeInfoList.length > 0,
    };
}

/**
 * 核心函数：在滑动时间窗口内检查累积执勤时长（支持gap合并）
 * @param {Array} records - 所有值班记录
 * @param {Object} options - 配置项
 * @param {number|string} options.userId - 用户ID
 * @param {number} options.windowSize - 窗口大小（单位：小时）
 * @param {number} options.threshold - 阈值（单位：小时）
 * @param {number} options.gap - 合并间隔阈值（分钟），默认30
 * @param {string} options.startField - 开始时间字段名，默认 'inTime'
 * @param {string} options.endField - 结束时间字段名，默认 'outTime'
 * @param {string} options.userIdField - 用户ID字段名，默认 'userId'
 * @returns {Object} 检查结果
 */
function checkCumulativeDutyInWindow(records, options) {
    const {
        userId,
        windowSize,
        threshold,
        gap = 30,
        startField = "inTime",
        endField = "outTime",
        userIdField = "userId",
    } = options;

    const userRecords = records.filter((r) => String(r[userIdField]) === String(userId));
    if (userRecords.length === 0) {
        return {
            hasViolation: false,
            totalHours: 0,
            windowStart: null,
            windowEnd: null,
            mergedRecords: [],
            rawRecords: [],
            mergeInfo: [],
            hasMerged: false,
            message: "该用户无值班记录",
        };
    }

    const { mergedRecords, mergeInfo, hasMerged } = mergeDutyRecordsByGap(userRecords, gap, startField, endField);

    let maxCumulativeHours = 0;
    let bestWindow = null;
    let bestMergedRecords = [];

    for (let i = 0; i < mergedRecords.length; i++) {
        const windowStart = dayjs(mergedRecords[i].inTime);
        const windowEnd = windowStart.add(windowSize, "hour");

        const windowRecords = mergedRecords.filter((r) => {
            const rStart = dayjs(r.inTime);
            const rEnd = dayjs(r.outTime);
            return rStart.isBefore(windowEnd) && rEnd.isAfter(windowStart);
        });

        if (windowRecords.length === 0) continue;

        let totalHours = 0;
        windowRecords.forEach((r) => {
            totalHours += r.durationHours;
        });

        if (totalHours > maxCumulativeHours) {
            maxCumulativeHours = totalHours;
            bestWindow = { start: windowStart, end: windowEnd };
            bestMergedRecords = windowRecords;
        }
    }

    const hasViolation = maxCumulativeHours > threshold;
    const rawRecords = bestMergedRecords.flatMap((r) => r.records);

    return {
        hasViolation,
        totalHours: parseFloat(maxCumulativeHours.toFixed(2)),
        threshold,
        windowSize,
        gap,
        windowStart: bestWindow ? bestWindow.start.format("YYYY-MM-DD HH:mm:ss") : null,
        windowEnd: bestWindow ? bestWindow.end.format("YYYY-MM-DD HH:mm:ss") : null,
        mergedRecords: bestMergedRecords.map((r) => ({
            id: r.id,
            originalIds: r.originalIds,
            inTime: r.inTime,
            outTime: r.outTime,
            durationHours: r.durationHours,
            isMerged: r.isMerged,
            mergedFrom: r.mergedFrom,
            recordCount: r.records.length,
        })),
        rawRecords,
        mergeInfo: mergeInfo.filter((info) =>
            bestMergedRecords.some((r) => r.originalIds.includes(info.originalIds[0]))
        ),
        hasMerged: hasMerged && bestMergedRecords.some((r) => r.isMerged),
        message: hasViolation
            ? `在${windowSize}小时内累积执勤${maxCumulativeHours.toFixed(2)}小时，超过${threshold}小时限制`
            : `在${windowSize}小时内累积执勤${maxCumulativeHours.toFixed(2)}小时，未超过${threshold}小时限制`,
    };
}

function check24HourExceed10(records, userId, gap = 30) {
    return checkCumulativeDutyInWindow(records, {
        userId,
        windowSize: 24,
        threshold: 10,
        gap,
    });
}

function check7DayExceed40(records, userId, gap = 30) {
    return checkCumulativeDutyInWindow(records, {
        userId,
        windowSize: 168,
        threshold: 40,
        gap,
    });
}

function comprehensiveCheck(records, userId, gap = 30) {
    const result24h = check24HourExceed10(records, userId, gap);
    const result7d = check7DayExceed40(records, userId, gap);

    return {
        userId,
        gap,
        checks: {
            "24小时累计": result24h,
            "7天累计": result7d,
        },
        hasAnyViolation: result24h.hasViolation || result7d.hasViolation,
        violations: {
            "24小时超过10小时": result24h.hasViolation ? result24h : null,
            "7天超过40小时": result7d.hasViolation ? result7d : null,
        },
    };
}

module.exports = {
    mergeDutyRecordsByGap,
    checkCumulativeDutyInWindow,
    check24HourExceed10,
    check7DayExceed40,
    comprehensiveCheck,
};
