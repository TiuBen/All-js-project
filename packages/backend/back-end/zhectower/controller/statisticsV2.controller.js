const { db } = require("../utils/SqliteDb");

const dayjs = require("dayjs");
var isBetween = require("dayjs/plugin/isBetween");
var isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

dayjs.extend(isBetween);
const { usernames } = require("../utils/CONST");

//  the return value is an object like this
const testData = [
    {
        沈宁: {
            dutyTime: {
                "2024-08-01": {
                    totalTime: "08:00:00",
                    nightTime: "",
                },
                "2024-08-02": {
                    totalTime: "08:00:00",
                    nightTime: "",
                },
            },
            roleType: "见习",
            roleTime: {
                "2024-08-01": {
                    totalTime: "08:00:00",
                    nightTime: "",
                },
                "2024-08-02": {
                    totalTime: "08:00:00",
                    nightTime: "",
                },
            },
            totalTime: "",
            totalDayTime: "",
            totalNightTime: "",
            nightCount: "",
        },
    },
];

// ! this function sum  the [{"2024-08-01":"3"},{"2024-08-01":"4"},{"2024-08-03":"5"}]
// ! to this {"2024-08-01": 7, "2024-08-03": 5}
// ! use the date=2024-08-01 as the key
// ! use the that date's time as the value
function _sumDurationInTheSameDay(durationArray = []) {
    var result = {};

    durationArray.forEach((item) => {
        for (let key in item) {
            // If the key is already in the result object, add the value to it
            if (result[key]) {
                result[key] += item[key];
            } else {
                // Otherwise, initialize it with the current value
                result[key] = item[key];
            }
        }
    });

    return result;
}

//! 计算某一天内的时间
//! 返回一个 {"2024-08-01": 4.1} 这种obj
function _calTimeDurationInSameDay(
    _inTime, // "2024-08-01 08:00:00" but the need start Time is  07:00:00 or 09:00:00
    _outTime, // "2024-08-01 08:00:00" but the need start Time is  07:00:00 or 09:00:00
    slotStartTimeString = "00:00:00",
    slotEndTimeString = "24:00:00"
) {
    // console.log("same day function!");
    // console.log("startTime: " + _inTime + " -> endTime: " + _outTime);
    let inTime = dayjs(_inTime);
    let outTime = dayjs(_outTime);
    // let sameDayOutTime = dayjs(inTime.format("YYYY-MM-DD") + outTime.format("HH:mm:ss"));
    // console.log("sameDayOutTime:"+sameDayOutTime.format("YYYY-MM-DD  HH:mm:ss"));

    const newSlotStartTime = dayjs(inTime.format("YYYY-MM-DD") + " " + slotStartTimeString);
    const newSlotEndTime = dayjs(inTime.format("YYYY-MM-DD") + " " + slotEndTimeString);
    // console.log("newSlotStartTime:" + newSlotStartTime.format("YYYY-MM-DD  HH:mm:ss"));
    // console.log("newSlotEndTime  :" + newSlotEndTime.format("YYYY-MM-DD  HH:mm:ss"));

    //! check "2024-08-01 08:00:00" but the need start Time is  07:00:00 or 09:00:00
    if (inTime.isAfter(newSlotEndTime) || outTime.isBefore(newSlotStartTime)) {
        // console.log("时间范围外");
        let duration = { [inTime.format("YYYY-MM-DD")]: 0 };
        // console.log(duration);
        return duration;
    } else {
        // console.log("在时间范围内");
        const timeBegin = inTime.isBefore(newSlotStartTime) ? newSlotStartTime : inTime;
        const timeEnd = outTime.isAfter(newSlotEndTime) ? newSlotEndTime : outTime;
        // console.log(
        //     "在时间范围内" + dateBegin.format("YYYY-MM-DD  HH:mm:ss") + " -> " + dateEnd.format("YYYY-MM-DD  HH:mm:ss")
        // );
        var _diff = timeEnd.diff(timeBegin, "h", true); // 单位是秒
        let duration = { [inTime.format("YYYY-MM-DD")]: _diff };
        // console.log(duration);
        return duration;
    }
}

