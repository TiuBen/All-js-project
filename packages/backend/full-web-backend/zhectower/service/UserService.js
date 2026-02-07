const BaseService = require("./BaseService");

class UserService extends BaseService {
    constructor() {
        super("user");
    }
    update(id, data) {
        return new Promise((resolve, reject) => {
            // Convert array values to JSON strings
            const processedData = Object.keys(data).reduce((acc, key) => {
                if (Array.isArray(data[key])) {
                    acc[key] = JSON.stringify(data[key]); // Convert array to JSON string
                } else {
                    acc[key] = data[key]; // Keep non-array values as-is
                }
                return acc;
            }, {});

            const updates = Object.keys(processedData)
                .map((key) => {
                    // Escape reserved keywords (e.g., `group`)
                    if (key === "group") {
                        return `\`${key}\` = ?`;
                    }
                    return `${key} = ?`;
                })
                .join(", ");

            const values = [...Object.values(processedData), id];

            // console.log("Generated SQL:", `UPDATE ${this.tableName} SET ${updates} WHERE id = ?`);
            // console.log("Values:", values);

            // Execute the SQL query
            this.db.run(`UPDATE ${this.tableName} SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) {
                    console.error("Error updating user:", err);
                    reject(err);
                } else {
                    console.log("User updated successfully");
                    resolve({ id, ...data });
                }
            });
        });
    }

    findAll(orderBy = null) {
        console.log("UserService findAll");

        // 动态生成 SQL 查询语句
        let sql = `SELECT * FROM ${this.tableName}`;
        // 如果有 orderBy 参数，则添加排序逻辑
        if (orderBy) {
            // 校验 orderBy 参数是否合法
            const allowedColumns = ["id", "name", "team"]; // 允许排序的字段
            if (!allowedColumns.includes(orderBy)) {
                return Promise.reject(new Error("Invalid orderBy parameter."));
            }

            sql += ` ORDER BY ${orderBy}`;
        }

        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.tableName}`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}

module.exports = UserService;
