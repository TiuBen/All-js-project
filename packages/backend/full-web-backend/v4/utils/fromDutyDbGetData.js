const { calculateTimeInDailyRange } = require("./calculateDuration");
const dayjs = require("dayjs");
const { normalizeRow } = require("./sqliteSaveReadArrayTools");
const { DutyDb } = require("../config/sqliteDb.js");

function fromDutyDbGetData(query) {
    //console.log("utils fromDutyDbGetData");

    const {
        id,
        userId,
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
        // page = 1,
        // limit = 10,
    } = query;
    //#region 获取数据

    let sql = "SELECT * FROM duty WHERE 1=1";
    let params = [];

    if (id) {
        sql += ` AND id = ?`; // Add filter for 'id' if provided
        params.push(id);
    }
    if (userId) {
        sql += ` AND userId = ?`; // Add filter for 'id' if provided
        params.push(userId);
    }
    if (username) {
        sql += ` AND username = ?`; // Add filter for 'username' if provided
        params.push(username);
    }
    if (position) {
        // Split the 'position' input string by ';'
        // Trim to avoid leading/trailing spaces
        const positionsArray = position.split(",").map((p) => p.trim());
        //console.log(positionsArray);

        for (let index = 0; index < positionsArray.length; index++) {
            const p = positionsArray[index];
            if (index === 0 && p !== "") {
                sql += ` AND position =?`;
                params.push(`${p}`);
            } else if (index > 0 && p !== "") {
                sql += ` OR position LIKE ?`;
                params.push(`%${p}%`);
            } else {
            }
        }
        sql += ``;
    }

    if (dutyType !== undefined) {
        // Split the 'position' input string by ';'

        sql += ` AND dutyType LIKE ?`;
        params.push(`%${dutyType}%`);

        sql += ``;
    } else if (dutyType === undefined) {
        // sql += ` AND dutyType IS NULL`;
    }

    if (inTime || (startDate && startTime)) {
        const _inTime = endDate + " " + endTime;

        sql += ` AND inTime <=DATETIME(?)`; // Add filter for 'inTime' if provided
        params.push(_inTime);
    }

    if (outTime || (endDate && endTime)) {
        if (outTime === "null") {
            // //console.log("outTime is null");

            sql += " AND outTime IS NULL";
        } else {
            const _outTime = startDate + " " + startTime;

            sql += ` AND outTime  >=DATETIME(?) `; // Add filter for 'outTime' if provided
            params.push(_outTime);
        }
    }
    //#endregion
    // ✅ 计算 offset 并拼接分页 SQL
    // const offset = (Number(page) - 1) * Number(limit);
    // const pagedSql = `${sql} ORDER BY inTime DESC LIMIT ? OFFSET ?`;
    // const pagedParams = [...params, Number(limit), offset];

    // // ✅ 同时执行两条 SQL: 一条分页，一条总数
    // const countSql = `SELECT COUNT(*) AS totalCount FROM duty WHERE 1=1 ${sql.replace(
    //     "SELECT * FROM duty WHERE 1=1",
    //     ""
    // )}`;
    // //console.log("SQL:" + sql);
    // //console.log(params);
    //! 数据库中能获取的文件
    //! "id", "username", "position", "dutyType", "inTime", "outTime",
    //!  "roleType", "relatedDutyTableRowId", "roleStartTime", "roleEndTime", "roleTimes", "status", "relatedPrepareTableId";

    // return new Promise((resolve, reject) => {
    //     DutyDb.all(countSql, params, (countErr, countRows) => {
    //         if (countErr) {
    //             console.error("统计总数失败:", countErr);
    //             return reject(new Error("数据库统计失败"));
    //         }

    //         const totalCount = countRows[0]?.totalCount ?? 0;

    //         DutyDb.all(pagedSql, pagedParams, (err, rows) => {
    //             if (err) {
    //                 console.error("查询失败:", err);
    //                 return reject(new Error("数据库查询失败"));
    //             }

    //             const records = rows.map((row) => {
    //                 const _inTime = row.inTime;
    //                 const _outTime = row.outTime ?? dayjs().format("YYYY-MM-DD HH:mm:ss");
    //                 const _dayShift = calculateTimeInDailyRange(dayjs(_inTime), dayjs(_outTime), "08:00", "24:00");
    //                 const _nightShift = calculateTimeInDailyRange(dayjs(_inTime), dayjs(_outTime), "00:00", "08:00");

    //                 return {
    //                     ...row,
    //                     outTime: _outTime,
    //                     date: dayjs(_inTime).format("YYYY-MM-DD"),
    //                     dayShift: _dayShift,
    //                     nightShift: _nightShift,
    //                 };
    //             });

    //             resolve({
    //                 items: records.map(normalizeRow),
    //                 totalCount,
    //             });
    //         });
    //     });
    // });

    return new Promise((resolve, reject) => {
        DutyDb.all(sql, params, (err, rows) => {
            if (err) {
                console.error("查询失败:", err);
                reject(new Error("数据库查询失败"));
                return;
            }
            // //console.log("rows");

            // //console.log(rows);
            // 类型转换（如果需要）
            const records = rows.map((row) => {
                const _inTime = row.inTime;
                const _outTime = row.outTime ?? dayjs().format("YYYY-MM-DD HH:mm:ss"); //! 如果没有outTime，则默认为当前时间

                const _dayShift = calculateTimeInDailyRange(dayjs(_inTime), dayjs(_outTime), "08:00", "24:00");
                const _nightShift = calculateTimeInDailyRange(dayjs(_inTime), dayjs(_outTime), "00:00", "08:00");

                return {
                    ...row,
                    // inTime: dayjs(_inTime).format("YYYY-MM-DD HH:mm:ss"), // 转为Date对象
                    outTime: _outTime,
                    date: dayjs(_inTime).format("YYYY-MM-DD"),
                    dayShift: _dayShift,
                    nightShift: _nightShift,
                };
            });

            //console.log("getAll:" + records?.length);
            //console.log(records);
            resolve(records.map(normalizeRow));
        });
    });
}

async function useDutyDataGetRelatedTeachData(dutyData) {
    //console.log("utils useDutyDataGetRelatedTeachData");
    const allIds = dutyData.flatMap((d) => (String(d.relatedDutyTableRowId) ?? "").split(";").filter(Boolean));

    if (allIds.length === 0) return [];

    const placeholders = allIds.map(() => "?").join(",");
    const sql = `SELECT * FROM duty WHERE id IN (${placeholders})`;

    const rows = await new Promise((resolve, reject) => {
        DutyDb.all(sql, allIds, (err, rows) => {
            if (err) reject(err);
            else resolve(normalizeRow(rows));
        });
    });

    rows.map((row) => ({
        ...row,
        outTime: (row.outTime ||= dayjs().format("YYYY-MM-DD HH:mm:ss")),
    }));
    // //console.log("rows");
    // //console.log(rows);
    return rows;
}

module.exports = { fromDutyDbGetData, useDutyDataGetRelatedTeachData };
