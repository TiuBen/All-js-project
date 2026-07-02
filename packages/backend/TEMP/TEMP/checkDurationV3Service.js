const createBaseService = require("./baseService");
const { DutyDb } = require("../config/sqliteDb.js");
const dayjs = require("dayjs");
const { checkRule } = require("../utils/checkV3.js");

const base = createBaseService("duty", DutyDb);

const checkDurationV3Service = {
    ...base,

    _queryDutyByMonth(userId, year, month) {
        console.log(year, month);
        const firstDay = dayjs()
            .year(year)
            .month(month - 1)
            .startOf("month");

        const monthStart = firstDay.startOf("day");
        const monthEnd = firstDay.endOf("month").endOf("day");

        console.log(monthStart.format("YYYY-MM-DD HH:mm:ss"));

        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM duty WHERE userId = ? AND inTime <= DATETIME(?)  AND outTime >= DATETIME(?) `;
            const params = [userId, monthEnd.format("YYYY-MM-DD HH:mm:ss"), monthStart.format("YYYY-MM-DD HH:mm:ss")];
            console.log(sql);
            console.log(params);
            base.db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows || []);
            });
        });
    },

    async check(userId, year, month) {
        const allRecords = await this._queryDutyByMonth(userId, year, month);

        console.log("allRecords.length", allRecords.length);
        const result24hour = checkRule(allRecords, {
            windowHours: 24,
            thresholdHours: 10,
            mergeGapMinutes: 30,
            removeGapHours: 8,
        });

        const result7day = checkRule(allRecords, {
            windowHours: 168,
            thresholdHours: 40,
            mergeGapMinutes: 30,
        });

        return {
            hasViolation: result24hour.some((item) => item.hasOvertime) || result7day.some((item) => item.hasOvertime),
            result24hour,
            result7day,
        };
    },
};

module.exports = checkDurationV3Service;
