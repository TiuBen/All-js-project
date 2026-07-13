const { UserDb, DutyDb } = require("../config/sqliteDb.js");
const dayjs = require("dayjs");
const { normalizeValue } = require("../tools/rawRowToJsObject.js");
const { calculateStatistics } = require("../utils/util/sumDutyRow");
const { FinalEditionDutyRowClip } = require("../utils/util/clipDutyRow");

const { queryDuty } = require("../utils/queryDuty.js");

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

    async getByQuery(query) {
        try {
            const dutyRows = await queryDuty(query);
            console.log("sssss dutyRows length:", dutyRows.length);

            if (dutyRows.length > 0) {
                // 处理每一行数据
                const processedRows = dutyRows.map((row) => {
                    try {
                        return FinalEditionDutyRowClip(row);
                    } catch (error) {
                        console.error("处理单行数据出错:", error, row);
                        return row; // 返回原始数据
                    }
                });

                // 过滤掉处理失败的行（可选）
                return processedRows;
            } else {
                return [];
            }
        } catch (error) {
            console.error("getByQuery 出错:", error);
            throw error;
        }
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
