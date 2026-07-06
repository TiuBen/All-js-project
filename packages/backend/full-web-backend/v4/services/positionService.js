const { UserDb } = require("../config/sqliteDb.js");
const { rawRowToJsObject, normalizeValue } = require("../tools/rawRowToJsObject.js");
const ALLOWED_COLUMNS = ["id", "position", "dutyType", "canTeach", "display"];

const positionService = {
    getAll(query) {
        let sql = "SELECT * FROM position WHERE 1=1";
        const values = [];

        if (query.display) {
            sql += " AND display LIKE ?";
            if (query.display === "true") {
                values.push(`1`);
            } else {
                values.push(`0`);
            }
        }

        return new Promise((resolve, reject) => {
            UserDb.all(sql, values, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(rawRowToJsObject));
            });
        });
    },

    getById(id) {
        return new Promise((resolve, reject) => {
            UserDb.get(`SELECT * FROM position WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(rawRowToJsObject(row));
            });
        });
    },

    create(data) {
        const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => key !== "id"));
        return new Promise((resolve, reject) => {
            const keys = Object.keys(filteredData).join(", ");
            const values = Object.values(filteredData);
            const placeholders = values.map(() => "?").join(", ");

            base.db.run(`INSERT INTO position (${keys}) VALUES (${placeholders})`, values, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    },

    delete(id) {
        return new Promise((resolve, reject) => {
            UserDb.run(`DELETE FROM position WHERE id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve({ deletedId: id });
            });
        });
    },

    update(id, data) {
        const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => ALLOWED_COLUMNS.includes(key)));

        return new Promise((resolve, reject) => {
            const updates = Object.keys(filteredData)
                .map((key) => `${key} = ?`)
                .join(", ");
            const values = [...Object.values(filteredData).map(normalizeValue), id];

            UserDb.run(`UPDATE position SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    },
};

module.exports = positionService;
