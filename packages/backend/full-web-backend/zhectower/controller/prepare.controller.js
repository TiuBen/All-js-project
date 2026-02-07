const db = require("../utils/SqliteDb");
const { usernames, Positions } = require("../utils/CONST");
const dayjs = require("dayjs");
const customParseFormat= require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
function PostPrepareForTheJobs(req, res) {
    console.log("PostPrepareForTheJobs");
    const { username, prepareTime, isPrepared, prepareDetail, shiftType, shiftStartTime, shiftEndTime } = req.body;

    //  要检查username
    if (!usernames.includes(username)) {
        res.status(201).send({
            error: "用户名不合法",
            message: "用户名不合法",
        });
        return;
    }

    // 准备的时间段合规性检查
    const [startTime, endTime] = shiftType.split("-");
    //! console.log(shiftType);
    //! console.log(startTime, endTime);

    //! console.log(dayjs(startTime,"YYYY年M月D日HH:mm").format("YYYY-MM-DD HH:mm:ss"));
    //! console.log(dayjs(endTime).subtract(2, "h").format("YYYY-MM-DD HH:mm:ss"));

    if (dayjs().isBefore(dayjs(startTime,"YYYY年M月D日HH:mm").subtract(2, "hours")) || dayjs().isAfter(dayjs(endTime,"YYYY年M月D日HH:mm"))) {
        res.status(201).send({
            ...req.body,
            prepareTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            error: "准备时间段不合法",
            message: "岗前2小时内可准备该时间段班次",
        });
        return;
    }

    // !现在是检查合规性 时间 30分钟
    const checkUnsuitableUserInMMSql = `SELECT * FROM prepare WHERE username ="${username}" AND datetime(prepareTime) > datetime("${dayjs()
        .subtract("30", "m")
        .format("YYYY-MM-DD HH:mm:ss")}") AND isPrepared = 0`;
    console.log(checkUnsuitableUserInMMSql);

    db.run(checkUnsuitableUserInMMSql, (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ ...err, sql: checkUnsuitableUserInMMSql });
        } else {
            if (row) {
                console.log("User is not suitable and must wait 30 minutes");
                console.log(row);
                res.status(201).send({
                    ...row,
                    sql: checkUnsuitableUserInMMSql,
                    error: "User is not suitable and must wait 30 minutes",
                    message: "准备情况不合适，请等待30分钟!",
                });
                return;
            } else {
                // !必须先处理掉不适合岗位的情况
                const checkUserUnsuitableSql = `SELECT * FROM prepare WHERE username =@username AND isPrepared = 0`;
                db.get(checkUserUnsuitableSql, [username], (err, row) => {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send({ ...err, sql: checkUserUnsuitableSql });
                        return;
                    } else if (row) {
                        console.log("User has not suitable to handle!");
                        console.log(row);
                        res.status(201).send({
                            ...row,
                            error: "User has not suitable to handle!",
                            message: "准备情况中有不合适项目!",
                        });
                        return;
                    } else {
                        //!现在应该是彻底没有不适合岗位的情况要处理了
                        console.log("User is suitable and than can  prepared");

                        //! check if is this all ready prepared
                        //! 因为选取了shiftType+username 所以可以当做是唯一的
                        const checkIsPreparedSql = `SELECT * FROM prepare WHERE username = ? AND shiftType = ?`;
                        db.get(checkIsPreparedSql, [username, shiftType], (err, row) => {
                            if (err) {
                                console.error(err.message);
                                res.status(500).send("Error checking if user is prepared");
                            } else if (row) {
                                console.log("User is already prepared");
                                console.log(row);
                                console.log("===================");
                                res.status(201).send({
                                    ...row,
                                    error: "已经有过岗前准备记录了!",
                                    message: "已经有过岗前准备记录了!",
                                });
                                return;
                            } else {
                                console.log("User has not prepared yet!");
                                // User is not prepared, continue with the rest of the logic
                                // insert into db
                                const sql = `
                                    INSERT INTO prepare (
                                        username, 
                                        prepareTime, 
                                        isPrepared, 
                                        prepareDetail, 
                                        shiftType, 
                                        shiftStartTime, 
                                        shiftEndTime
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

                                const params = [
                                    username,
                                    dayjs().format("YYYY-MM-DD HH:mm:ss"),
                                    isPrepared ? 1 : 0, // Convert boolean to integer
                                    JSON.stringify(prepareDetail),
                                    shiftType,
                                    shiftStartTime,
                                    shiftEndTime,
                                ];

                                console.log(params);
                                db.run(sql, params, function (err) {
                                    if (err) {
                                        console.error(err.message);
                                        res.status(500).send({
                                            ...error,
                                            message: "Error inserting data into the prepare table",
                                            sql: sql,
                                        });
                                        return;
                                    } else {
                                        console.log("insert new prepare success" + this.lastID);
                                        db.get("SELECT * FROM prepare WHERE id = ?", [this.lastID], (err, rows) => {
                                            if (err) {
                                                console.error(err.message);
                                                res.status(500).send({
                                                    ...err,
                                                    message:
                                                        "Error query the new inserted prepare data in the prepare table",
                                                });
                                                return;
                                            } else {
                                                console.log(rows);
                                                //!如果准备状态里有不合适的 要发送的状态要包含错吴
                                                if (isPrepared === true) {
                                                    res.status(201).json(rows);
                                                    return;
                                                } else {
                                                    res.status(201).json({
                                                        ...rows,
                                                        error: "有不合适岗位的情况!",
                                                        message: "有不合适岗位的情况!",
                                                    });
                                                    return;
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
}

function GetPrepareForTheJobs(req, res) {
    console.log("GetPrepareForTheJobs");
    console.log(req.query);

    if (JSON.stringify(req.query) !== "{}") {
        const { id, username, prepareTime, isPrepared, shiftType } = req.query;
        const sql = `
        SELECT *
        FROM prepare
        WHERE
            (@id IS NULL OR id = @id)
            AND (@username IS NULL OR username = @username)
            AND (@prepareTime IS NULL OR prepareTime = @prepareTime)
            AND (@isPrepared IS NULL OR isPrepared = @isPrepared)
            AND (@shiftType IS NULL OR shiftType = @shiftType);`;

        db.all(sql, [id, username, prepareTime, isPrepared, shiftType], (err, rows) => {
            if (err) {
                console.error(err.message);
                res.status(500).send({ ...err, sql: sql });
                return;
            } else {
                res.status(200).send(rows);
                return;
            }
        });
    } else {
        const sql = `SELECT * FROM prepare`;
        db.all(sql, (err, rows) => {
            if (err) {
                console.error(err.message);
                res.status(500).send({ ...err, sql: sql });
                return;
            } else {
                res.status(200).send(rows);
                return;
            }
        });
    }
}

function PutToModifyPrepare(req, res) {
    console.log("PutToModifyPrepare");
    console.log(req.body);
    const { id, username, prepareTime, isPrepared, prepareDetail, shiftType, shiftStartTime, shiftEndTime, remarks } =
        req.body;

    const remarksJSONText = JSON.stringify({
        prepareDetail,
        prepareTime: prepareTime,
        modifiedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });

    const updateIsPrepareSql = `UPDATE prepare
        SET remarks='${remarksJSONText}',isPrepared=1 
        WHERE id=${id}`;

    db.run(updateIsPrepareSql, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send({ ...err, sql: updateIsPrepareSql });
            return;
        } else {
            res.status(200).send({
                ...this,
                message: "修改成功",
                sql: updateIsPrepareSql,
            });
            return;
        }
    });
}

module.exports = { PostPrepareForTheJobs, GetPrepareForTheJobs, PutToModifyPrepare };
