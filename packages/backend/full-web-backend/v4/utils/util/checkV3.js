const dayjs = require("dayjs");

/**
 * 函数1：滑动窗口获取二维数组
 * 以每条记录为基准，找出在窗口时间内（从该记录开始时间算起）的所有记录
 * @param {Array} records - 值班记录数组（已按时间排序）
 * @param {number} windowHours - 窗口大小（小时）
 * @param {string} startField - 开始时间字段名
 * @param {string} endField - 结束时间字段名
 * @returns {Array} 二维数组，每个子数组包含在窗口内的记录
 */
function getWindowGroups(records, windowHours = 24, startField = "inTime", endField = "outTime") {
    // console.log("getWindowGroups !!!!!!!!!!");
    // console.log(`getWindowGroups: total groups=${records.length}`);

    if (!records || records.length === 0) return [];

    const sorted = [...records].sort((a, b) => dayjs(a.inTime).valueOf() - dayjs(b.inTime).valueOf());

    const result = [];

    for (let i = 0; i < sorted.length; i++) {
        const windowStart = dayjs(sorted[i][startField]);
        const windowEnd = windowStart.add(windowHours, "hour");

        // 找出所有在窗口内的记录（包括基准记录本身）
        const windowRecords = sorted.filter((r) => {
            const rStart = dayjs(r[startField]);
            const rEnd = dayjs(r[endField]);
            // 与窗口存在交集
            return rStart.isBefore(windowEnd) && rEnd.isAfter(windowStart);
        });

        if (windowRecords.length > 0) {
            result.push(windowRecords);
        }
    }
    // console.log(`getWindowGroups: windowHours=${windowHours}, total groups=${result.length}`);
    return result;
}

/**
 * 函数2：间隔合并
 * 检查一组记录中，相邻两条的 outTime 与下一条 inTime 的间隔
 * 如果间隔 < gap分钟，则合并为一条，标记 isMerged
 * @param {Array} records - 一组duty记录（已按inTime排序）
 * @param {number} gap - 合并阈值（分钟），如 30
 * @returns {Array<Array>}
 */
function mergeByGap(groups, gapMinutes = 30, startField = "inTime", endField = "outTime") {
    if (!groups?.length) return [];

    return groups.map((group) => {
        if (!group.length) return [];

        // 按开始时间排序
        const sorted = [...group].sort((a, b) => dayjs(a[startField]).valueOf() - dayjs(b[startField]).valueOf());

        const merged = [];

        let current = {
            id: sorted[0].id,
            inTime: sorted[0][startField],
            outTime: sorted[0][endField],
            merged: false,
            originalIds: [sorted[0].id],
            records: [sorted[0]],
        };

        for (let i = 1; i < sorted.length; i++) {
            const next = sorted[i];

            const gap = dayjs(next[startField]).diff(dayjs(current.outTime), "minute");

            if (gap < gapMinutes) {
                // 合并
                current.merged = true;

                current.originalIds.push(next.id);
                current.records.push(next);

                // 更新时间范围
                if (dayjs(next[endField]).isAfter(dayjs(current.outTime))) {
                    current.outTime = next[endField];
                }
            } else {
                // 当前结束
                current.durationHours = dayjs(current.outTime).diff(dayjs(current.inTime), "minute") / 60;

                merged.push(current);

                // 新建下一段
                current = {
                    id: next.id,
                    inTime: next[startField],
                    outTime: next[endField],
                    merged: false,
                    originalIds: [next.id],
                    records: [next],
                    removed: false, //!
                    removeReason: null, //!
                };
            }
        }

        // 最后一条
        current.durationHours = dayjs(current.outTime).diff(dayjs(current.inTime), "minute") / 60;

        merged.push(current);

        return merged;
    });
}

// [
//     [
//         r1,
//         r2,
//         r3
//     ]
// ]

// [
//     [
//         {
//             id:1,
//             inTime:"08:00",
//             outTime:"12:00",
//             durationHours:4,
//             merged:true,
//             originalIds:[1,2],
//             records:[
//                 r1,
//                 r2
//             ]
//         },
//         {
//             id:3,
//             inTime:"18:00",
//             outTime:"20:00",
//             durationHours:2,
//             merged:false,
//             originalIds:[3],
//             records:[
//                 r3
//             ]
//         }
//     ]
// ]

/**
 * 标记每个窗口是否累计超时
 *
 * @param {Array<Array>} groups mergeDutyRecordsInGroups() 返回的数据
 * @param {Number} thresholdHours 累计时长阈值（小时）
 * @returns {Array}
 */
function markOvertime(groups, thresholdHours = 10) {
    if (!groups?.length) return [];

    return groups.map((group, index) => {
        const totalHours = group.reduce((sum, item) => sum + item.durationHours, 0);

        return {
            windowIndex: index,

            hasOvertime: totalHours > thresholdHours,

            totalHours: Number(totalHours.toFixed(2)),

            thresholdHours,

            overtimeHours: Number(Math.max(0, totalHours - thresholdHours).toFixed(2)),

            records: group,
        };
    });
}

// [
//     {
//         windowIndex: 0,
//         hasOvertime: false,
//         totalHours: 10,
//         thresholdHours: 10,
//         overtimeHours: 0,
//         records: [...]
//     },
//     {
//         windowIndex: 1,
//         hasOvertime: false,
//         totalHours: 6,
//         thresholdHours: 10,
//         overtimeHours: 0,
//         records: [...]
//     }
//     ,
//     {
//         windowIndex:0,
//         hasOvertime:true,
//         totalHours:11,
//         thresholdHours:10,
//         overtimeHours:1,
//         records:[...]
//     }
// ]

