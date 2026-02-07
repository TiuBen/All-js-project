const { db } = require("../utils/SqliteDb");

const dayjs = require("dayjs");
var isBetween = require("dayjs/plugin/isBetween");
var isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

dayjs.extend(isBetween);
const { usernames } = require("../utils/CONST");

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
            totalTime: "",
            totalDayTime: "",
            totalNightTime: "",
            nightCount: "",
        },
    },
];

// function calculateDuration(time1, time2, gateTimeStart, gateTimeEnd, minimalSeparation = 30, total) {
//     if (dayjs(time1).isAfter(gateTimeEnd) || dayjs(time2).isBefore(gateTimeStart)) {
//         console.log("时间范围外");
//     } else {
//         let _startTime = dayjs(time1).isBefore(dayjs(gateTimeStart)) ? dayjs(gateTimeStart) : dayjs(time1);
//         let _endTime = dayjs(time2).isAfter(dayjs(gateTimeEnd)) ? dayjs(gateTimeEnd) : dayjs(time2);
//         let _duration = dayjs(_endTime).diff(_startTime, "s");
//         //! 时间差小于 30 秒 抛弃
//         if (_duration < minimalSeparation) {
//             console.log("时间差小于 30 秒 抛弃");
//         } else {
//             return _duration;
//         }
//     }
// }

function _calTimeDuration(_inTime, _outTime, slotStartTime = "00:00:00", slotEndTime = "24:00:00") {
    // console.log(_inTime + " -> " + _outTime);
    // console.log(dayjs(inTime).isSame(dayjs(outTime), "day"));
    let inTime = dayjs(_inTime);
    let outTime = dayjs(_outTime);

    // ! 这是计算 当天00:00:00 到 23:59:59 的时间差
    if (dayjs(inTime).isSame(dayjs(outTime), "day")) {
        // console.log("same day");
        let _diff = outTime.diff(inTime, "s");
        let duration = {};
        duration = { [inTime.format("YYYY-MM-DD")]: _diff };
        // console.log(duration);
        return duration;
    } else {
        // console.log("====not same day");
        const dayCount = dayjs(outTime).diff(dayjs(inTime), "d");

        // console.log(dayCount);
        const _durationArray = [];

        let endTime = dayjs(inTime).endOf("day");
        const _diff1 = endTime.diff(inTime, "m");
        let duration1 = { [inTime.format("YYYY-MM-DD")]: _diff1 };
        _durationArray.push(duration1);

        for (let index = 0; index < dayCount - 1; index++) {
            _durationArray.push({ [inTime.add(1 + index, "day").format("YYYY-MM-DD")]: 24 * 60 });
        }

        let startTime = dayjs(outTime).startOf("day");
        const _diff2 = outTime.diff(startTime, "m");
        let duration2 = { [outTime.format("YYYY-MM-DD")]: _diff2 };
        _durationArray.push(duration2);

        // console.log(_durationArray);

        return _durationArray;
    }

    // const dateBegin = dayjs(inTime).isBefore(dayjs(slotStartTime)) ? dayjs(slotStartTime) : dayjs(inTime);
    // const dateEnd = dayjs(outTime).isAfter(dayjs(slotEndTime)) ? dayjs(slotEndTime) : dayjs(outTime);
    // var duration = dateEnd.diff(dateBegin, "m"); // 单位是秒
    // console.log(dateBegin.format("YYYY-MM-DD HH:mm:ss")+" -> "+dateEnd.format("YYYY-MM-DD HH:mm:ss"));
    // // console.log(duration);
    // // if (duration <= 30) {
    // //     //30秒内抛弃
    // //     duration = 0;
    // // }
    // console.log( { [`${slotStartTime}_${slotEndTime}`]: duration });
    // return { [`${slotStartTime}_${slotEndTime}`]: duration };
}

//! 计算某一天内的时间
//! 返回一个 {"2024-08-01": 4.1} 这种obj 

