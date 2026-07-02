const { UserDb, DutyDb } = require("../config/sqliteDb.js");
const { fromDutyDbGetData } = require("../utils/util/fromDutyDbGetData.js");
const dayjs = require("dayjs");
const { normalizeValue, normalizeRow } = require("../utils/util/sqliteSaveReadArrayTools.js");
const ALLOWED_COLUMNS = [
    "id",
    "userId",
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
const dutyService = {
    create(data) {
        const { teacherDutyRowId } = data;
        if (data?.inTime === undefined) {
            data.inTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
        }

        const _tempD = { ...data };

        if (teacherDutyRowId) {
            _tempD.roleType = "见习";
            _tempD.roleStartTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
        }

        delete _tempD.teacherDutyRowId;

        console.log("_tempD");
        console.log(_tempD);
        const filteredData = Object.fromEntries(Object.entries(_tempD).filter(([key]) => key !== "id"));

        return new Promise((resolve, reject) => {
            const keys = Object.keys(filteredData).join(", ");
            const values = Object.values(filteredData).map(normalizeValue);
            const placeholders = values.map(() => "?").join(", ");

            DutyDb.run(`INSERT INTO duty (${keys}) VALUES (${placeholders})`, values, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve({ ...this });
            });
        });
    },

    async getAll(query, needCalculate) {
        console.log("DutyService getAll");
        console.log(query);
        return await fromDutyDbGetData(query, DutyDb);
    },

    findById(id) {
        return new Promise((resolve, reject) => {
            DutyDb.get(`SELECT * FROM duty WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(normalizeRow(row));
            });
        });
    },

    update(id, data = {}) {
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

            DutyDb.run(`UPDATE duty SET ${updates} WHERE id = ?`, values, function (err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    },

    delete(id) {
        return new Promise((resolve, reject) => {
            DutyDb.run(`DELETE FROM duty WHERE id = ?`, [id], function (err) {
                if (err) reject(err);
                else resolve({ id });
            });
        });
    },
};

module.exports = dutyService;
