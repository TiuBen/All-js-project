const BaseService = require("./Base.Service");
const { UserDb, DutyDb } = require("../config/sqliteDb.js");
const { normalizeValue, normalizeRow } = require("../utils/sqliteSaveReadArrayTools.js");

// const DutyService = require("./Duty.Service");
// const dutyService= new DutyService();

const ALLOWED_COLUMNS = ["id", "username","password","position", "dutyType", "roleType", "status", "avatarImage", "team","rank"];

class UserService extends BaseService {
    constructor(dutyService) {
        super("user", UserDb);
        this.dutyService = dutyService;
        this.getAll = this.getAll.bind(this);
        this.findById = this.findById.bind(this);
        this.update = this.update.bind(this);
        this.updatePositions = this.updatePositions.bind(this);
        this.updateRoleTypes = this.updateRoleTypes.bind(this);
    }


    create(data) {
        //console.log("UserService.create()");
        const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => key !== "id"));

        return new Promise((resolve, reject) => {
            const keys = Object.keys(filteredData).join(", ");
            const values = Object.values(filteredData);
            const placeholders = values.map(() => "?").join(", ");

            //console.log(`INSERT INTO user (${keys}) VALUES (${placeholders})`);
            this.db.run(`INSERT INTO user (${keys}) VALUES (${placeholders})`, values, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    }

    getAll(options) {
        console.log("UserService getAll");
        

        return new Promise((resolve, reject) => {
            const safeFields = options.fields[0] === "*" ? ALLOWED_COLUMNS : options.fields.filter((f) => ALLOWED_COLUMNS.includes(f));

            const query = `SELECT ${safeFields.join(", ")} FROM user ORDER BY "rank"`;

            console.log("QUERY:"+query);

            this.db.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    // 处理每一行的position字段
                    const jsObjectRows = rows.map((row) => {
                        return normalizeRow(row);
                    });

                    // console.log("jsObjectRows");
                    // console.log(jsObjectRows);
                    // if (groupBy === "team") {
                    //     const maxTeam = Math.max(...jsObjectRows.map((item) => item.team));
                    //     const result = Array.from({ length: maxTeam + 1 }, () => []);
                    //     // 根据 team 值分组
                    //     jsObjectRows.forEach((item) => {
                    //         result[item.team].push(item);
                    //     });

                    //     resolve(result);
                    //     return;
                    // }

                    resolve(jsObjectRows);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    findById(id) {
        //console.log("UserService findById" + id);

        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else {
                    // row.position = JSON.parse(row?.position??null);
                    // if (row?.roleType) {
                    //     row.roleType = JSON.parse(row?.roleType); //?.split(",").filter(Boolean);
                    //     // row.roleType =row?.roleType;//?.split(",").filter(Boolean);
                    // } else {
                    //     row.roleType = [];
                    // }

                    resolve(normalizeRow(row));
                }
            });
        });
    }

    update(id, data) {
        return new Promise((resolve, reject) => {
            const processedData = {};
            const values = [];

            Object.keys(data)
                .filter((key) => ALLOWED_COLUMNS.includes(key))
                .forEach((key) => {
                    if (Array.isArray(data[key])) {
                        // Convert array to JSON string
                        processedData[key] = JSON.stringify(data[key]);
                    } else {
                        processedData[key] = data[key];
                    }
                    values.push(processedData[key]);
                });
            const updates = Object.keys(processedData)
                .map((key) => `${key} = ?`)
                .join(", ");
            values.push(id); // Add id for WHERE clause

            this.db.run(`UPDATE ${this.tableName} SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    }

    // Helper method to update positions
    updatePositions(userId, positions) {
        return new Promise((resolve, reject) => {
            // First delete existing positions
            this.db.run(`DELETE FROM user_positions WHERE user_id = ?`, [userId], (err) => {
                if (err) return reject(err);

                // Then insert new positions
                const stmt = this.db.prepare(
                    `INSERT INTO user_positions (user_id, dutyType, position, roleType) 
                 VALUES (?, ?, ?, ?)`
                );

                const promises = positions.map((pos) => {
                    return new Promise((res, rej) => {
                        stmt.run([userId, pos.dutyType || null, pos.position, pos.roleType || null], function (err) {
                            if (err) rej(err);
                            else res();
                        });
                    });
                });

                Promise.all(promises)
                    .then(() => stmt.finalize(resolve))
                    .catch(reject);
            });
        });
    }

    // Helper method to update role types
    updateRoleTypes(userId, roleTypes) {
        return new Promise((resolve, reject) => {
            // First delete existing role types
            this.db.run(`DELETE FROM user_role_types WHERE user_id = ?`, [userId], (err) => {
                if (err) return reject(err);

                // Then insert new role types
                const stmt = this.db.prepare(`INSERT INTO user_role_types (user_id, role_type) VALUES (?, ?)`);

                const promises = roleTypes.map((role) => {
                    return new Promise((res, rej) => {
                        stmt.run([userId, role], function (err) {
                            if (err) rej(err);
                            else res();
                        });
                    });
                });

                Promise.all(promises)
                    .then(() => stmt.finalize(resolve))
                    .catch(reject);
            });
        });
    }

    // getStatisticsByUserId(id, startDate, startTime, endDate, endTime) {
    //     // let sql = "SELECT * FROM duty WHERE 1=1";
    //     // let params = [];
    //     // if (id) {
    //     //     sql += ` AND id = ?`; // Add filter for 'id' if provided
    //     //     params.push(id);
    //     // }
    //     // if (inTime || (startDate && startTime)) {
    //     //     const _inTime = endDate + " " + endTime;

    //     //     sql += ` AND inTime <=DATETIME(?)`; // Add filter for 'inTime' if provided
    //     //     params.push(_inTime);
    //     // }

    //     // if (outTime || (endDate && endTime)) {
    //     //     if (outTime === "null") {
    //     //         sql += " AND outTime IS NULL";
    //     //     } else {
    //     //         const _outTime = startDate + " " + startTime;

    //     //         sql += ` AND outTime  >=DATETIME(?) `; // Add filter for 'outTime' if provided
    //     //         params.push(_outTime);
    //     //     }
    //     // }

    //     return this.dutyService.getAll({
    //         id: id,
    //         startDate: startDate,
    //         startTime: startTime,
    //         endDate: endDate,
    //         endTime: endTime,
    //     });
    // }
}

module.exports = UserService;
