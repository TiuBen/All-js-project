const dayjs = require("dayjs");
function calculateNightShifts(rows) {
    const result = {};

    for (const row of rows) {
        // //console.log(
        //     dayjs(row.inTime).format("YYYY-MM-DD HH:mm:ss") + "=====" + dayjs(row.outTime).format("YYYY-MM-DD HH:mm:ss")
        // );

        if (!isDuringNightShift(row.inTime, row.outTime)) {
            // //console.log("\t\t\t\t\t\t" + " is not in night shift");
            continue; // 跳过不符合的记录
        }
        const { userId, username, inTime, outTime } = row; //TODO userId

        // 使用dayjs处理时间
        const inDate = dayjs(inTime);
        const outDate = dayjs(outTime);

        // 确定属于哪个日期的统计（对于0000-0830时段，属于前一天的统计）
        const isOvernight = inDate.hour() < 8 && inDate.hour() >= 0;
        const primaryDate = isOvernight ? inDate.subtract(1, "day") : inDate;
        const dateKey = primaryDate.format("YYYY-MM-DD");
        // const monthKey= inDate.format("YYYY-MM");

        // 初始化用户数据
        if (!result[username]) {
            result[username] = {};
        }
        // result[username][monthKey] = 0;

        // 初始化该日期的数据
        if (!result[username][dateKey]) {
            result[username][dateKey] = {
                "1800-2100": 0,
                "2100-2400": 0,
                "+1天0000-0830": 0,
                夜班次数: 0,
                夜班段数: 0,
            };
        }
        const dayData = result[username][dateKey];

        // 处理当前日期的数据
        processRows(dayjs(inTime), dayjs(outTime), dateKey, dayData);
    }

    // {"明嘉": {
    //     "2025-07-31": {
    //         "1800-2100": 0,
    //         "2100-2400": 0,
    //         "+1天0000-0830": 1.3611111111111112,
    //         "夜班次数": 1,
    //         "夜班段数": 1
    //     },
    //     "2025-08-03": {
    //         "1800-2100": 1.0397222222222222,
    //         "2100-2400": 0,
    //         "+1天0000-0830": 3.065,
    //         "夜班次数": 1,
    //         "夜班段数": 2,
    //         "1800-2100次数": null
    //     },
    // }}
    for (const [usernameAsKey, userValue] of Object.entries(result)) {
        for (const [dayAsKey, item] of Object.entries(result[usernameAsKey])) {
            // 计算夜班次数（任一时段大于0则计1次）
            if (item["1800-2100"] > 0.83 || item["2100-2400"] > 0.83 || item["+1天0000-0830"] > 0.83) {
                result[usernameAsKey][dayAsKey]["夜班次数"] = 1;
            }

            // 计算夜班档位（统计大于1的小时段数）
            let grade = 0;
            if (item["1800-2100"] > 0.83) grade++;
            if (item["2100-2400"] > 0.83) grade++;
            if (item["+1天0000-0830"] > 0.83) grade++;
            result[usernameAsKey][dayAsKey]["夜班段数"] = grade;

            // //! 处理成整月的形式
            // const monthKey = dayAsKey.slice(0, 7); // 取到 YYYY-MM
            // if (!result[usernameAsKey][monthKey]) {
            //     result[usernameAsKey][monthKey] = {
            //         "1800-2100": 0,
            //         "2100-2400": 0,
            //         "+1天0000-0830": 0,
            //         "夜班次数": 0,
            //         "夜班段数": 0,
            //     };
            // }
            // console.log(typeof item);
            // console.log( "item");
            // console.log( item);
            // // 累加
            // for (const key in item) {
            //     // console.log(key);
            //     // console.log(item);
            //     if (item["1800-2100"] > 0.83) {
            //         result[usernameAsKey][monthKey]["1800-2100"] += 1;
            //     };
            //     if (item["2100-2400"] > 0.83) {
            //         result[usernameAsKey][monthKey]["2100-2400"] += 1;
            //     };
            //     if (item["+1天0000-0830"] > 0.83) {
            //         result[usernameAsKey][monthKey]["+1天0000-0830"] += 1;
            //     };
            //     result[usernameAsKey][monthKey]["夜班次数"] += item["夜班次数"];
            //     result[usernameAsKey][monthKey]["夜班段数"] += item["夜班段数"];
            // }
        }
    }

    for (const [usernameAsKey, userValue] of Object.entries(result)) {
        for (const [dayAsKey, item] of Object.entries(userValue)) {
            const monthKey = dayAsKey.slice(0, 7); // 取到 YYYY-MM
            if (!result[usernameAsKey][monthKey]) {
                result[usernameAsKey][monthKey] = {
                    "1800-2100次数": 0,
                    "2100-2400次数": 0,
                    "+1天0000-0830次数": 0,
                    "夜班次数": 0,
                    "夜班段数": 0,
                };
            }
            // console.log("item");
            // console.log(item);
            if (item["1800-2100"] > 0.83) {
                result[usernameAsKey][monthKey]["1800-2100次数"] += 1;
            }
            if (item["2100-2400"] > 0.83) {
                result[usernameAsKey][monthKey]["2100-2400次数"] += 1;
            }
            if (item["+1天0000-0830"] > 0.83) {
                result[usernameAsKey][monthKey]["+1天0000-0830次数"] += 1;
            }
            result[usernameAsKey][monthKey]["夜班次数"] += item["夜班次数"];
            result[usernameAsKey][monthKey]["夜班段数"] += item["夜班段数"];
        }
    }

    return result;
}