//! if the inTime and outTime not the same day
//! need this function
//! cal time duration with day range maybe more than one day
//! return an array like
//! [{"2024-08-01": 4.1}]
//! or
//! [{"2024-08-01": 4.1},{"2024-08-02": 2.1},{"2024-08-02": 3.1}]
function _calTimeDurationBetweenDifferentDay(
    _inTime,
    _outTime,
    slotStartTimeString = "00:00:00",
    slotEndTimeString = "24:00:00"
) {
    console.log(
        "_calTimeDurationBetweenDifferentDay:  " +
            _inTime +
            " " +
            slotStartTimeString +
            " -> " +
            _outTime +
            " " +
            slotEndTimeString
    );

    let inTime = dayjs(_inTime);
    let outTime = dayjs(_outTime);
    const _durationArray = [];

    //! inTime 和 outTime 是否是同一天
    // if (
    //     dayjs(inTime).isSame(dayjs(outTime), "day") ||
    //     (dayjs(outTime).diff(dayjs(inTime), "d") <= 1 && dayjs(outTime).diff(dayjs(inTime), "m") <= 24 * 60)
    // ) {
    if (dayjs(inTime).isSame(dayjs(outTime), "day")) {
        _durationArray.push(_calTimeDurationInSameDay(_inTime, _outTime, slotStartTimeString, slotEndTimeString));
    } else {
        // console.log("====not same day");
        var dayCount = 0;
        let dateStart = dayjs(inTime);
        while (dayjs(dateStart).format("YYYY-MM-DD") !== dayjs(outTime).format("YYYY-MM-DD")) {
            // console.log("++++++++" + dateStart.format("YYYY-MM-DD"));
            dateStart = dateStart.add(1, "day");
            dayCount++;
        }

        // 还少一天

        console.log("dayCount:" + dayCount);
        // if(dayjs(outTime).diff(dayjs(inTime), "m") > 24 * 60){
        //     dayCount += 1;
        // }

        for (let index = 0; index < dayCount + 1; index++) {
            if (index === 0) {
                // console.log("first");
                _durationArray.push(
                    _calTimeDurationInSameDay(
                        _inTime,
                        dayjs(inTime.add(index, "day").format("YYYY-MM-DD") + " " + slotEndTimeString).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        slotStartTimeString,
                        slotEndTimeString
                    )
                );
            } else if (index === dayCount) {
                // console.log("last");

                _durationArray.push(
                    _calTimeDurationInSameDay(
                        dayjs(inTime.add(index, "day").format("YYYY-MM-DD") + " " + slotStartTimeString).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        _outTime,
                        slotStartTimeString,
                        slotEndTimeString
                    )
                );
            } else {
                // console.log("====not same day index:" + index);

                _durationArray.push(
                    _calTimeDurationInSameDay(
                        dayjs(inTime.add(index, "day").format("YYYY-MM-DD") + " " + slotStartTimeString).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        dayjs(inTime.add(index, "day").format("YYYY-MM-DD") + " " + slotEndTimeString).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        slotStartTimeString,
                        slotEndTimeString
                    )
                );
            }
        }
    }

    return _durationArray;
}

