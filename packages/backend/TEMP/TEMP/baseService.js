const { UserDb, DutyDb } = require("../config/sqliteDb.js");

function createBaseService(tableName, db) {
    return {
        tableName,
        db,

        create(data) {
            const filteredData = Object.fromEntries(
                Object.entries(data).filter(([key]) => key !== "id")
            );

            return new Promise((resolve, reject) => {
                const keys = Object.keys(filteredData).join(", ");
                const values = Object.values(filteredData);
                const placeholders = values.map(() => "?").join(", ");

                db.run(`INSERT INTO ${tableName} (${keys}) VALUES (${placeholders})`, values, function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, ...data });
                });
            });
        },

        findById(id) {
            return new Promise((resolve, reject) => {
                db.get(`SELECT * FROM ${tableName} WHERE id = ?`, [id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        },

        findAll() {
            return new Promise((resolve, reject) => {
                db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        },

        update(id, data) {
            return new Promise((resolve, reject) => {
                const updates = Object.keys(data)
                    .map((key) => `${key} = ?`)
                    .join(", ");
                const values = [...Object.values(data), id];

                db.run(`UPDATE ${tableName} SET ${updates} WHERE id = ?`, values, function (err) {
                    if (err) reject(err);
                    else resolve({ id, ...data });
                });
            });
        },

        delete(id) {
            return new Promise((resolve, reject) => {
                db.run(`DELETE FROM ${tableName} WHERE id = ?`, [id], function (err) {
                    if (err) reject(err);
                    else resolve({ deletedId: id });
                });
            });
        },

        async count(filter = {}) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    let results = [];
                    if (filter.name) {
                        results = results.filter((item) => item.name.includes(filter.name));
                    }
                    resolve(results.length);
                }, 200);
            });
        },
    };
}

module.exports = createBaseService;