function isDuringNightShift(inTime, outTime) {
    const start = dayjs(inTime);
    const end = dayjs(outTime);

    // 1 如果跨天 肯定算作夜班
    if (start.format("YYYY-MM-DD") !== end.format("YYYY-MM-DD")) {
        return true;
    }

    // 2 如果开始时间在8:30之前，则肯定算作夜班
    if (start.isBefore(start.hour(8).minute(30))) {
        return true;
    }

    // 获取开始时间的日期部分
    const startDate = start.startOf("day");
    // 定义夜间时段边界
    const nightStart = startDate.hour(18).minute(0); // 当天18:00
    const nightEnd = startDate.add(1, "day").hour(8).minute(30); // 次日08:30

    // 检查时间段是否与夜间时段有重叠
    return (
        // 开始时间在夜间时段内
        (start.isAfter(nightStart) && start.isBefore(nightEnd)) ||
        // 结束时间在夜间时段内
        (end.isBefore(nightEnd) && end.isAfter(nightStart)) ||
        // 时间段完全包含夜间时段
        (start.isBefore(nightStart) && end.isAfter(nightEnd))
    );
}

// 时段/轮值夜班属性 A类   B类
// 18:00-21:00       10 元 10 元
// 21:00-24:00       10 元 10 元
// 24:00 后          10 元 10 元
//  {"胡鑫": {"2025-03-31": {"1800-2100": 0,"2100-2400": 0,"+1天0000-0830": 2.08,""夜班次数"": 1,"夜班档位": 1},}
// 处理当前日期的数据
function processRows(inTime, outTime, dateKey, dayData) {
    let hasNightShift = false;
    let count = 0;

    // 计算第一段1800-2100 的时间 通过 max min 获取到 落在 1800-2100 区间的时间
    const overlapStart1 = dayjs.max(dayjs(`${dateKey} 18:00`, "YYYY-MM-DD HH:mm"), inTime);
    const overlapEnd1 = dayjs.min(dayjs(`${dateKey} 21:00`, "YYYY-MM-DD HH:mm"), outTime);
    if (overlapEnd1.isAfter(overlapStart1)) {
        const durationInHours1 = overlapEnd1.diff(overlapStart1, "hour", true);

        if (durationInHours1 >= 0.83) {
            //! 根据要求大于50分钟
            dayData["1800-2100"] += durationInHours1;
            hasNightShift = true;
            count = count + 1;
        }
    }

    const overlapStart2 = dayjs.max(dayjs(`${dateKey} 21:00`, "YYYY-MM-DD HH:mm"), inTime);
    const overlapEnd2 = dayjs.min(dayjs(`${dateKey} 24:00`, "YYYY-MM-DD HH:mm"), outTime);
    if (overlapEnd2.isAfter(overlapStart2)) {
        const durationInHours2 = overlapEnd2.diff(overlapStart2, "hour", true);

        if (durationInHours2 >= 0.83) {
            //! 根据要求大于50分钟
            dayData["2100-2400"] += durationInHours2;
            hasNightShift = true;
            count = count + 1;
        }
    }

    const overlapStart3 = dayjs.max(dayjs(`${dateKey} 00:00`, "YYYY-MM-DD HH:mm").add(1, "day"), inTime);
    const overlapEnd3 = dayjs.min(dayjs(`${dateKey} 08:30`, "YYYY-MM-DD HH:mm").add(1, "day"), outTime);
    if (overlapEnd3.isAfter(overlapStart3)) {
        const durationInHours3 = overlapEnd3.diff(overlapStart3, "hour", true);

        if (durationInHours3 >= 0.83) {
            //! 根据要求大于50分钟
            dayData["+1天0000-0830"] += durationInHours3;
            hasNightShift = true;
            count = count + 1;
        }
    }
    // 只要有一个时间段满足 ≥ 1 小时，就标记为有夜班
    // dayData["夜班次数"] = hasNightShift ? "1" : null;
    // //console.log("count"+count);
    // dayData["夜班档位"] = count === 0 ? null : "/" + count * 10;
}

module.exports = { calculateNightShifts };
