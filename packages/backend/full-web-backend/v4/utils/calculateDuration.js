const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
dayjs.extend(minMax);
const { DutyDb } = require("../config/sqliteDb.js");

// ! 数据结构类似这种
// [totalZongheTime: {
//     filter: {
//         position: ["综合协调"],
//         dutyType: [null],
//         roleType: [null],
//         relatedDutyTableRowId: [null],
//     },
//     time: 0,
//     dayShift: 0,
//     nightShift: 0,
// }...]

/**
 * 计算某行duty数据是否满足过滤条件
 * @returns {Boolean}
 */
function _checkRowAgainstFilter(row, filter) {
    // //console.log(
    //     `查数据 ${
    //         JSON.stringify(row.position) + " " + JSON.stringify(row.dutyType) + " " + JSON.stringify(row.roleType)
    //     } 条件 ${key} `
    // );

    // //console.log(filter);

    //! 检查position条件,也就是说 这条考勤数据, 应该符合要计算的这个类型中席位能包含的席位
    if (filter.position !== undefined) {
        if (!filter.position.includes(row.position)) {
            return false;
        }
    }

    // //console.log(true);

    //! 检查dutyType条件
    if (filter?.dutyType !== undefined) {
        // 如果没有dutyType条件，则直接返回true
        // 如果roleType要求是[null]，则检查row.roleType是否为null或undefined

        if (filter.dutyType.length === 1 && filter.dutyType[0] === null) {
            if (row.dutyType !== null && row.dutyType !== undefined) {
                return false;
            }
        } else if (!filter.dutyType.includes(row.dutyType)) {
            return false;
        }
    }
    // //console.log(true);

    //! 检查roleType条件
    if (filter?.roleType !== undefined) {
        // 如果roleType要求是[null]，则检查row.roleType是否为null或undefined
        if (filter.roleType.length === 1 && filter.roleType[0] === null) {
            if (row.roleType !== null && row.roleType !== undefined) {
                return false;
            }
        } else if (!filter.roleType.includes(row.roleType)) {
            return false;
        }
    }
    // //console.log(true);

    //! 检查relatedDutyTableRowId条件 - 修正后的逻辑
    //! 如果条件是["NOT NULL"]，则检查该字段是否有值（不为null/undefined）
    if (filter?.relatedDutyTableRowId !== undefined) {
        if (filter.relatedDutyTableRowId.includes("NOT NULL")) {
            if (row.relatedDutyTableRowId === null || row.relatedDutyTableRowId === undefined) {
                return false;
            }
        }
        if (filter.relatedDutyTableRowId.includes(null)) {
            if (row.relatedDutyTableRowId !== null && row.relatedDutyTableRowId !== undefined) {
                return false;
            }
        }
    }

    // 如果是其他值，则检查是否包含在数组中
    // else if (!filter.relatedDutyTableRowId.includes(row.relatedDutyTableRowId)) {
    //     return false;
    // }

    // 所有条件都满足
    // //console.log(true);
    // //console.log("所有条件都满足");
    return true;
}

/**
 * 计算某行duty数据是否满足过滤条件
 * 如果 row 符合条件且不需要查询关联 → 返回 { row, relatedRows: [] }
 * 如果 row 符合条件且需要查询关联 → 返回 { row, relatedRows: [ ... ] }
 * 如果不符合条件 → reject(Error)
 * @returns {Promise<boolean>}
 */
