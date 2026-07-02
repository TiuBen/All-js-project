const BaseService = require("./Base.Service");
const { UserDb, DutyDb } = require("../config/sqliteDb.js");
const { normalizeValue, normalizeRow } = require("../utils/sqliteSaveReadArrayTools.js");

const ALLOWED_COLUMNS = ["id", "position", "dutyType", "canTeach", "display"];

class PositionService extends BaseService {
    constructor() {
        super("position", UserDb);
    }

    getAll(query) {
        //console.log("PositionService getAll");
        //console.log(query);

        let sql = "SELECT * FROM position WHERE 1=1";
        const values = [];

        if (query.display) {
            //console.log("query.display:" + query.display);
            sql += " AND display LIKE ?";
            if (query.display === "true") {
                values.push(`1`);
            } else {
                values.push(`0`);
            }
        }

        return new Promise((resolve, reject) => {
            this.db.all(sql, values, (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(normalizeRow));
            });
        });
    }

    getById(id) {
        //console.log("PositionService getById");
        //console.log(id);

        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM position WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(normalizeRow(row));
            });
        });
    }

    create(data) {
        //console.log("PositionService create");
        //console.log(data);
        // create 肯定是不包括 ID 的
        const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => key !== "id"));
        return new Promise((resolve, reject) => {
            const keys = Object.keys(filteredData).join(", ");
            const values = Object.values(filteredData);
            const placeholders = values.map(() => "?").join(", ");

            //console.log(`INSERT INTO position (${keys}) VALUES (${placeholders})`);
            this.db.run(`INSERT INTO position (${keys}) VALUES (${placeholders})`, values, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    }

    delete(id) {
        //console.log("PositionService delete");
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve({ deletedId: id });
            });
        });
    }

    update(id, data) {
        //console.log("PositionService update");
        //console.log(id);
        //console.log(data);

        const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => ALLOWED_COLUMNS.includes(key)));

        return new Promise((resolve, reject) => {
            const updates = Object.keys(filteredData)
                .map((key) => `${key} = ?`)
                .join(", ");
            const values = [...Object.values(filteredData).map(normalizeValue), id];

            this.db.run(`UPDATE ${this.tableName} SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    }
}

module.exports = PositionService;
