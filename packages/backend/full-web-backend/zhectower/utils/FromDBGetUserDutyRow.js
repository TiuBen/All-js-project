const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");

// 扩展 dayjs 插件
dayjs.extend(duration);

async function GetDutyRows(req, db) {
    console.log("GetDutyRows");

    const {
        id,
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
        startDate,
        startTime,
        endDate,
        endTime,
        year,
        month,
    } = req;

    // console.log(req);

    let query = "SELECT * FROM duty WHERE 1=1";

    // Prepare the values for parameterized query to prevent SQL injection
    let params = [];

    // Add conditions based on available query parameters
    if (id) {
        query += ` AND id = ?`; // Add filter for 'id' if provided
        params.push(id);
    }

    if (username) {
        query += ` AND username = ?`; // Add filter for 'username' if provided
        params.push(username);
    }

    if (position) {
        // query += ` AND position = ?`; // Add filter for 'position' if provided
        // params.push(position);

        // Split the 'position' input string by ';'
        const positionsArray = position.split(",").map((p) => p.trim()); // Trim to avoid leading/trailing spaces
        console.log(positionsArray);

        for (let index = 0; index < positionsArray.length; index++) {
            const p = positionsArray[index];
            if (index === 0 && p !== "") {
                query += ` AND (position LIKE ?`;
                params.push(`%${p}%`);
            } else if (index > 0 && p !== "") {
                query += ` OR position LIKE ?`;
                params.push(`%${p}%`);
            } else {
            }
        }
        query += `)`;
    }

    if (dutyType !== undefined) {
        // Split the 'position' input string by ';'

        query += ` AND (dutyType LIKE ?`;
        params.push(`%${dutyType}%`);

        query += `)`;
    } else if (dutyType === undefined) {
        // query += ` AND dutyType IS NULL`;
    }

    if (inTime || (startDate && startTime)) {
        const _inTime = endDate + " " + endTime;

        query += ` AND inTime <=DATETIME(?)`; // Add filter for 'inTime' if provided
        params.push(_inTime);
    }

    if (outTime || (endDate && endTime)) {
        const _outTime = startDate + " " + startTime;

        query += ` AND outTime  >=DATETIME(?) `; // Add filter for 'outTime' if provided
        params.push(_outTime);
    } else {
        if (id) {
        } else {
            query += ` AND outTime IS NULL`; // Add filter for 'outTime' if provided
        }
    }

    // if (roleType) {
    //     // Split the 'roleType' input string by ';'
    //     const roleTypeArray = roleType.split(";").map((p) => p.trim()); /w/ Trim to avoid leading/trailing spaces
    //     console.log(roleTypeArray);

    //     for (let index = 0; index < roleTypeArray.length; index++) {
    //         const r = roleTypeArray[index]; // Renamed to 'r' for clarity
    //         if (index === 0 && r !== "") {
    //             query += ` AND (roleType LIKE ?`;
    //             params.push(`%${r}%`);
    //         } else if (index > 0 && r !== "") {
    //             query += ` OR roleType LIKE ?`;
    //             params.push(`%${r}%`);
    //         }
    //     }
    //     query += `)`;
    // }
    if (relatedDutyTableRowId) {
        const ids = relatedDutyTableRowId.split(";").map((id) => id.trim());
        query += ` AND relatedDutyTableRowId IN (${ids.map(() => "?").join(";")})`; // Add filter for 'relatedDutyTableRowId' if provided
        params.push(...ids);
    }

    if (roleStartTime) {
        query += ` AND roleStartTime>=DATETIME(?)`; // Add filter for 'roleStartTime' if provided
        params.push(roleStartTime);
    }

    if (roleEndTime) {
        query += ` AND roleEndTime <=DATETIME(?)`; // Add filter for 'roleEndTime' if provided
        params.push(roleEndTime);
    }

    if (roleTimes) {
        query += ` AND roleTimes = ?`; // Add filter for 'roleTimes' if provided
        params.push(roleTimes);
    }

    if (status) {
        query += ` AND status = ?`; // Add filter for 'status' if provided
        params.push(status);
    }

    if (relatedPrepareTableId) {
        query += ` AND relatedPrepareTableId = ?`; // Add filter for 'relatedPrepareTableId' if provided
        params.push(relatedPrepareTableId);
    }

    // if (year && month) {
    //     const _mm = dayjs(month, ["M", "MM"]).format("MM");
    //     // console.log(_mm);

    //     query = `
    //     SELECT * FROM duty
    //     WHERE (strftime('%Y', inTime) = ? AND strftime('%m', inTime) = ?)
    //        OR (outTime IS NULL AND strftime('%Y', inTime) = ? AND strftime('%m', inTime) = ?)
    //        OR (outTime IS NOT NULL AND strftime('%Y', outTime) = ? AND strftime('%m', outTime) = ?);
    //   `;
    //     params = [year, _mm, year, _mm, year, _mm];
    // }
    // console.log("ddd===========================");
    // console.log(query);
    // console.log(params);

    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            // db.all("SELECT * FROM duty WHERE id=333", (err, rows) => {
            if (err) {
                console.error(`Error executing query "${query}":`, error.message);
                reject(err);
            } else {
                const _rows = _calTimeDuration(rows);
                // console.log(JSON.stringify(_rows));
                resolve(_rows);
            }
        });
    });
}

