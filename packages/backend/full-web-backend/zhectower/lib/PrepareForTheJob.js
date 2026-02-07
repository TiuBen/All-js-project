const { pool } = require("../utils/DbConnection");
const dayjs = require("dayjs");

async function PrepareForTheJob(payload) {
    console.log("====PrepareForTheJob=====");
    console.log(payload);
    const { username, isPrepared, prepareDetail, shiftType, shiftStartTime, shiftEndTime } = payload;
    console.log(prepareDetail);
    const prepareTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
    console.log(prepareTime);
    // const prepareTime = new Date();

    let data = {};

    try {
        const connection = await pool.getConnection();

        // 先检查这段班次有没有准备过，而且准备的是什么情况
        console.log("checkIsThisUserPreparedSQL");
        const checkIsThisUserPreparedSQL = `SELECT * FROM zhectower.prepare WHERE username = ? AND shiftType = ?`;
        const [rows] = await connection.query(checkIsThisUserPreparedSQL, [username, shiftType]);
        // console.log(rows);

        if (rows.length > 0) {
            console.log("checkIsThisUserPreparedSQL 有记录");
            const userPreparedData = rows[0];
            if (userPreparedData.isPrepared === 1) {
                // 如果有记录 并且 准备状态正常 则 不做任何操作
                data = { ...userPreparedData, isPreparedAndRecorded: true };
            } else {
                // 如果准备状态不正常，则返回提示
                data = { ...userPreparedData, message: "准备状态不正常", error: "准备状态不正常" };
            }
        } else {
            // 如果没有记录 则进行插入新的记录
            console.log("\x1b[33m%s\x1b[0m", "insertSQL 没有准备的记录，进行插入新准备记录");
            try {
                const insertSQL = `INSERT INTO zhectower.prepare (username,prepareTime,isPrepared,prepareDetail,shiftType ) VALUE (?,?,?,?,?);`;
                const [result] = await connection.query(insertSQL, [
                    username,
                    prepareTime,
                    isPrepared,
                    JSON.stringify(prepareDetail),
                    shiftType,
                ]);
                // console.log(result);
                data = await PrepareForTheJob(payload);
            } catch (error) {
                console.log(error);
            }
        }

        connection.release();
        return Promise.resolve(data);
    } catch (error) {
        console.error(error);
        return Promise.resolve(error);
    }

    // try {
    //     const [result] = await connection.query(insertSQL, [username, new Date(), isPrepared]);
    //     console.log(result);
    //     data = { status: "success", username: username, message: "岗前准备成功" };
    //     return Promise.resolve(data);
    // } catch (error) {
    //     data = { status: "fail", username: username, message: "岗前准备失败" };
    //     return Promise.resolve(data);
    // }
}

module.exports = { PrepareForTheJob };
