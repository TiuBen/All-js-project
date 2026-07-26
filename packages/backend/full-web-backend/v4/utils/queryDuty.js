const dayjs = require("dayjs");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
dayjs.extend(isSameOrAfter);
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
dayjs.extend(isSameOrBefore);

const { DutyDb } = require("../config/sqliteDb.js");

const { clipDutyRow } = require("./util/clipDutyRow");

function rawRowToJsObject(row) {
    if (!row) return row;

    const parsedRow = { ...row };

    for (const key in parsedRow) {
        const val = parsedRow[key];
        // 仅对字符串进行处理
        if (typeof val === "string") {
            // 简单的启发式判断：只有以 { 或 [ 开头的字符串才尝试解析
            // 这可以避免对普通文本（如 "hello world"）进行无意义的 JSON.parse 尝试
            const trimmed = val.trim();
            if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
                try {
                    parsedRow[key] = JSON.parse(val);
                } catch {
                    // 解析失败，保持原样
                }
            }
        }
    }
    return parsedRow;
}

function queryDuty({ id, userId, username, inTime, outTime }) {
    // console.log("queryDuty", { id, userId, username, inTime, outTime });
    let sql = `SELECT *FROM duty WHERE 1=1`;
    const params = [];
    if (id != null) {
        sql += ` AND id=?`;
        params.push(id);
    }

    if (userId != null) {
        sql += ` AND userId=?`;
        params.push(userId);
    }

    if (username != null) {
        sql += ` AND username=?`;
        params.push(username);
    }

    if (inTime) {
        sql += ` AND outTime >= ?`;
        params.push(inTime);
    }

    if (outTime) {
        if (outTime === "null") {
            sql += ` AND outTime IS NULL`;
        } else {
            sql += ` AND inTime <= ?`;
            params.push(outTime);
        }
    }
    // console.log(sql);
    // console.log(params);

    return new Promise((resolve, reject) => {
        DutyDb.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            // console.log("queryDuty rows:", rows.length);

            const jsObjectRows = rows.map((row) => rawRowToJsObject(row));
            // console.log("jsObjectRows:", jsObjectRows.length);
            // console.log(jsObjectRows);

            // const processedRows = jsObjectRows.map(processRow).map((row) => clipDutyRow(row, { inTime, outTime }));

            resolve(jsObjectRows);
            // resolve(processedRows);
        });
    });
}

module.exports = {
    queryDuty,
};
