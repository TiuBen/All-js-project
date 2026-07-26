/**
 * hr_duty_summary 服务层
 * 负责考勤汇总表的增删改查操作
 * 表结构: id, userId, username, duty_date, value
 * 唯一约束: (userId, duty_date)
 */

const { DutyDb } = require("../config/sqliteDb.js");

const hrDutySummaryService = {
    /**
     * 查询考勤汇总记录
     * @param {object} query - 查询条件
     * @param {number} query.userId - 用户ID
     * @param {string} query.username - 用户名(模糊查询)
     * @param {string} query.startDate - 开始日期 YYYY-MM-DD
     * @param {string} query.endDate - 结束日期 YYYY-MM-DD
     * @param {number} query.id - 单条记录ID
     * @returns {Promise<Array|object>} 查询结果
     */
    getByQuery(query = {}) {
        return new Promise((resolve, reject) => {
            let sql = "SELECT * FROM hr_duty_summary WHERE 1=1";
            const params = [];

            // 按ID查询单条
            if (query.id) {
                sql += " AND id = ?";
                params.push(query.id);
            }

            // 按用户ID查询
            if (query.userId) {
                sql += " AND userId = ?";
                params.push(query.userId);
            }

            // 按用户名模糊查询
            if (query.username) {
                sql += " AND username LIKE ?";
                params.push(`%${query.username}%`);
            }

            // 按日期范围查询
            if (query.startDate) {
                sql += " AND duty_date >= ?";
                params.push(query.startDate);
            }
            if (query.endDate) {
                sql += " AND duty_date <= ?";
                params.push(query.endDate);
            }

            // 按单个日期查询
            if (query.duty_date && !query.startDate && !query.endDate) {
                sql += " AND duty_date = ?";
                params.push(query.duty_date);
            }

            sql += " ORDER BY duty_date DESC, userId ASC";

            DutyDb.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    /**
     * 根据ID查询单条记录
     * @param {number} id - 记录ID
     * @returns {Promise<object>} 单条记录
     */
    getById(id) {
        return new Promise((resolve, reject) => {
            DutyDb.get("SELECT * FROM hr_duty_summary WHERE id = ?", [id], (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    },

    /**
     * 创建考勤汇总记录
     * @param {object} data - 记录数据
     * @param {number} data.userId - 用户ID
     * @param {string} data.username - 用户名
     * @param {string} data.duty_date - 日期 YYYY-MM-DD
     * @param {string} data.value - 考勤值
     * @returns {Promise<object>} 创建结果，包含新记录ID
     */
    create(data) {
        return new Promise((resolve, reject) => {
            const { userId, username, duty_date, value, value_text } = data;

            const sql = `INSERT INTO hr_duty_summary (userId, username, duty_date, value, value_text) 
                         VALUES (?, ?, ?, ?, ?)`;
            const params = [userId, username || null, duty_date, value || null, value_text || null];

            DutyDb.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, userId, username, duty_date, value, value_text });
            });
        });
    },

    /**
     * 批量创建考勤汇总记录
     * @param {Array<object>} records - 记录数组
     * @returns {Promise<object>} 批量创建结果
     */
    batchCreate(records) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT OR REPLACE INTO hr_duty_summary (userId, username, duty_date, value, value_text) 
                         VALUES (?, ?, ?, ?, ?)`;

            DutyDb.serialize(() => {
                const stmt = DutyDb.prepare(sql);
                let count = 0;

                records.forEach((record) => {
                    const { userId, username, duty_date, value, value_text } = record;
                    stmt.run([userId, username || null, duty_date, value || null, value_text || null], function (err) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        count++;
                    });
                });

                stmt.finalize((err) => {
                    if (err) reject(err);
                    else resolve({ inserted: count, total: records.length });
                });
            });
        });
    },

    /**
     * 更新考勤汇总记录
     * @param {number} id - 记录ID
     * @param {object} data - 要更新的字段
     * @returns {Promise<object>} 更新后的记录
     */
    update(id, data = {}) {
        return new Promise((resolve, reject) => {
            // 只允许更新的字段
            const allowedFields = ["userId", "username", "duty_date", "value", "value_text"];
            const updates = {};
            const params = [];

            for (const [key, value] of Object.entries(data)) {
                if (allowedFields.includes(key)) {
                    updates[key] = value;
                    params.push(value);
                }
            }

            if (Object.keys(updates).length === 0) {
                reject(new Error("没有可更新的字段"));
                return;
            }

            const setClause = Object.keys(updates)
                .map((key) => `${key} = ?`)
                .join(", ");
            params.push(id);

            const sql = `UPDATE hr_duty_summary SET ${setClause} WHERE id = ?`;

            DutyDb.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ id, ...updates });
            });
        });
    },

    /**
     * 删除考勤汇总记录
     * @param {number} id - 记录ID
     * @returns {Promise<object>} 删除结果
     */
    delete(id) {
        return new Promise((resolve, reject) => {
            DutyDb.run("DELETE FROM hr_duty_summary WHERE id = ?", [id], function (err) {
                if (err) reject(err);
                else resolve({ id, deleted: this.changes > 0 });
            });
        });
    },

    /**
     * 根据userId和duty_date查询唯一记录
     * @param {number} userId - 用户ID
     * @param {string} duty_date - 日期 YYYY-MM-DD
     * @returns {Promise<object|null>} 记录或null
     */
    getByUserAndDate(userId, duty_date) {
        return new Promise((resolve, reject) => {
            DutyDb.get(
                "SELECT * FROM hr_duty_summary WHERE userId = ? AND duty_date = ?",
                [userId, duty_date],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row || null);
                }
            );
        });
    },
};

module.exports = hrDutySummaryService;
