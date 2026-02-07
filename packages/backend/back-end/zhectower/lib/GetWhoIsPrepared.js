const dayjs = require("dayjs");
const { pool } = require("../utils/DbConnection");

async function GetWhoIsPrepared(payload) {
    console.log("\x1b[31m%s\x1b[0m", "========执行 GetWhoIsPrepared ");
    console.log(payload);

    let data = {};
    try {
        const connection = await pool.getConnection();
        const { day = dayjs().format("M月D日") } = payload;
        const getAllPreparedForSomedaySQL = `SELECT * FROM zhectower.prepare WHERE shiftType LIKE "%${day}%"`;

        const [rows, fields] = await connection.query(getAllPreparedForSomedaySQL);

        // console.log(rows);
        // console.log(fields);

        if (rows.length > 0) {
            data = rows;
        } else {
            data = { error: "没有准备记录" };
        }
        connection.release();
    } catch (error) {
        console.log(error);
        data = { error: error };
    }
    console.log("\x1b[31m%s\x1b[0m", "========结束 GetWhoIsPrepared ");
    return Promise.resolve(data);
}

module.exports = { GetWhoIsPrepared };
