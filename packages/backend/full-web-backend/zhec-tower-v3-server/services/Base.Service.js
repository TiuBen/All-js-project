const { UserDb, DutyDb } = require("../config/sqliteDb.js");

class BaseService {
    constructor(tableName, db) {
        this.tableName = tableName;
        this.db = db;
        this.create = this.create.bind(this);
        this.findById = this.findById.bind(this);
        this.findAll = this.findAll.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.count = this.count.bind(this);

        this.mockData = [
            { _id: "1", name: "Item 1", createdAt: new Date() },
            { _id: "2", name: "Item 2", createdAt: new Date() },
            { _id: "3", name: "Item 3", createdAt: new Date() },
        ];
    }

    // constructor(service) {
    //     //console.log("BaseService");

    //     // this.model = model;
    //     // 模拟数据
    //     this.mockData = [
    //         { _id: "1", name: "Item 1", createdAt: new Date() },
    //         { _id: "2", name: "Item 2", createdAt: new Date() },
    //         { _id: "3", name: "Item 3", createdAt: new Date() },
    //     ];
    //     this.service = service;
    //     this.create = this.create.bind(this);
    //     this.findById = this.findById.bind(this);
    //     this.findAll = this.findAll.bind(this);
    //     this.update = this.update.bind(this);
    //     this.delete = this.delete.bind(this);
    //     this.count = this.count.bind(this);
    // }

    // async create(data) {
    //   const item = new this.model(data);
    //   return await item.save();
    // }

    // async findById(id, populate = '') {
    //   return await this.model.findById(id).populate(populate);
    // }

    // async findAll(filter = {}, options = {}) {
    //   const { skip = 0, limit = 10, sort = { _id: -1 }, populate = '' } = options;
    //   return await this.model
    //     .find(filter)
    //     .skip(skip)
    //     .limit(limit)
    //     .sort(sort)
    //     .populate(populate);
    // }

    // async update(id, data) {
    //   return await this.model.findByIdAndUpdate(id, data, { new: true });
    // }

    // async delete(id) {
    //   return await this.model.findByIdAndDelete(id);
    // }

    // async count(filter = {}) {
    //   return await this.model.countDocuments(filter);
    // }

    // async create(data) {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             const newItem = {
    //                 _id: `${this.mockData.length + 1}`,
    //                 ...data,
    //                 createdAt: new Date(),
    //             };
    //             this.mockData.push(newItem);
    //             resolve(newItem);
    //         }, 300);
    //     });
    // }

    create(data) {
        //console.log("BaseService create");
        
        // create 肯定是不包括 ID 的
        const filteredData = Object.fromEntries(
            Object.entries(data).filter(([key]) => key !== "id")
        );

        return new Promise((resolve, reject) => {
            const keys = Object.keys(filteredData).join(", ");
            const values = Object.values(filteredData);
            const placeholders = values.map(() => "?").join(", ");

            //console.log("BaseService create");
            //console.log(`INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`);
            this.db.run(`INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders})`, values, function (err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    }

    // async findById(id, populate = "") {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             const item = this.mockData.find((item) => item._id === id);
    //             resolve(item || null);
    //         }, 200);
    //     });
    // }

    findById(id) {
        //console.log("BaseService findById");

        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // findAll() {
    //     //console.log("BaseService findAll");
    //     return new Promise((resolve, reject) => {
    //         settingDb.all(`SELECT * FROM ${this.tableName}`, [], (err, rows) => {
    //             if (err) reject(err);
    //             else resolve(rows);
    //         });
    //     });
    // }

    findAll() {
        //console.log("BaseService findAll");
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${this.tableName}`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // async update(id, data) {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             const index = this.mockData.findIndex((item) => item._id === id);
    //             if (index === -1) {
    //                 resolve(null);
    //                 return;
    //             }

    //             const updatedItem = {
    //                 ...this.mockData[index],
    //                 ...data,
    //                 updatedAt: new Date(),
    //             };
    //             this.mockData[index] = updatedItem;

    //             resolve(updatedItem);
    //         }, 400);
    //     });
    // }

    update(id, data) {
        return new Promise((resolve, reject) => {
            const updates = Object.keys(data)
                .map((key) => `${key} = ?`)
                .join(", ");
            const values = [...Object.values(data), id];

            this.db.run(`UPDATE ${this.tableName} SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    }

    // async delete(id) {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             const index = this.mockData.findIndex((item) => item._id === id);
    //             if (index === -1) {
    //                 resolve(null);
    //                 return;
    //             }

    //             const [deletedItem] = this.mockData.splice(index, 1);
    //             resolve(deletedItem);
    //         }, 300);
    //     });
    // }

    delete(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve({ deletedId: id });
            });
        });
    }
    async count(filter = {}) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // 简单过滤模拟
                let results = this.mockData;
                if (filter.name) {
                    results = results.filter((item) => item.name.includes(filter.name));
                }
                resolve(results.length);
            }, 200);
        });
    }
}

module.exports = BaseService;
