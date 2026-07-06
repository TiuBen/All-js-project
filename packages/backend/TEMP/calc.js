const { CalculationRules } = require("./calc/calcRule");
const { rawRowToJsObject } = require("./calc/rawRowToJsObject");
const { processRow } = require("./calc/processRow");

const dayjs = require("dayjs");

const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");

dayjs.extend(isSameOrAfter);
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");

dayjs.extend(isSameOrBefore);
const { DutyDb } = require("../../config/sqliteDb.js");

function queryDuty({ userId, username, inTime, outTime }) {
    let sql = `
            SELECT *
            FROM duty
            WHERE 1=1
        `;

    const params = [];

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
        sql += ` AND inTime <= ?`;
        params.push(outTime);
    }
    console.log(sql);
    console.log(params);

    return new Promise((resolve, reject) => {
        DutyDb.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            console.log("queryDuty rows:", rows.length);

            const jsObjectRows = rows.map((row) => rawRowToJsObject(row));
            console.log("jsObjectRows:", jsObjectRows.length);
            console.log(jsObjectRows);

            const processedRows = jsObjectRows.map((row) => processRow(row));

            resolve(processedRows);
        });
    });
}

async function calc({ userId, username, inTime, outTime }) {
    const rows = await queryDuty({
        userId,
        username,
        inTime,
        outTime,
    });
}

module.exports = {
    queryDuty,
    calc,
};