async function _checkRowAgainstFilterV2(row, filter) {
    return new Promise((resolve, reject) => {
        try {
            //! 检查position条件,也就是说 这条考勤数据, 应该符合要计算的这个类型中席位能包含的席位
            if (!filter?.position?.includes(row.position)) {
                return reject(new Error("position 不匹配"));
            }

            //! 检查dutyType条件
            if (filter?.dutyType !== undefined) {
                // 如果没有dutyType条件，则直接返回true
                // 如果roleType要求是[null]，则检查row.roleType是否为null或undefined

                if (!filter.dutyType.includes(row.dutyType)) {
                    return reject(new Error("position 不匹配"));
                }
            }
            //! 检查roleType条件
            if (filter?.roleType !== undefined) {
                // 如果roleType要求是[null]，则检查row.roleType是否为null或undefined
                if (!filter.roleType.includes(row.roleType)) {
                    return reject(new Error("position 不匹配"));
                }
            }

            //! 检查relatedDutyTableRowId条件 - 修正后的逻辑
            //! 如果条件是["NOT NULL"]，则检查该字段是否有值（不为null/undefined）
            if (filter?.relatedDutyTableRowId !== undefined) {
                if (filter.relatedDutyTableRowId.includes("NOT NULL")) {
                    if (!row.relatedDutyTableRowId) {
                        return reject(new Error("relatedDutyTableRowId 必须有值"));
                    }
                    const ids = row.relatedDutyTableRowId;

                    if (ids.length === 0) {
                        return reject(new Error("relatedDutyTableRowId 解析不到有效 ID"));
                    }
                    const placeholders = ids.map(() => "?").join(", ");
                    const sql = `SELECT * FROM duty WHERE id IN (${placeholders})`;

                    db.all(sql, ids, (err, relatedRows) => {
                        if (err) return reject(err);
                        if (relatedRows.length === 0) {
                            return reject(new Error("未找到相关 duty 记录"));
                        }

                        // ✅ 满足条件，返回 row + 相关 rows
                        resolve({ relatedRows });
                    });
                    return; // 注意这里 return，避免继续执行
                }

                if (filter.relatedDutyTableRowId.includes(null)) {
                    if (row.relatedDutyTableRowId !== null && row.relatedDutyTableRowId !== undefined) {
                        return reject(new Error("relatedDutyTableRowId 应该为 null"));
                    }
                }
            }

            //! 所有条件都满足
            // //console.log("所有条件都满足");
            // --- 默认：只返回 row ---
            resolve(row);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * 计算时间跨度在每天固定时段内的总时长（分钟）
 * @param {dayjs.Dayjs} startTime 开始时间
 * @param {dayjs.Dayjs} endTime 结束时间
 * @param {string} dailyStart 每天开始时间（格式："HH:mm"）
 * @param {string} dailyEnd 每天结束时间（格式："HH:mm"）
 * @returns {number} 总分钟数
 */
function calculateTimeInDailyRange(startTime, endTime, dailyStart, dailyEnd) {
    let totalTime = 0;
    let currentDay = startTime.startOf("day");
    const endDay = endTime.startOf("day");

    // 解析每天的起始和结束时间
    const [startHour, startMinute] = dailyStart.split(":").map(Number);
    const [endHour, endMinute] = dailyEnd.split(":").map(Number);

    while (currentDay.isBefore(endDay) || currentDay.isSame(endDay)) {
        const dayStart = currentDay.hour(startHour).minute(startMinute).second(0);

        const dayEnd = currentDay.hour(endHour).minute(endMinute).second(0);

        // 计算当天有效时间段的开始和结束
        const effectiveStart = dayjs.max(startTime, dayStart);

        const effectiveEnd = dayjs.min(endTime, dayEnd);

        // 如果有效时间段存在，则计算耗时
        if (effectiveStart.isBefore(effectiveEnd)) {
            const duration = effectiveEnd.diff(effectiveStart, "hour", true);
            totalTime += duration;
        }

        // 移动到下一天
        currentDay = currentDay.add(1, "day");
    }

    return parseFloat(totalTime.toFixed(2));
}

const { CalculationRules } = require("../config/CalculationRules");

const CalculationRulesEntries = Object.entries(CalculationRules);

function calDuration(rows, CalculationRules, startDateTime, endDateTime) {
    //console.log("_calDuration");
    const _CalculationRules = structuredClone(CalculationRules);

    if (rows.length > 0) {
        for (let index = 0; index < rows.length; index++) {
            // //console.log("============================" + index);

            // 一般是 id--username--position--dutyType--inTime--outTime--roleType--relatedDutyTableRowId--roleStartTime--roleEndTime--roleTimes--status--relatedPrepareTableId

            const dutyRow = rows[index];
            for (const [key, value] of CalculationRulesEntries) {
                if (_checkRowAgainstFilter(dutyRow, value.filter)) {
                    let _dutyRowInTime = dayjs(dutyRow.inTime, "YYYY-MM-DD HH:mm:ss");
                    let _dutyRowOutTime = dayjs(dutyRow.outTime, "YYYY-MM-DD HH:mm:ss");
                    let _inTime = startDateTime.isBefore(_dutyRowInTime) ? _dutyRowInTime : startDateTime;
                    let _outTime = endDateTime.isAfter(_dutyRowOutTime) ? _dutyRowOutTime : endDateTime;

                    _CalculationRules[key].time += Math.abs(
                        parseFloat(_outTime.diff(_inTime, "hours", true).toFixed(2))
                    );
                    _CalculationRules[key].dayShift += calculateTimeInDailyRange(
                        dayjs(dutyRow.inTime),
                        dayjs(dutyRow.outTime),
                        "08:00",
                        "24:00"
                    );
                    _CalculationRules[key].nightShift += calculateTimeInDailyRange(
                        dayjs(dutyRow.inTime),
                        dayjs(dutyRow.outTime),
                        "00:00",
                        "08:00"
                    );
                    // //console.log(_CalculationRules[key]);
                }
            }
            // //console.log("============================" + index);
        }
    }
    return _CalculationRules;
}
function calDurationV2(rows, CalculationRules, startDateTime, endDateTime) {
    //console.log("_calDurationV2  version");
    const _CalculationRules = structuredClone(CalculationRules);

    try {
        if (rows.length > 0) {
            for (let index = 0; index < rows.length; index++) {
                // //console.log("============================" + index);

                // 一般是 id--username--position--dutyType--inTime--outTime--
                // roleType--relatedDutyTableRowId--roleStartTime--roleEndTime--roleTimes--status--relatedPrepareTableId

                const dutyRow = rows[index];
                for (const [key, value] of CalculationRulesEntries) {
                    if (_checkRowAgainstFilter(dutyRow, value.filter)) {
                        //! 这行数据 满足条件
                        const [op1, op2] = value.operator;
                        // 在这里处理 教员 用 roleStartTime roleEndTime 计算的情况
                        // 一定是数组
                        const inTime = Array.isArray(dutyRow[op1]) ? dutyRow[op1] : [dutyRow[op1]];
                        const outTime = Array.isArray(dutyRow[op2]) ? dutyRow[op2] : [dutyRow[op2]];

                        //console.log(inTime);
                        //console.log(outTime);

                        inTime.forEach((iT, index) => {
                            const oT = outTime[index];
                            let _dutyRowInTime = dayjs(iT, "YYYY-MM-DD HH:mm:ss");
                            let _dutyRowOutTime = dayjs(oT, "YYYY-MM-DD HH:mm:ss");
                            let _inTime = startDateTime.isBefore(_dutyRowInTime) ? _dutyRowInTime : startDateTime;
                            let _outTime = endDateTime.isAfter(_dutyRowOutTime) ? _dutyRowOutTime : endDateTime;

                            _CalculationRules[key].time += Math.abs(
                                parseFloat(_outTime.diff(_inTime, "hours", true).toFixed(2))
                            );
                            //console.log(dutyRow.dayShift);
                            _CalculationRules[key].dayShift += calculateTimeInDailyRange(
                                _inTime,
                                _outTime,
                                "08:00",
                                "24:00"
                            );
                            _CalculationRules[key].nightShift += calculateTimeInDailyRange(
                                _inTime,
                                _outTime,
                                "00:00",
                                "08:00"
                            );
                        });

                        //! 这里处理下 席位的逻辑

                        // //console.log(_CalculationRules[key]);
                    }
                }
                // //console.log("============================" + index);
            }
        }
    } catch (error) {
        //console.log(error);
    }

    return _CalculationRules;
}

function _splitDutyRow(rows) {
    const newDutyRow = [];
    rows.forEach((row) => {
        const { inTime, outTime, roleStartTime, roleEndTime, relatedDutyTableRowId, ...rest } = row;

        if (!Array.isArray(roleStartTime) || roleStartTime.length === 0) {
            // 没有关联，直接返回原对象
            newDutyRow.push(structuredClone(row));
        } else {
            let prev = inTime;
            for (let i = 0; i < roleStartTime.length; i++) {
                const x = structuredClone(row);
                x.inTime = prev;
                x.outTime = roleStartTime[i];
                newDutyRow.push(x);
                prev = roleStartTime[i];

                const j = structuredClone(row);
                j.inTime = prev;
                j.outTime = roleEndTime[i];
                j.roleType = "教员";
                newDutyRow.push(j);

                prev = roleEndTime[i];
            }
            const last = structuredClone(row);
            last.inTime = prev;
            last.outTime = outTime;
            newDutyRow.push(last);
        }
    });
    // console.log(newDutyRow);
    return newDutyRow;
}

// 这个是真确的 计算 2025-09-01 00:00:00 至 2025-09-01 23:59:59 的时间段内，的方法
function calDurationV3(rows, CalculationRules, startDateTime, endDateTime) {
    // console.log("_calDurationV3  version");
    const _CalculationRules = structuredClone(CalculationRules);

    if (rows.length > 0) {
        const splittedRows = _splitDutyRow(rows);

        for (let index = 0; index < splittedRows.length; index++) {
            // //console.log("============================" + index);

            // 一般是 id--username--position--dutyType--inTime--outTime--
            //roleType--relatedDutyTableRowId--roleStartTime--roleEndTime--roleTimes--status--relatedPrepareTableId

            const dutyRow = splittedRows[index];
            for (const [key, value] of CalculationRulesEntries) {
                if (_checkRowAgainstFilter(dutyRow, value.filter)) {
                    let _dutyRowInTime = dayjs(dutyRow.inTime, "YYYY-MM-DD HH:mm:ss");
                    let _dutyRowOutTime = dayjs(dutyRow.outTime, "YYYY-MM-DD HH:mm:ss");
                    let _inTime = startDateTime.isBefore(_dutyRowInTime) ? _dutyRowInTime : startDateTime;
                    let _outTime = endDateTime.isAfter(_dutyRowOutTime) ? _dutyRowOutTime : endDateTime;

                    _CalculationRules[key].time += Math.abs(
                        parseFloat(_outTime.diff(_inTime, "hours", true).toFixed(2))
                    );
                    _CalculationRules[key].dayShift += calculateTimeInDailyRange(
                        dayjs(dutyRow.inTime),
                        dayjs(dutyRow.outTime),
                        "08:00",
                        "24:00"
                    );
                    _CalculationRules[key].nightShift += calculateTimeInDailyRange(
                        dayjs(dutyRow.inTime),
                        dayjs(dutyRow.outTime),
                        "00:00",
                        "08:00"
                    );
                    // //console.log(_CalculationRules[key]);
                }
            }
            // //console.log("============================" + index);
        }
    }
    return _CalculationRules;
}

module.exports = { calDuration, calculateTimeInDailyRange, calDurationV2, calDurationV3 };