// startDate = "2024-08-01 00:00:00",
// endDate = "2024-09-30 00:00:00",
// startDate, //" 2024-08-01 "
// endDate, // " 2024-09-30 "
// startTime, //" 08:00:00 "
// endTime //" 23:00:00 "
async function _calTimeDurationArray(username = "边昊", startDate, endDate, startTime, endTime) {
    // ! 获取用户在指定日期内的值班记录
    const querySql = `SELECT * FROM duty where 
        username="${username}" 
    and 
        inTime<=datetime("${endDate + " " + endTime}") 
    and 
        outTime>=datetime("${startDate + " " + startTime}") 
    or ( username="${username}" and inTime<=datetime("${endDate + " " + endTime}") and outTime is NULL )`;

    // console.log(username + " ： startDate+" + startDate + " endDate:" + endDate);

    // console.log(querySql);
    // const querySql = `SELECT * FROM duty where username="边昊" and outTime>=datetime("2024-08-01 00:00:00") or outTime is NULL AND inTime<=datetime("2024-09-30 00:00:00")`;
    // console.log(querySql);
    const _dateRangeArray = [];
    const _startDate = dayjs(startDate, "YYYY-MM-DD HH:mm:ss");
    const daysCount = dayjs(endDate, "YYYY-MM-DD HH:mm:ss").diff(_startDate, "day");
    // console.log(daysCount);
    // ! the _dateRangeArray is like ["2024-08-01","2024-08-02","2024-08-03"]
    for (let index = 0; index < daysCount + 1; index++) {
        const _d = _startDate.add(index, "d").format("YYYY-MM-DD");
        _dateRangeArray.push(_d);
    }
    // console.log(_dateRangeArray);

    return new Promise((resolve, reject) => {
        db.all(querySql, async function (err, rows) {
            if (err) {
                console.error(err.message);

                return reject({ error: "error", message: querySql });
                // return { error: "error", message: querySql };
            } else {
                console.log("rows:");
                console.log(rows);
                var allDayTimeArray = [];
                var allNightTimeArray = [];
                var allRoleTimeArray = [];
                if (rows.length > 0) {
                    for (let index = 0; index < rows.length; index++) {
                        // console.log(rows[index]);
                        const { inTime, outTime, roleType, relatedDutyTableRowId, roleStartTime, roleEndTime } =
                            rows[index];
                        let _outTime = outTime === null ? dayjs().format("YYYY-MM-DD HH:mm:ss") : outTime;
                        let _roleEndTime = roleEndTime === null ? dayjs().format("YYYY-MM-DD HH:mm:ss") : roleEndTime;

                        let resultAllDay = _calTimeDurationBetweenDifferentDay(
                            inTime,
                            _outTime,
                            "00:00:00",
                            "24:00:00"
                        );
                        console.log("resultAllDay:");
                        // console.log(resultAllDay);
                        allDayTimeArray = [...allDayTimeArray, ...resultAllDay];
                        // console.log(allDayTimeArray);

                        let resultNightTime = _calTimeDurationBetweenDifferentDay(
                            inTime,
                            _outTime,
                            "00:00:00",
                            "08:00:00"
                        );
                        console.log("===resultNightTime:");
                        allNightTimeArray = [...allNightTimeArray, ...resultNightTime];
                        // console.log(allNightTimeArray);

                        // ! 处理 roleType
                        if (roleType === "见习") {
                            // 学员每次只有一个条目 直接取出时间
                            let roleTimeArray = _calTimeDurationBetweenDifferentDay(
                                roleStartTime,
                                _roleEndTime,
                                "00:00:00",
                                "24:00:00"
                            );
                            console.log("roleType === 见习");
                            allRoleTimeArray = [...allRoleTimeArray, ...roleTimeArray];
                            // console.log(allRoleTimeArray);
                        } else {
                            if (relatedDutyTableRowId !== null && roleType !== "见习") {
                                console.log("===relatedDutyTableRowId:" + relatedDutyTableRowId);
                                const dutyTableRowsId = relatedDutyTableRowId
                                    .split(";") // Split the string by semicolon
                                    .filter(Boolean) // Remove any empty strings
                                    .map(Number);

                                // Handle "教员" role
                                const rolePromises = dutyTableRowsId.map(async (rowId) => {
                                    const getRoleTimeSql = `SELECT * FROM duty where id=${rowId}`;
                                    return new Promise((resolve, reject) => {
                                        db.get(getRoleTimeSql, async function (err, oneRow) {
                                            if (err) {
                                                console.error(err.message);
                                                return reject({ error: "error", message: getRoleTimeSql });
                                            } else {
                                                const { inTime, outTime } = oneRow;
                                                let _outTime = outTime === null ? dayjs().format("YYYY-MM-DD HH:mm:ss") : outTime;

                                                const resultRoleTime = _calTimeDurationBetweenDifferentDay(
                                                    inTime,
                                                    _outTime,
                                                    "00:00:00",
                                                    "24:00:00"
                                                );
                                                resolve(resultRoleTime);
                                            }
                                        });
                                    });
                                });

                                // Wait for all promises to resolve
                                const roleTimeResults = await Promise.all(rolePromises);
                                allRoleTimeArray = [].concat(...roleTimeResults);

                                console.log("roleType === 教员");
                                // console.log(allRoleTimeArray);
                            }
                        }
                    }
                    // console.log("timeArray");

                    // console.log(timeArray);
                    // console.log("sum timeArray");
                    const allDayTimeObject = _sumDurationInTheSameDay(allDayTimeArray);
                    console.log("allDayTimeObject");
                    console.log(allDayTimeObject);
                    const allNightTimeObject = _sumDurationInTheSameDay(allNightTimeArray);
                    console.log("allNightTimeObject");
                    console.log(allNightTimeObject);
                    const allRoleTimeObject = _sumDurationInTheSameDay(allRoleTimeArray);
                    console.log("allRoleTimeObject");
                    console.log(allRoleTimeObject);

                    const formattedData = {};

                    for (const [date, totalSeconds] of Object.entries(allDayTimeObject)) {
                        formattedData[date] = {
                            totalTime: totalSeconds,
                            nightTime: 0,
                            roleTime: 0,
                        };
                    }
                    for (const [date, totalSeconds] of Object.entries(allNightTimeObject)) {
                        formattedData[date]["nightTime"] = totalSeconds;
                    }
                    for (const [date, totalSeconds] of Object.entries(allRoleTimeObject)) {
                        formattedData[date]["roleTime"] = totalSeconds;
                    }
                    // console.log("formattedData");
                    // console.log(username+ "formattedData");
                    // console.log(JSON.stringify(formattedData));
                    return resolve(formattedData);
                } else {
                    // console.log(username+"no duty record");
                    return resolve({});
                }
            }
        });
    });
}
async function GetStatistics(req, res) {
    console.log("GetStatistics");
    console.log(req.query);
    //! the pass data formate is YYYY-MM-DD
    //! the pass time formate is HH:MM

    const { username, startDate, startTime, endDate, endTime } = req.query;
    // const startTime = "2024-08-01 00:00:00";
    // const endTime = "2024-09-28 24:00:00";

    // const allUserDutyData = {};
    if (username) {
        const user = {};
        const dutyTime = await _calTimeDurationArray(username, startDate, endDate, startTime + ":00", endTime + ":00");
        console.log("=========================================================");
        console.log(dutyTime);
        let totalTime = 0;
        let totalNightTime=0;
        let nightCount=0;
        let totalRoleTime=0;
        for (const [date, timeObject] of Object.entries(dutyTime)) {
            totalTime += timeObject.totalTime;
            totalNightTime += timeObject.nightTime;
            if (timeObject.nightTime > 0.08) {
                nightCount++;
            }
            totalRoleTime+=timeObject.roleTime;
        }
        user[username]={
            dutyTime: dutyTime,
            totalTime:totalTime,
            nightTime:totalNightTime,
            nightCount:nightCount,
            roleTime:totalRoleTime
        }
      



        res.send(user);
        return;
    }

    if (startDate && endDate && startTime && endTime) {
        const user = {};

        for (let index = 0; index < usernames.length; index++) {
            const username = usernames[index];
            const all3KindTime = await _calTimeDurationArray(
                username,
                startDate,
                endDate,
                startTime + ":00",
                endTime + ":59"
            );
            // console.log(username+"-----------------------------");
            // console.log(dutyTime);
            let totalTime = 0;
            let totalNightTime = 0;
            let nightCount = 0;
            let totalRoleTime=0;
            for (const [date, timeObject] of Object.entries(all3KindTime)) {
                totalTime += timeObject.totalTime;
                totalNightTime += timeObject.nightTime;
                if (timeObject.nightTime > 0.08) {
                    nightCount++;
                }
                totalRoleTime+=timeObject.roleTime;
            }
            
            // console.log("totalNightTime:"+totalNightTime);
            user[username] = {
                dutyTime: all3KindTime,
                totalTime: totalTime,
                totalDayTime: "",
                totalNightTime: totalNightTime,
                nightCount: nightCount,
                totalRoleTime: totalRoleTime
            };
            // allUserDutyData[username]=user;
        }
        // console.log(JSON.stringify(allUserDutyData));
        res.send(user);
        return;
    } else {
        res.status(500).send(req.query);
        return;
    }
}

module.exports = { GetStatistics, _calTimeDurationArray };