// ! rows is just like get from database

// 计算单个时间段的夜班和白班时间
const _calculateShift = (start, end) => {
    // // Parse start and end times
    // const start = dayjs(startTime);
    // const end = dayjs(endTime);

    // Initialize total day and night shifts
    let totalDayShift = 0;
    let totalNightShift = 0;

    // Define the split point (08:00:00)
    const splitTime = "08:00:00";

    const calculateShift = (start, end) => {
        let dayShift = 0;
        let nightShift = 0;

        // 获取当天的分界点时间
        const splitPoint = start.startOf("day").hour(8).minute(0).second(0);

        // 情况 1：开始时间和结束时间都在分界点之前（全部是夜班）
        if (start.isBefore(splitPoint) && end.isBefore(splitPoint)) {
            nightShift = end.diff(start, "hour", true);
        }
        // 情况 2：开始时间和结束时间都在分界点之后（全部是白班）
        else if (start.isAfter(splitPoint) && end.isAfter(splitPoint)) {
            dayShift = end.diff(start, "hour", true);
        }
        // 情况 3：开始时间在分界点之前，结束时间在分界点之后（跨夜班和白班）
        else if (start.isBefore(splitPoint) && end.isAfter(splitPoint)) {
            // console.log(start.format("YYYY-MM-DD HH:mm:ss"));
            // console.log(end.format("YYYY-MM-DD HH:mm:ss"));

            // 夜班时间：从开始时间到分界点
            nightShift = splitPoint.diff(start, "hour", true);
            // 白班时间：从分界点到结束时间
            dayShift = end.diff(splitPoint, "hour", true);
            // console.log("nightShift", nightShift);
            // console.log("dayShift", dayShift);
        }

        return { dayShift, nightShift };
    };

    // Iterate through each day
    let currentStart = start;
    while (!currentStart.isAfter(end)) {
        // End of the current day (23:59:59)
        const currentEndOfDay = currentStart.endOf("day");

        // Calculate shifts for the current day
        const { dayShift, nightShift } = calculateShift(
            currentStart,
            currentEndOfDay.isBefore(end) ? currentEndOfDay : end
        );

        // Add to total shifts
        totalDayShift += dayShift;
        totalNightShift += nightShift;

        // Move to the next day
        currentStart = currentEndOfDay.add(1, "second");
    }

    return { totalDayShift, totalNightShift };
};

