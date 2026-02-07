const { db } = require("../utils/SqliteDb");
const { Positions } = require("../utils/CONST");
const dayjs = require("dayjs");
const {DutyService}=require("../service/index");

function GetWhoIsOnDuty(req, res) {
    console.log("GetWhoIsOnDuty");
    const {
        id,
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
    } = req.query;

    console.log(req.query);
    console.log(Array.isArray(position));
    console.log(position);
    // console.log(position + "+" + dutyType);

    // if (!Positions.includes(position)) {
    //     console.log("Invalid data");
    //     // console.log(position);
    //     res.status(400).send({ error: "error", message: "Invalid position" });
    //     return;
    // }

    // Start building the SQL query
    let query = "SELECT * FROM duty WHERE 1=1";

    // Prepare the values for parameterized query to prevent SQL injection
    let params = [];

    // Add conditions based on available query parameters
    if (id) {
        query += ` AND id = ?`; // Add filter for 'id' if provided
        params.push(id);
    }

    if (username) {
        query += ` AND username = ?`; // Add filter for 'username' if provided
        params.push(username);
    }

    if (position) {
        // query += ` AND position = ?`; // Add filter for 'position' if provided
        // params.push(position);

        // Split the 'position' input string by ';'
        const positionsArray = position.split(",").map((p) => p.trim()); // Trim to avoid leading/trailing spaces
        console.log(positionsArray);

        for (let index = 0; index < positionsArray.length; index++) {
            const p = positionsArray[index];
            if (index === 0 && p !== "") {
                query += ` AND (position LIKE ?`;
                params.push(`%${p}%`);
            } else if (index > 0 && p !== "") {
                query += ` OR position LIKE ?`;
                params.push(`%${p}%`);
            } else {
            }
        }
        query += `)`;
    }

    if (dutyType !== undefined) {
        // Split the 'position' input string by ';'

        query += ` AND (dutyType LIKE ?`;
        params.push(`%${dutyType}%`);

        query += `)`;
    } else if (dutyType === undefined) {
        // query += ` AND dutyType IS NULL`;
    }

    if (inTime || (startDate && startTime)) {
        const _inTime =
            dayjs(startDate, "YYYY-MM-DD").format("YYYY-MM-DD") + " " + dayjs(startTime, "HH:mm").format("HH:mm:ss");
        query += ` AND inTime >=DATETIME(?)`; // Add filter for 'inTime' if provided
        params.push(_inTime);
    }

    if (outTime || (endDate && endTime)) {
        const _outTime =
            dayjs(endDate, "YYYY-MM-DD").format("YYYY-MM-DD") + " " + dayjs(endTime, "HH:mm").format("HH:mm:ss");

        query += ` AND outTime  <=DATETIME(?) `; // Add filter for 'outTime' if provided
        params.push(_outTime);
    } else {
        query += ` AND outTime IS NULL`; // Add filter for 'outTime' if provided
    }

    // if (roleType) {
    //     // Split the 'roleType' input string by ';'
    //     const roleTypeArray = roleType.split(";").map((p) => p.trim()); // Trim to avoid leading/trailing spaces
    //     console.log(roleTypeArray);

    //     for (let index = 0; index < roleTypeArray.length; index++) {
    //         const r = roleTypeArray[index]; // Renamed to 'r' for clarity
    //         if (index === 0 && r !== "") {
    //             query += ` AND (roleType LIKE ?`;
    //             params.push(`%${r}%`);
    //         } else if (index > 0 && r !== "") {
    //             query += ` OR roleType LIKE ?`;
    //             params.push(`%${r}%`);
    //         }
    //     }
    //     query += `)`;
    // }
    if (relatedDutyTableRowId) {
        const ids = relatedDutyTableRowId.split(";").map((id) => id.trim());
        query += ` AND relatedDutyTableRowId IN (${ids.map(() => "?").join(";")})`; // Add filter for 'relatedDutyTableRowId' if provided
        params.push(...ids);
    }

    if (roleStartTime) {
        query += ` AND roleStartTime>=DATETIME(?)`; // Add filter for 'roleStartTime' if provided
        params.push(roleStartTime);
    }

    if (roleEndTime) {
        query += ` AND roleEndTime <=DATETIME(?)`; // Add filter for 'roleEndTime' if provided
        params.push(roleEndTime);
    }

    if (roleTimes) {
        query += ` AND roleTimes = ?`; // Add filter for 'roleTimes' if provided
        params.push(roleTimes);
    }

    if (status) {
        query += ` AND status = ?`; // Add filter for 'status' if provided
        params.push(status);
    }

    if (relatedPrepareTableId) {
        query += ` AND relatedPrepareTableId = ?`; // Add filter for 'relatedPrepareTableId' if provided
        params.push(relatedPrepareTableId);
    }

    if (year && month) {
        const _mm = dayjs(month, ["M", "MM"]).format("MM");
        console.log(_mm);

        query = `
        SELECT * FROM duty
        WHERE (strftime('%Y', inTime) = ? AND strftime('%m', inTime) = ?)
           OR (outTime IS NULL AND strftime('%Y', inTime) = ? AND strftime('%m', inTime) = ?)
           OR (outTime IS NOT NULL AND strftime('%Y', outTime) = ? AND strftime('%m', outTime) = ?);
      `;
        params = [year, _mm, year, _mm, year, _mm];
    }
    console.log(query);
    console.log(params);
    // if (username) {
    //     const endDutySQL = `SELECT * FROM duty WHERE id=@id"
    //     WHERE id=@id`;
    //     db.run(endDutySQL, [id], function (err) {
    //         if (err) {
    //             console.error(err.message);
    //             res.status(500).send({
    //                 ...err,
    //             });
    //         }
    //     });
    // }

    // //
    // if (need === "teacherTime") {
    //     const getTeacherTimeSQL = `SELECT * FROM duty WHERE id=@id`;
    //     db.get(getTeacherTimeSQL, [id], function (err, row) {
    //         if (err) {
    //             console.error(err.message);
    //             res.status(500).send({
    //                 ...err,
    //                 message: "Error query the new inserted prepare data in the prepare table",
    //             });
    //             return;
    //         } else {
    //             // console.log(row);
    //             // console.log(row.teacherTime);
    //             // console.log(row.teacherTime.split(":"));
    //         }
    //     });
    // }

    // const getWhoIsOnDutyAtThisPositionSQL = `SELECT * FROM duty
    // WHERE
    // position =@position
    // AND  (@dutyType IS NULL OR dutyType = @dutyType)
    // AND inTime IS NOT NULL
    // AND outTime IS NULL`;

    // db.all(getWhoIsOnDutyAtThisPositionSQL, [position, dutyType], function (err, rows) {
    //     if (err) {
    //         console.error(err.message);
    //         res.status(500).send([{ error: "error", message: getWhoIsOnDutyAtThisPositionSQL }]);
    //         return;
    //     } else {
    //         // console.log(rows);
    //         res.status(201).send(rows);
    //         return;
    //     }
    // });

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send([{ error: "error", message: query }]);
            return;
        } else {
            // console.log(rows);
            res.status(201).send(rows);
            return;
        }
    });
}
// #NEED FIX 8小时的部分有问题
function PostToTakeOverDuty(req, res) {
    console.log("PostToTakeOverDuty");
    const { position, dutyType, username, status } = req.body;
    console.log(req.body);
    // 如果传入的数据-席位position不存在-返回错误
    if (!Positions.includes(position)) {
        console.log("Invalid data");
        res.status(400).send({ error: "error", message: "Invalid position" });
        return;
    }
    // 如果传入的数据-user不存在-返回错误
    if (!username) {
        res.status(400).send({ error: "error", message: "Invalid username" });
        console.log("Invalid username");
        return;
    }

    // check if the user has prepared

    //!  datetime('now') 用时的UTC时间，
    //! 检查有没有8个小时内的岗前准备记录
    const checkIfPreparedSQL = `
        SELECT * FROM prepare 
        WHERE username="${username}"
        AND
        datetime(prepareTime)>datetime('now')`;
    console.log(checkIfPreparedSQL);

    db.get(checkIfPreparedSQL, function (err, prepareRow) {
        let nextIsOut = {};

        if (err) {
            console.error(err.message);
            res.status(500).send({ error: "error", message: "Error checking  user is in the prepare table" });
            return;
        } else if (prepareRow) {
            // the user has prepared then can take over or end the duty
            console.log(prepareRow);
            if (parseInt(prepareRow.isPrepared) !== 1) {
                //! 如果这个人的isPrepare为0 表示他的岗前准备有问题
                res.status(400).send({
                    ...prepareRow,
                    error: "如果这个人的isPrepared为0 ",
                    message: "岗前准备有问题",
                });
                return;
            } else {
                //! 先检查
                const checkNotOutSql = `select * FROM duty  WHERE username="${username}" AND outTime IS NULL`;

                db.get(checkNotOutSql, function (err, row) {
                    if (err) {
                        console.error(err.message);
                        res.status(500).send({
                            error: "error",
                            message: "Error checking  user is in the duty table",
                            checkNotOutSql: checkNotOutSql,
                        });
                        return;
                    } else if (row) {
                        //!查到了
                        if (
                            JSON.stringify({ position: position, dutyType: dutyType }) !==
                            JSON.stringify({ position: row.position, dutyType: row.dutyType })
                        ) {
                            //!
                            console.log(`在${row.position}${row.dutyType ? `-${row.dutyType}` : ""}席位上还未登出`);
                            res.status(201).send({
                                ...row,
                                error: "error",
                                message: `在${row.position}${row.dutyType ? `-${row.dutyType}` : ""}席位上还未登出`,
                                checkNotOutSql: checkNotOutSql,
                            });
                            nextIsOut = true;
                            return;
                        } else {
                            const updateSql = `UPDATE duty SET outTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}"
                            WHERE username="${username}" AND position="${position}" 
                            AND inTime IS NOT NULL AND outTime IS NULL`;
                            db.run(updateSql, function (err) {
                                if (err) {
                                    console.error(err.message);
                                    res.status(500).send({
                                        error: "error",
                                        message: "Error UPDATE data into the duty table",
                                        updateSql: updateSql,
                                    });
                                    return;
                                } else {
                                    res.status(201).json({
                                        ...this,
                                        message: "update duty outTime success",
                                        updateSql: updateSql,
                                    });
                                    return;
                                }
                            });
                            nextIsOut = false;
                        }
                    } else {
                        // //! 看看这个人是不是已经有了 inTime 的记录，如果有上岗记录，那么应该是更新为-outTime
                        const searchSql = `select * FROM duty  
                        WHERE username="${username}" AND 
                        position="${position}" AND 
                        inTime IS NOT NULL AND 
                        outTime IS NULL `;
                        db.get(searchSql, function (err, dutyRow) {
                            if (err) {
                                console.error(err.message);
                                res.status(500).send({
                                    error: "error",
                                    message: "Error checking  user is in the duty table",
                                    searchSql: searchSql,
                                });
                                return;
                            } else if (dutyRow) {
                                //!查到了
                                console.log("查到一个要更新outTime的");
                                console.log(dutyRow);
                                const updateSql = `UPDATE duty SET outTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}"
                                               WHERE username="${username}" AND position="${position}" 
                                               AND inTime IS NOT NULL AND outTime IS NULL`;
                                db.run(updateSql, function (err) {
                                    if (err) {
                                        console.error(err.message);
                                        res.status(500).send({
                                            error: "error",
                                            message: "Error UPDATE data into the duty table",
                                            updateSql: updateSql,
                                        });
                                        return;
                                    } else {
                                        res.status(201).json({
                                            ...this,
                                            message: "update duty outTime success",
                                            updateSql: updateSql,
                                        });
                                        return;
                                    }
                                });
                            } else {
                                // 暂时没有这个user的 duty 记录 那么可以 insert
                                const insertSql = `INSERT INTO duty (position,dutyType,username,inTime,status,relatedPrepareTableId) VALUES (?, ?, ?,?, ?,?)`;
                                const params = [
                                    position,
                                    dutyType,
                                    username,
                                    dayjs().format("YYYY-MM-DD HH:mm:ss"),
                                    status,
                                    prepareRow.id,
                                ];

                                db.run(insertSql, params, function (err) {
                                    if (err) {
                                        console.error(err.message);
                                        res.status(500).send({
                                            error: "error",
                                            message: "Error inserting data into the duty table",
                                        });
                                        return;
                                    } else {
                                        console.log(this.lastID);
                                        res.status(201).json({
                                            ...this,
                                            message: "update duty outTime success",
                                            insertSql: insertSql,
                                        });
                                        return;
                                    }
                                });
                            }
                        });
                    }
                });
            }
        } else {
            res.status(400).send({ error: "error", message: "没查到8小时内的岗前准备记录" });
            return;
        }
    });
}

