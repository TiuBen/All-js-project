const BaseService = require("./Base.Service");
const { UserDb, DutyDb } = require("../config/sqliteDb.js");
const { fromDutyDbGetData } = require("../utils/fromDutyDbGetData.js");
const dayjs = require("dayjs");
const { normalizeValue, normalizeRow } = require("../utils/sqliteSaveReadArrayTools.js");

const ALLOWED_COLUMNS = [
    "id",
    "username",
    "position",
    "dutyType",
    "inTime",
    "outTime",
    "roleType",
    "relatedDutyTableRowId",
    "roleStartTime",
    "roleEndTime",
    "roleTimes",
    "status",
    "relatedPrepareTableId",
];

class DutyService extends BaseService {
    constructor() {
        super("duty", DutyDb);
        this.getAll = this.getAll.bind(this);
        this.findById = this.findById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.create = this.create.bind(this);
     
    }

    create(data) {
        //console.log("DutyService create");
        //console.log(data);
        const { teacherDutyRowId} = data;
        if(data?.inTime===undefined ){
            data.inTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
        }

        const _tempD = { ...data };

        // ! 见习人员打卡的逻辑部分
        if (teacherDutyRowId) {
            _tempD.roleType = "见习";
            _tempD.roleStartTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
        }
       
        delete _tempD.teacherDutyRowId;

        console.log("_tempD");
        console.log(_tempD);
        // create 肯定是不包括 ID 的
        const filteredData = Object.fromEntries(Object.entries(_tempD).filter(([key]) => key !== "id"));

        return new Promise((resolve, reject) => {
            const keys = Object.keys(filteredData).join(", ");
            const values = Object.values(filteredData).map(normalizeValue);
            const placeholders = values.map(() => "?").join(", ");

            this.db.run(`INSERT INTO duty (${keys}) VALUES (${placeholders})`, values, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                //console.log(this);
                //console.log(JSON.stringify(this));
                //console.log(this.lastID);
                resolve({ ...this });
            });
        });
    }

    async getAll(query, needCalculate) {
        //console.log("DutyService getAll");
        // //console.log(query);
        return await fromDutyDbGetData(query, DutyDb);
    }

    findById(id) {
        //console.log("DutyService findById:" + id);

        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM duty WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    //console.log("error" + err);
                    reject(err);
                } else {
                    // //console.log(row);

                    resolve(normalizeRow(row));
                }
            });
        });
    }

    update(id, data = {}) {
        //console.log("DutyService updateById:" + id);

        return new Promise((resolve, reject) => {
            const saveFields = Object.entries(data).reduce((acc, [key, value]) => {
                if (ALLOWED_COLUMNS.includes(key)) {
                    acc[key] = value;
                }
                return acc;
            }, {});

            const updates = Object.keys(saveFields)
                .map((key) => `${key} = ?`)
                .join(", ");
            const values = [...Object.values(saveFields).map(normalizeValue), id];

            // //console.log(values);

            this.db.run(`UPDATE duty SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    }

    delete(id) {
        //console.log("DutyService deleteById:" + id);

        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM duty WHERE id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve({ id });
            });
        });
    }


    // ddddtet() {
    //     //console.log("ddddtet");
    // }
    // getStatisticsByUserId(id, startDate, startTime, endDate, endTime) {
    // let sql = "SELECT * FROM duty WHERE 1=1";
    // let params = [];
    // if (id) {
    //     sql += ` AND id = ?`; // Add filter for 'id' if provided
    //     params.push(id);
    // }
    // if (inTime || (startDate && startTime)) {
    //     const _inTime = endDate + " " + endTime;

    //     sql += ` AND inTime <=DATETIME(?)`; // Add filter for 'inTime' if provided
    //     params.push(_inTime);
    // }

    // if (outTime || (endDate && endTime)) {
    //     if (outTime === "null") {
    //         sql += " AND outTime IS NULL";
    //     } else {
    //         const _outTime = startDate + " " + startTime;

    //         sql += ` AND outTime  >=DATETIME(?) `; // Add filter for 'outTime' if provided
    //         params.push(_outTime);
    //     }
    // }

    //     return this.getAll({ id: id, startDate: startDate, startTime: startTime, endDate: endDate, endTime: endTime });
    // }
}

module.exports = DutyService;