function _calTimeDuration(rows, splitTime) {
    // let split=dayjs("2024-01-01 "+splitTime,"YYYY-MM-DD HH:mm:ss").hour();
    const _rows = structuredClone(rows);
    for (let index = 0; index < _rows.length; index++) {
        const { inTime, outTime = dayjs().format("YYYY-MM-DD HH:mm:ss") } = _rows[index];
        let dayjsInTime = dayjs(inTime, "YYYY-MM-DD HH:mm:ss");
        let dayjsOutTime = dayjs(outTime, "YYYY-MM-DD HH:mm:ss");
        const { totalDayShift, totalNightShift } = _calculateShift(dayjsInTime, dayjsOutTime);
        _rows[index].dayShift = Math.floor(totalDayShift * 100) / 100;

        _rows[index].nightShift = Math.floor(totalNightShift * 100) / 100;
    }

    return _rows;
}

function timeDifference(inTime, outTime) {
    // console.log(`timeDifference ${inTime} ${outTime}`);

    // if (!inTime || !outTime) return 0; // 如果没有出勤或离岗时间，返回0
    const startTime = dayjs(inTime, "YYYY-MM-DD HH:mm:ss");
    const endTime = outTime === null ? dayjs() : dayjs(outTime, "YYYY-MM-DD HH:mm:ss");
    const _d = endTime.diff(startTime, "h", true);
    // console.log(_d);

    if (endTime - startTime < 0.02) return 0;
    return _d; // 返回小时数
}

// const matchesFilter = (value, filter) => {
//     if (Array.isArray(filter)) {
//         return filter.includes(value);
//     } else if (filter === "NOT NULL") {
//         return value !== null;
//     } else if (filter === "null") {
//         return value === null;
//     }
//     return value === filter;
// };

// const matchesFilter = (item, na, value, filter) => {
//     console.log("====" + na);

//     if (Array.isArray(filter)) {
//         if (filter.includes(null)) {
//             return value === null;
//         } else if (filter.includes("NOT NULL")) {
//             return value !== null;
//         } else {
//             return filter.includes(value);
//         }
//     }else {
//         console.log(item);
//         console.log(value, filter);
//         return value === filter;
//         // throw "error";
//     }
// };

const _positionMatch = (item, filter) => {
    // console.log("_positionMatch");
    if (filter.includes("NOT NULL")) {
        let _xx;
        if(item === null){
            _xx=null;
        }else{
            _xx="NOT NULL";
        }

        if (filter.includes(_xx)) {
            return true;
        } else {
            return false;
        }
    } else {
        if (filter.includes(item)) {
            return true;
        } else {
            return false;
        }
    }
};

function SumTimeByField(data, filters) {
    const _test = structuredClone(filters);

    data.forEach((dbRow) => {
        const {
            dayShift,
            nightShift,
            position: iPosition,
            dutyType: iDutyType,
            roleType: iRoleType,
            relatedDutyTableRowId: iRelatedDutyTableRowId,
        } = dbRow;

        for (const key in filters) {
            if (key === "totalTime") continue;

            const { position, dutyType, roleType, relatedDutyTableRowId } = filters[key].filter;
            const matchesPosition = _positionMatch(iPosition, position);
            const matchesDutyType = _positionMatch(iDutyType, dutyType);
            const matchesRoleType = _positionMatch(iRoleType, roleType);
            const matchesRelatedDutyTableRowId = _positionMatch(iRelatedDutyTableRowId, relatedDutyTableRowId);
            // if (key === "totalTeacherTime") {
            //     console.log(iPosition + " " + iDutyType + " " + iRoleType + " " + iRelatedDutyTableRowId);
            //     console.log(
            //         matchesPosition + " " + matchesDutyType + " " + matchesRoleType + " " + matchesRelatedDutyTableRowId
            //     );
            // }
            if (matchesPosition && matchesDutyType && matchesRoleType && matchesRelatedDutyTableRowId) {
                // Update dayShift and nightShift
                _test[key].dayShift += dbRow.dayShift;
                _test[key].nightShift += dbRow.nightShift;
            }
        }
    });

    return _test;
}

module.exports = { GetDutyRows, SumTimeByField };