async function NoPrepareTableCheckPostToTakeOverDuty(req, res) {
    console.log("NoPrepareTableCheckPostToTakeOverDuty");
    const { username, position, dutyType, roleType, relatedDutyTableRowId } = req.body;

    if (!Positions.includes(position)) {
        console.log("Invalid data");
        res.send({ error: "error", message: "Invalid position" });
        return;
    }
    if (!username) {
        console.log("Invalid username");
        res.send({ error: "error", message: "Invalid username" });
        return;
    }

    //!

    const checkPositionSql = `SELECT * FROM duty WHERE username="${username}" AND outTime IS NULL`;

    // 先检查有没有在别的席位上面
    // 没有登出的 直接登出
    db.get(checkPositionSql, function (err, positionRow) {
        if (err) {
            console.error(err.message);
            res.status(500).send({
                error: "error",
                message: "Error checking  user is in the duty table",
                sql: checkPositionSql,
            });
        } else if (positionRow) {
            //! 有 没登出的情况

            const updateSql = `UPDATE duty SET outTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}"
                           WHERE username="${username}" AND position="${position}"
                           AND inTime IS NOT NULL AND outTime IS NULL`;
            db.run(updateSql, function (err) {
                if (err) {
                    console.error(err.message);
                    res.status(500).send({
                        error: "error",
                        message: "Error UPDATE data into the duty table",
                        updateSql: updateSql,
                    });
                    return;
                } else {
                    NoPrepareTableCheckPostToTakeOverDuty(req, res);
                }
            });
        } else {
            // 找不到 没有登出的情况
            let insertSql = `INSERT INTO duty (position,dutyType,username,inTime) VALUES (?, ?, ?,?)`;
            let params = [position, dutyType, username, dayjs().format("YYYY-MM-DD HH:mm:ss")];

            // 如果有 teacher 和 student 一起登入,有两个条目
            if (roleType === "见习") {
                insertSql = `INSERT INTO duty (position,dutyType,username,inTime,roleType,relatedDutyTableRowId,roleStartTime) VALUES (?,?,?,?,?,?,?)`;
                params.push("见习", relatedDutyTableRowId, dayjs().format("YYYY-MM-DD HH:mm:ss"));
            }

            console.log(params);
            db.run(insertSql, params, function (err) {
                if (err) {
                    console.error(err.message);
                    res.status(500).send({
                        error: "error",
                        message: "Error inserting data into the duty table",
                    });
                    return;
                } else {
                    console.log("插入新的 duty table ID:" + this.lastID);
                    if (roleType === "见习") {
                        // ! 在此处更新教员的roleStartTime
                        const updateTeacherRoleStartTime = `UPDATE duty SET 
                            roleType="教员" ,
                            relatedDutyTableRowID= COALESCE(relatedDutyTableRowID,'') || '${this.lastID};' ,
                            roleStartTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}"
                        WHERE id="${relatedDutyTableRowId}"`;

                        db.run(updateTeacherRoleStartTime, function (err) {
                            if (err) {
                                console.error(err.message);
                                res.status(500).send({
                                    error: "error",
                                    message: "Error UPDATE data into the duty table",
                                    updateSql: updateTeacherRoleStartTime,
                                });
                                return;
                            } else {
                                console.log("updateTeacherRoleStartTime success");
                            }
                        });
                    }

                    const selectSql = `SELECT * FROM duty WHERE id=${this.lastID}`;
                    db.get(selectSql, function (err, newDutyRow) {
                        if (err) {
                            console.error(err.message);
                            res.status(500).send({
                                error: "error",
                                message: "Error SELECT data from the duty table",
                                selectSql: selectSql,
                            });
                            return;
                        } else {
                            res.status(201).json({
                                ...newDutyRow,
                                message: "INSERT duty  success",
                                insertSql: insertSql,
                            });
                            return;
                        }
                    });
                }
            });
        }
    });
}