function _calTimeDurationInSameDay(
    _inTime,
    _outTime,
    slotStartTimeString = "00:00:00",
    slotEndTimeString = "24:00:00"
) {
    // console.log("same day function!");
    // console.log("startTime: " + _inTime + " -> endTime: " + _outTime);
    let inTime = dayjs(_inTime);
    let outTime = dayjs(_outTime);
    // let sameDayOutTime = dayjs(inTime.format("YYYY-MM-DD") + outTime.format("HH:mm:ss"));
    // console.log("sameDayOutTime:"+sameDayOutTime.format("YYYY-MM-DD  HH:mm:ss"));

    const newSlotStartTime = dayjs(inTime.format("YYYY-MM-DD")+" " + slotStartTimeString);
    const newSlotEndTime = dayjs(inTime.format("YYYY-MM-DD")+" " + slotEndTimeString);
    // console.log("newSlotStartTime:" + newSlotStartTime.format("YYYY-MM-DD  HH:mm:ss"));
    // console.log("newSlotEndTime  :" + newSlotEndTime.format("YYYY-MM-DD  HH:mm:ss"));

    if (inTime.isAfter(newSlotEndTime) || outTime.isBefore(newSlotStartTime)) {
        // console.log("时间范围外");
        let duration = { [inTime.format("YYYY-MM-DD")]: 0 };
        // console.log(duration);
        return duration;
    } else {
        // console.log("在时间范围内");
        const dateBegin = inTime.isBefore(newSlotStartTime) ? newSlotStartTime : inTime;
        const dateEnd = outTime.isAfter(newSlotEndTime) ? newSlotEndTime : outTime;
        // console.log(
        //     "在时间范围内" + dateBegin.format("YYYY-MM-DD  HH:mm:ss") + " -> " + dateEnd.format("YYYY-MM-DD  HH:mm:ss")
        // );
        var _diff = dateEnd.diff(dateBegin, "h", true); // 单位是秒
        let duration = { [inTime.format("YYYY-MM-DD")]: _diff };
        // console.log(duration);
        return duration;
    }
}

