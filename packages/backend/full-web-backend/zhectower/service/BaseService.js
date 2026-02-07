const { settingDb } = require("../utils/SqliteDb");

class BaseService {
    constructor(tableName,db=settingDb) {
        this.tableName = tableName;
        this.db = db;
    }

    create(data) {
        return new Promise((resolve, reject) => {
            const keys = Object.keys(data).join(", ");
            const values = Object.values(data);
            const placeholders = values.map(() => "?").join(", ");

            console.log("BaseService create");
            console.log(`INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`);
            settingDb.run(`INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`, values, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    }

    findAll() {
        console.log("BaseService findAll");
        return new Promise((resolve, reject) => {
            settingDb.all(`SELECT * FROM ${this.tableName}`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    findById(id) {
        return new Promise((resolve, reject) => {
            settingDb.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    update(id, data) {
        console.log("base service update");
 
        
        console.log(data);

        return new Promise((resolve, reject) => {
            const updates = Object.keys(data)
                .map((key) => `${key} = ?`)
                .join(", ");
            const values = [...Object.values(data), id];

           console.log(updates);
           console.log(values);
           
           

            settingDb.run(`UPDATE ${this.tableName} SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    }

    delete(id) {
        return new Promise((resolve, reject) => {
            settingDb.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve({ deletedId: id });
            });
        });
    }
}

module.exports = BaseService;