function PutToOutDuty(req, res) {
    console.log("PutToOutDuty");

    const {
        id,
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
    } = req.body;
    console.log(req.body);

    // let updateSql = `UPDATE duty SET
    //     outTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}"
    // WHERE
    // username="${username}" AND
    // position="${position}" AND
    // inTime IS NOT NULL
    // AND outTime IS NULL`;
    // console.log(updateSql);

    if (roleType === "见习") {
        // ! 在此处更新见习的
        const updateStudentSql = `UPDATE duty SET 
            outTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}",  
            roleEndTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}",
            relatedDutyTableRowID=null
        WHERE id="${id}"`;
        db.run(updateStudentSql, function (err) {
            if (err) {
                console.error(err.message);
                res.status(500).send({
                    error: "error",
                    message: "Error UPDATE data into the duty table",
                    updateSql: updateSql,
                });
                return;
            } else {
                // ! 在此处更新教员的
                console.log("在此处更新教员的");
                const updateTeacherSql = `UPDATE duty SET 
                    roleType=null,
                    roleStartTime=null,
                    roleEndTime=null
                   WHERE id="${relatedDutyTableRowId}"`;

                console.log("updateTeacherSql", updateTeacherSql);
                db.run(updateTeacherSql, function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("updateTeacherSql success");
                    }
                });
                res.status(201).send({
                    updateSql: updateStudentSql,
                });
                return;
            }
        });
    }
    if (roleType === "教员") {
        // ! 在此处更新见习的
        const _relatedIds = relatedDutyTableRowId.split(";");
        const studentDutyRowId = _relatedIds[_relatedIds.length - 2];

        const updateStudentSql = `UPDATE duty SET 
            outTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}",  
            roleEndTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}",
            relatedDutyTableRowID=null
        WHERE id="${studentDutyRowId}"`;

        db.run(updateStudentSql, function (err) {
            if (err) {
                console.error(err.message);
                res.status(500).send({
                    error: "error",
                    message: "Error UPDATE data into the duty table",
                    updateSql: updateSql,
                });
                return;
            } else {
                // ! 在此处更新教员的
                console.log("在此处更新教员的");
                const updateTeacherSql = `UPDATE duty SET 
                    outTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}",
                    roleType=null,
                    roleStartTime=null,
                    roleEndTime=null
                   WHERE id="${id}"`;

                console.log("updateTeacherSql", updateTeacherSql);
                db.run(updateTeacherSql, function (err) {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("updateTeacherSql success");
                    }
                });
                res.status(201).send({
                    updateSql: updateStudentSql,
                });
                return;
            }
        });
    }

    if (roleType === null) {
        const updateSql = `UPDATE duty SET 
            outTime="${dayjs().format("YYYY-MM-DD HH:mm:ss")}"
        WHERE id="${id}"`;
        db.run(updateSql, function (err) {
            if (err) {
                console.error(err.message);
                res.status(500).send({
                    error: "error",
                    message: "Error UPDATE data into the duty table",
                    updateSql: updateSql,
                });
                return;
            } else {
                res.status(201).send({
                    updateSql: updateSql,
                });
                return;
            }
        });
    }
}



const DutyController={
    PutUser:async function (req, res) {
        console.log("更新打卡记录（替换整个资源）");

        try {
            const dutyId = req.params.id;
            const updatedDuty = req.body;
            const result =await DutyService.update(dutyId, updatedDuty);
            console.log(result);
            
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: "Duty not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Failed to update duty", error: error.message });
        }
    },



}




module.exports = { GetWhoIsOnDuty, PostToTakeOverDuty, NoPrepareTableCheckPostToTakeOverDuty, PutToOutDuty,DutyController };

// roleTimes=roleTimes || '${roleStartTime}' ||'${dayjs().format("YYYY-MM-DD HH:mm:ss")}'