//! cal time duration with day range maybe more than one day
//! return an array like  [{"2024-08-01": 4.1}]
//! or [{"2024-08-01": 4.1},{"2024-08-02": 2.1},{"2024-08-02": 3.1}]
function _calTimeDuration2(_inTime, _outTime, slotStartTimeString = "00:00:00", slotEndTimeString = "24:00:00") {
    // console.log("f2:  " + _inTime + " -> " + _outTime);

    let inTime = dayjs(_inTime);
    let outTime = dayjs(_outTime);
    const _durationArray = [];


    //! inTime 和 outTime 是否是同一天
    if (
        dayjs(inTime).isSame(dayjs(outTime), "day") ||
        (dayjs(outTime).diff(dayjs(inTime), "d") <= 1 && dayjs(outTime).diff(dayjs(inTime), "m") <= 24 * 60)
    ) {
        _durationArray.push(_calTimeDurationInSameDay(_inTime, _outTime, slotStartTimeString, slotEndTimeString));
    } else {
        // console.log("====not same day");
        const dayCount = dayjs(outTime).diff(dayjs(inTime), "d");
        // console.log("dayCount:" + dayCount);

        for (let index = 0; index < dayCount + 1; index++) {
            if (index === 0) {
                // console.log("first");
                _durationArray.push(
                    _calTimeDurationInSameDay(
                        _inTime,
                        dayjs(inTime.add(index, "day").format("YYYY-MM-DD") + slotEndTimeString).format(
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
                        dayjs(inTime.add(index, "day").format("YYYY-MM-DD") + slotStartTimeString).format(
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
                        dayjs(inTime.add(index, "day").format("YYYY-MM-DD") + slotStartTimeString).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                        dayjs(inTime.add(index, "day").format("YYYY-MM-DD") + slotEndTimeString).format(
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

//! add the same day duration
//! return obj like {
//!    "2024-08-01": 4.1,
//!    "2024-08-02": 2.1
//! }
function _sumDuration(durationArray) {
    var result = {};
    if (Array.isArray(durationArray)) {
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
    }

    return result;
}

// function _giveKeyName(keyName, ob) {
//     const formattedData = {};

//     for (const [date, totalSeconds] of Object.entries(ob)) {
//         formattedData[date] = {
//             [keyName]: totalSeconds,
//             nightTime: "", // Assuming no nightTime data is provided
//         };
//     }

//     return formattedData;
// }


// return obj like 
// {
//     "2024-08-01": {
//         "total": 4.1,
//         "night": ""
//     },
//     "2024-08-02": {
//         "total": 2.1,
//         "night": ""
//     }
// }


async function _calTimeDurationArray(
    username = "边昊",
    // startDate = "2024-08-01 00:00:00",
    // endDate = "2024-09-30 00:00:00",
    startDate,
    endDate,
    dutyTime
) {
    // ! 获取用户在指定日期内的值班记录
    const querySql = `SELECT * FROM duty where username="${username}" and inTime<=datetime("${endDate}") and outTime>=datetime("${startDate}") or (username="${username}" and inTime<=datetime("${endDate}") and outTime is NULL )`;

    // console.log(username + " ： startDate+" + startDate + " endDate:" + endDate);

    console.log(querySql);
    // const querySql = `SELECT * FROM duty where username="边昊" and outTime>=datetime("2024-08-01 00:00:00") or outTime is NULL AND inTime<=datetime("2024-09-30 00:00:00")`;
    // console.log(querySql);
    const _dateRangeArray = [];
    const _startDate = dayjs(startDate, "YYYY-MM-DD HH:mm:ss");
    const daysCount = dayjs(endDate, "YYYY-MM-DD HH:mm:ss").diff(_startDate, "day");
    // console.log(daysCount);
    for (let index = 0; index < daysCount + 1; index++) {
        const _d = _startDate.add(index, "d").format("YYYY-MM-DD");
        _dateRangeArray.push(_d);
    }
    // console.log(_dateRangeArray);

    return new Promise((resolve, reject) => {
        db.all(querySql, function (err, rows) {
            if (err) {
                console.error(err.message);

                return reject({ error: "error", message: querySql });
                // return { error: "error", message: querySql };
            } else {
                // console.log(rows);
                var allDayTimeArray = [];
                var allNightTimeArray = [];
                if (rows.length > 0) {
                    for (let index = 0; index < rows.length; index++) {
                        const { inTime, outTime } = rows[index];
                        let _outTime = outTime ? outTime : dayjs().format("YYYY-MM-DD HH:mm:ss");
                        let resultAllDay = _calTimeDuration2(inTime, _outTime, "00:00:00", "24:00:00");
                        // console.log("resultAllDay:");
                        // console.log(resultAllDay);

                        let resultNightTime = _calTimeDuration2(inTime, _outTime, "00:00:00", "08:00:00");
                        // console.log("===resultNightTime:");
                        // console.log(resultNightTime);

                        resultAllDay.forEach((element) => {
                            // console.log(element);
                            const [key1] = Object.keys(element);
                            if (_dateRangeArray.includes(key1)) {
                                allDayTimeArray.push(element);
                            }
                        });

                        resultNightTime.forEach((element) => {
                            const [key1] = Object.keys(element);
                            if (_dateRangeArray.includes(key1)) {
                                console.log("===nightTime:");
                                console.log(element);
                                allNightTimeArray.push(element);
                            }
                        });
                    }
                    // console.log("timeArray");

                    // console.log(timeArray);
                    // console.log("sum timeArray");
                    const allDayTimeObject = _sumDuration(allDayTimeArray);
                    const allNightTimeObject = _sumDuration(allNightTimeArray);
                    // console.log(_giveKeyName("totalTime",_sumDuration(timeArray)));
                    const formattedData = {};

                    for (const [date, totalSeconds] of Object.entries(allDayTimeObject)) {
                        formattedData[date] = {
                            totalTime: totalSeconds,
                            nightTime: 0,
                        };
                    }
                    for (const [date, totalSeconds] of Object.entries(allNightTimeObject)) {
                        formattedData[date]["nightTime"] = totalSeconds;
                    }
                    // console.log("formattedData");
                    // console.log(username+ "formattedData");

                    // console.log(formattedData);
                    return resolve(formattedData);
                } else {
                    // console.log(username+"no duty record");
                    return resolve({});
                }
            }
        });
    });

    // let dayCount = dayjs(endDate).diff(dayjs(startDate), "d");
    // let _dayDurationJson = {};
    // for (let index = 0; index < dayCount; index++) {
    //     const element = dayjs(startDate).add(index, "d").format("YYYY-MM-DD");
    //     _dayDurationJson[element] = 0;
    // }
    // return _dayDurationJson;
}

async function _calRoleTimeDurationArray(
    username,
    // startDate = "2024-08-01 00:00:00",
    // endDate = "2024-09-30 00:00:00",
    startDate,
    endDate,
    slotStartTimeString = "00:00:00", slotEndTimeString = "24:00:00"
) {
    // ! 获取用户在指定日期内的值班记录
    const querySql = `SELECT * FROM duty where 
            username="${username}" and 
            inTime<=datetime("${endDate}") and 
            outTime>=datetime("${startDate}") 
        or 
            (username="${username}" and 
            inTime<=datetime("${endDate}") 
            and outTime is NULL ) 
        and 
            relatedDutyTableRowId NOT NULL`;

    // console.log(username + " ： startDate+" + startDate + " endDate:" + endDate);

    console.log(querySql);

    const _dateRangeArray = [];
    const _startDate = dayjs(startDate, "YYYY-MM-DD HH:mm:ss");
    const daysCount = dayjs(endDate, "YYYY-MM-DD HH:mm:ss").diff(_startDate, "day");
    // console.log(daysCount);
    for (let index = 0; index < daysCount + 1; index++) {
        const _d = _startDate.add(index, "d").format("YYYY-MM-DD");
        _dateRangeArray.push(_d);
    }
    // console.log(_dateRangeArray);

    return new Promise((resolve, reject) => {
        db.all(querySql, function (err, rows) {
            if (err) {
                console.error(err.message);

                return reject({ error: "error", message: querySql });
                // return { error: "error", message: querySql };
            } else {
                // console.log(rows);

                if (rows.length > 0) {
                    for (let index = 0; index < rows.length; index++) {
                        const { relatedDutyTableRowId } = rows[index];
                        const dutyTableRowId = relatedDutyTableRowId
                            .split(";") // Split the string by semicolon
                            .filter(Boolean) // Remove any empty strings
                            .map(Number);

                        for (let x = 0; x < dutyTableRowId.length; x++) {
                            const getRoleTimeSql = `SELECT * FROM dutyTableRow where id=${dutyTableRowId[x]}`;
                            db.get(getRoleTimeSql, function (err, oneRow) {
                                if (err) {
                                    console.error(err.message);
                                    return reject({ error: "error", message: querySql });
                                } else {
                                    const {
                                        inTime,
                                        outTime = dayjs().format("YYYY-MM-DD HH:mm:ss"),
                                        roleType,
                                        roleStartTime,
                                        roleEndTime = dayjs().format("YYYY-MM-DD HH:mm:ss"),
                                    } = oneRow;
                                    if (roleType === null) {
                                        // 这个应该是一个教员的条目，所以归属于一个 学员的时间
                                        const _roleTime = _calTimeDuration2(inTime, outTime,slotStartTimeString ,slotEndTimeString);
                                        
                                        
                                    } else if (roleType === "教员") {
                                        // 这也是个教员条目，但是结束时间还没有
                                    } else if (roleType === "见习") {
                                        // 这是一个学员见习的条目，
                                    } else {
                                    }
                                }
                            });
                        }

                        let _outTime = outTime ? outTime : dayjs().format("YYYY-MM-DD HH:mm:ss");
                        let resultAllDay = _calTimeDuration2(inTime, _outTime, "00:00:00", "24:00:00");
                        // console.log("resultAllDay:");
                        // console.log(resultAllDay);

                        let resultNightTime = _calTimeDuration2(inTime, _outTime, "00:00:00", "08:00:00");
                        // console.log("===resultNightTime:");
                        // console.log(resultNightTime);

                        resultAllDay.forEach((element) => {
                            // console.log(element);
                            const [key1] = Object.keys(element);
                            if (_dateRangeArray.includes(key1)) {
                                allDayTimeArray.push(element);
                            }
                        });

                        resultNightTime.forEach((element) => {
                            const [key1] = Object.keys(element);
                            if (_dateRangeArray.includes(key1)) {
                                console.log("===nightTime:");
                                console.log(element);
                                allNightTimeArray.push(element);
                            }
                        });
                    }
                    // console.log("timeArray");

                    // console.log(timeArray);
                    // console.log("sum timeArray");
                    const allDayTimeObject = _sumDuration(allDayTimeArray);
                    const allNightTimeObject = _sumDuration(allNightTimeArray);
                    // console.log(_giveKeyName("totalTime",_sumDuration(timeArray)));
                    const formattedData = {};

                    for (const [date, totalSeconds] of Object.entries(allDayTimeObject)) {
                        formattedData[date] = {
                            totalTime: totalSeconds,
                            nightTime: 0,
                        };
                    }
                    for (const [date, totalSeconds] of Object.entries(allNightTimeObject)) {
                        formattedData[date]["nightTime"] = totalSeconds;
                    }
                    // console.log("formattedData");
                    // console.log(username+ "formattedData");

                    // console.log(formattedData);
                    return resolve(formattedData);
                } else {
                    // console.log(username+"no duty record");
                    return resolve({});
                }
            }
        });
    });

    // let dayCount = dayjs(endDate).diff(dayjs(startDate), "d");
    // let _dayDurationJson = {};
    // for (let index = 0; index < dayCount; index++) {
    //     const element = dayjs(startDate).add(index, "d").format("YYYY-MM-DD");
    //     _dayDurationJson[element] = 0;
    // }
    // return _dayDurationJson;
}

async function GetStatistics(req, res) {
    console.log("GetStatistics");
    console.log(req.query);
    const { username, startDate, startTime, endDate, endTime } = req.query;
    // const startTime = "2024-08-01 00:00:00";
    // const endTime = "2024-09-28 24:00:00";

    // const allUserDutyData = {};
    if (startDate && endDate && startTime && endTime) {
        const user = {};

        for (let index = 0; index < usernames.length; index++) {
            const username = usernames[index];
            const dutyTime = await _calTimeDurationArray(
                username,
                startDate + " " + startTime + ":00",
                endDate + " " + endTime + ":00"
            );
            // console.log(username+"-----------------------------");
            // console.log(dutyTime);
            let totalTime = 0;
            for (const [date, timeObject] of Object.entries(dutyTime)) {
                totalTime += timeObject.totalTime;
            }
            // console.log("totalTime:"+totalTime);
            let totalNightTime = 0;
            let nightCount = 0;

            for (const [date, timeObject] of Object.entries(dutyTime)) {
                console.log(date);
                console.log(timeObject);
                totalNightTime += timeObject.nightTime;
                if (timeObject.nightTime > 0.1) {
                    nightCount++;
                }
            }
            // console.log("totalNightTime:"+totalNightTime);
            user[username] = {
                dutyTime: dutyTime,
                totalTime: totalTime,
                totalDayTime: "",
                totalNightTime: totalNightTime,
                nightCount: nightCount,
            };
            // allUserDutyData[username]=user;
        }
        // console.log(JSON.stringify(allUserDutyData));
        res.send(user);
    } else {
        res.status(500).send(req.query);
    }
}

module.exports = { GetStatistics, _calTimeDurationArray };
