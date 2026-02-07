const { data } = require("../utils/FakeWhoIsOnDuty");
const { pool } = require("../utils/DbConnection");
const dayjs = require("dayjs");
const { AtcLicenseExam } = require("../utils/SqliteDb");

async function GetWhoIsOnDuty(payload) {
    // console.log("\x1b[31m%s\x1b[0m", "========执行 GetWhoIsOnDuty ");
    const { position, dutyType, time } = payload;

    let data = {};

    try {
        const connection = await pool.getConnection();
        const { day = dayjs().format("M月D日") } = payload;

        const getWhoIsOnDutyAtThisPositionSQL = `SELECT * FROM zhectower.duty WHERE position="${position}" AND dutyType="${dutyType}" `;
        // console.log(getWhoIsOnDutyAtThisPositionSQL);

        const [rows, fields] = await connection.query(getWhoIsOnDutyAtThisPositionSQL);

        //    console.log(rows);

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

    // console.log("\x1b[31m%s\x1b[0m", "========结束 GetWhoIsOnDuty ");

    return Promise.resolve(data);
}

async function TTTTTT(payload) {
    // console.log("\x1b[31m%s\x1b[0m", "========执行 GetWhoIsOnDuty ");
    let data = {};
    try {
        const connection = await pool.getConnection();

        const getWhoIsOnDutyAtThisPositionSQL = `SELECT * FROM atctiku2.英语单选`;
        // console.log(getWhoIsOnDutyAtThisPositionSQL);

        const [rows, fields] = await connection.query(getWhoIsOnDutyAtThisPositionSQL);

        //    console.log(rows);

        if (rows.length > 0) {
          
            console.log(rows);
            for (let i = 0; i < rows.length; i++) {
                const element = rows[i];
                const insertSql = `INSERT INTO 英语单选 (id,num, qId, rawNum, qContent, A, B, C, D, rightAns, comment)  VALUES (?, ?, ?,?, ?,?,?, ?, ?,?, ?)`;
                AtcLicenseExam.run(insertSql, [
                    element.id,
                    element.num,
                    element.qId,
                    element.rawNum,
                    element.txt,
                    element.A,
                    element.B,
                    element.C,
                    element.D,
                    element.rightAns,
                    element.comment,
                ],function(err){
                    if(err){
                        console.log(err);
                    }else{
                        
                    }

                });
            }




        } else {
            data = { error: "没有准备记录" };
        }
        connection.release();
    } catch (error) {
        console.log(error);
    }

    // console.log("\x1b[31m%s\x1b[0m", "========结束 GetWhoIsOnDuty ");

    // return Promise.resolve(data);
}

module.exports = { GetWhoIsOnDuty, TTTTTT };
