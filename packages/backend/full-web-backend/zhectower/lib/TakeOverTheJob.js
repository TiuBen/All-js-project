const { pool } = require("../utils/DbConnection");
/* MARK
      这个函数保存每次交接的单条记录
      保存的数据格式为
      时间
      值班的人
      状态 是 交班 还是 接班 还是 超时自动退出

*/

async function _checkUserIsPrepared(username) {
    const currentTime = new Date();
    const eightHoursAgo = new Date(currentTime - 8 * 60 * 60 * 1000);
    let data = {};

    const withIn8HoursSql = `SELECT * FROM zhectower.duty WHERE username = '${username}' AND inTime > CONVERT('${eightHoursAgo.toISOString()}', DATETIME);`;
    try {
        const connection = await pool.getConnection();
        const [rows, fields] = await connection.query(withIn8HoursSql);
        if (rows.length > 0) {
            data = rows;
        } else {
            data = { ...rows, error: "没有准备记录" };
        }
    } catch (error) {
        console.log(error);
        data = { error: error };
    }

    return Promise.resolve(data);
}

async function TakeOverTheJob(payload) {
    // connection.query("SELECT * FROM zhectower.duty", (err, result) => {
    //     console.log(result);
    // });

    //
    console.log(payload);
    const { username, position, duty } = payload;
    let data = {};

    try {
        const data = await _checkUserIsPrepared(username);
        if (data.error) {
            data = {
                ...data,
                status: "error",
                username: username,
                error: "没有查到8个小时内的班前准备记录，请先完成岗前准备！",
            };
        } else {
            const connection = await pool.getConnection();
            const insertSQL = `INSERT INTO zhectower.duty (position,duty,time,username) VALUE (?,?,?,?);`;

            connection.query(insertSQL, [position, new Date(), user, duty], (err, result) => {
                if (err) {
                    console.error("insertSQL" + err);
                } else {
                    console.log(result);
                }
            });
            connection.release();
        }
    } catch (error) {
        console.log(error);
        data = { ...error };
    }

    return Promise.resolve(data);
}

module.exports = { TakeOverTheJob };
