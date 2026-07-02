const createBaseService = require("./baseService");
const { DutyDb } = require("../config/sqliteDb.js");
const dayjs = require("dayjs");
const { normalizeRow } = require("../utils/sqliteSaveReadArrayTools.js");

const checkDurationService = {
    async checkAll(now) {
        const currentTime = now || dayjs();
        const window24hStart = currentTime.subtract(24, "hour").format("YYYY-MM-DD HH:mm:ss");
        const window7dStart = currentTime.subtract(7, "day").format("YYYY-MM-DD HH:mm:ss");
        const currentTimeStr = currentTime.format("YYYY-MM-DD HH:mm:ss");

        const allRows = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM duty WHERE inTime <= ? AND (outTime IS NULL OR outTime >= ?)`;
            base.db.all(sql, [currentTimeStr, window7dStart], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(normalizeRow));
            });
        });

        const users = getDistinctUsers(allRows);
        const results = [];

        for (const user of users) {
            const userRows = allRows.filter((r) => r.username === user.username);
            userRows.sort((a, b) => dayjs(a.inTime).valueOf() - dayjs(b.inTime).valueOf());

            const consecutiveCheck = checkConsecutiveDuty(userRows);
            const { violations: v24h, total24h } = check24hCumulative(userRows, currentTime);
            const { violations: vRest } = checkRestAfter10h(userRows, currentTime);
            const { violations: vWeekly, totalWeekly } = checkWeeklyHours(userRows, currentTime);
            const vPosition = checkPositionConsecutive(userRows);

            const allViolations = [...consecutiveCheck, ...v24h, ...vRest, ...vWeekly, ...vPosition];

            results.push({
                username: user.username,
                userId: user.userId,
                compliant: allViolations.length === 0,
                violations: allViolations,
                stats: {
                    last24hHours: total24h,
                    thisWeekHours: totalWeekly,
                },
            });
        }

        return results;
    },
};

module.exports = checkDurationService;
