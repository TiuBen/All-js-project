const { UserDb, DutyDb } = require("../config/sqliteDb.js");
const { normalizeValue, normalizeRow } = require("../utils/util/sqliteSaveReadArrayTools.js");

// const ALLOWED_COLUMNS = ["id", "username","password","position", "dutyType", "roleType", "status", "avatarImage", "team","rank"];
const ALLOWED_COLUMNS = ["id", "username", "position", "dutyType", "roleType", "status", "avatarImage", "team", "rank"];
const userService = {
    create(data) {
        const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => key !== "id"));

        return new Promise((resolve, reject) => {
            const keys = Object.keys(filteredData).join(", ");
            const values = Object.values(filteredData);
            const placeholders = values.map(() => "?").join(", ");

            UserDb.run(`INSERT INTO user (${keys}) VALUES (${placeholders})`, values, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    },

    getAll(options) {
        return new Promise((resolve, reject) => {
            const safeFields =
                options.fields[0] === "*" ? ALLOWED_COLUMNS : options.fields.filter((f) => ALLOWED_COLUMNS.includes(f));

            const query = `SELECT ${safeFields.join(", ")} FROM user ORDER BY "rank"`;

            UserDb.all(query, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                try {
                    const jsObjectRows = rows.map((row) => {
                        return normalizeRow(row);
                    });

                    resolve(jsObjectRows);
                } catch (error) {
                    reject(error);
                }
            });
        });
    },

    findById(id) {
        return new Promise((resolve, reject) => {
            UserDb.get(`SELECT * FROM user WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(normalizeRow(row));
            });
        });
    },

    update(id, data) {
        return new Promise((resolve, reject) => {
            const processedData = {};
            const values = [];

            Object.keys(data)
                .filter((key) => ALLOWED_COLUMNS.includes(key))
                .forEach((key) => {
                    if (Array.isArray(data[key])) {
                        processedData[key] = JSON.stringify(data[key]);
                    } else {
                        processedData[key] = data[key];
                    }
                    values.push(processedData[key]);
                });
            const updates = Object.keys(processedData)
                .map((key) => `${key} = ?`)
                .join(", ");
            values.push(id);

            UserDb.run(`UPDATE user SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    },

    delete(id) {
        return new Promise((resolve, reject) => {
            UserDb.run(`DELETE FROM user WHERE id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve({ deletedId: id });
            });
        });
    },
};

module.exports = userService;