/**
 * 根据长间隔规则重新计算累计时长
 *
 * 规则：
 * 如果当前窗口超时，
 * 且某条记录与下一条记录间隔>=gapHours，
 * 则排除"下一条记录"参与累计。
 *
 * @param {Array} overtimeGroups markOvertime()返回的数据
 * @param {Number} thresholdHours 累计时长限制
 * @param {Number} gapHours 长间隔(小时)，默认4
 * @returns {Array}
 */
function removeAfterLongGap(overtimeGroups, thresholdHours = 10, gapHours = 8) {
    const gapMinutes = gapHours * 60;

    // 先过滤出超时的窗口
    const overtimeGroupsOnly = overtimeGroups.filter((group) => group.hasOvertime);

    // 如果没有超时窗口，直接返回空数组
    if (overtimeGroupsOnly.length === 0) {
        return [];
    }

    return overtimeGroupsOnly.map((group) => {
        // // 没超时直接返回
        // if (!group.hasOvertime) {
        //     return group;
        // }

        // 深拷贝
        const records = group.records.map((r) => ({
            ...r,
            removed: false,
            removeReason: null,
        }));

        // 从第一条开始检查
        for (let i = 0; i < records.length - 1; i++) {
            const current = records[i];
            const next = records[i + 1];

            const gap = dayjs(next.inTime).diff(dayjs(current.outTime), "minute");

            if (gap >= gapMinutes) {
                next.removed = true;
                next.removeReason = `Gap >= ${gapHours}h`;
            }
        }

        const validRecords = records.filter((r) => !r.removed);

        const totalHours = validRecords.reduce((sum, r) => sum + r.durationHours, 0);
        const stillOvertime = totalHours > thresholdHours;

        return {
            ...group,

            originalTotalHours: group.totalHours,

            totalHours: Number(totalHours.toFixed(2)),

            hasOvertime: stillOvertime,

            overtimeHours: Number(Math.max(0, totalHours - thresholdHours).toFixed(2)),

            records,

            validRecords,

            removedRecords: records.filter((r) => r.removed),

            // 添加状态说明
            status: stillOvertime ? "still_overtime" : "resolved",
            statusMessage: stillOvertime
                ? `满8小时间隔可不统计,但仍超时 ${(totalHours - thresholdHours).toFixed(2)} 小时`
                : "已通过排除长间隔后的记录解决超时问题",
        };
    });
}

// // 假设 markOvertime 返回的数据
// const overtimeGroups = [
//     {
//         windowIndex: 0,
//         hasOvertime: false,  // 这个会被丢弃
//         totalHours: 6,
//         thresholdHours: 10,
//         overtimeHours: 0,
//         records: [...]
//     },
//     {
//         windowIndex: 1,
//         hasOvertime: true,   // 这个会被处理
//         totalHours: 11,
//         thresholdHours: 10,
//         overtimeHours: 1,
//         records: [...]
//     },
//     {
//         windowIndex: 2,
//         hasOvertime: true,   // 这个会被处理
//         totalHours: 12,
//         thresholdHours: 10,
//         overtimeHours: 2,
//         records: [...]
//     }
// ];

// // 处理超时窗口
// const result = removeAfterLongGap(overtimeGroups, 10, 4);

// // result 只包含超时的窗口（windowIndex: 1 和 2）
// console.log(result);
// // [
// //     {
// //         windowIndex: 1,
// //         hasOvertime: false,  // 排除后可能不超时了
// //         totalHours: 8.5,
// //         thresholdHours: 10,
// //         overtimeHours: 0,
// //         status: 'resolved',
// //         statusMessage: '已通过排除长间隔后的记录解决超时问题',
// //         ...
// //     },
// //     {
// //         windowIndex: 2,
// //         hasOvertime: true,   // 排除后仍然超时
// //         totalHours: 11.5,
// //         thresholdHours: 10,
// //         overtimeHours: 1.5,
// //         status: 'still_overtime',
// //         statusMessage: '排除后仍超时 1.5 小时',
// //         ...
// //     }
// // ]

function checkRule(records, options = {}) {
    // console.log("checkRule called with options:", options);
    const { windowHours, thresholdHours, mergeGapMinutes = 30, removeGapHours = null } = options;

    // ① 构造窗口
    const groups = getWindowGroups(records, windowHours);

    // ② 合并间隔
    const mergedGroups = mergeByGap(groups, mergeGapMinutes);

    // ③ 标记超时
    const overtimeGroups = markOvertime(mergedGroups, thresholdHours);
    // console.log("overtimeGroups===============================================");
    // console.log(overtimeGroups);

    // ④ 如果需要长间隔排除，先处理
    let result = overtimeGroups;
    // ④ 是否需要长间隔排除
    if (removeGapHours != null) {
        // console.log("removeGapHours enabled");
        result = removeAfterLongGap(overtimeGroups, thresholdHours, removeGapHours);
    }
    // ⑤ 统一过滤并返回
    // console.log("result before filter:");
    // console.log(result);

    // 不需要第四步
    return result.filter((item) => item.hasOvertime);
}

module.exports = {
    checkRule,
};
