const BaseService = require("./Base.Service");
const { DutyDb } = require("../config/sqliteDb.js");
const dayjs = require("dayjs");
const { normalizeRow } = require("../utils/sqliteSaveReadArrayTools.js");

const ATC_POSITIONS = [
    "东塔台", "西塔台", "东地面", "西地面", "地面",
    "东放行", "西放行", "放行",
    "进近高扇", "进近低扇", "流控",
];

const RULES = {
    MAX_CONSECUTIVE_HOURS: 10,
    MAX_24H_CUMULATIVE_HOURS: 10,
    REST_HOURS_AFTER_10H: 8,
    MAX_WEEKLY_HOURS: 40,
    MAX_POSITION_CONSECUTIVE_HOURS: 6,
    MIN_POSITION_BREAK_MINUTES: 30,
};

function getDutyDurationHours(inTime, outTime) {
    const start = dayjs(inTime);
    const end = outTime ? dayjs(outTime) : dayjs();
    return parseFloat(end.diff(start, "hour", true).toFixed(2));
}

function isATCPosition(position) {
    return ATC_POSITIONS.includes(position);
}

function getDistinctUsers(rows) {
    const map = new Map();
    for (const row of rows) {
        if (!map.has(row.username)) {
            map.set(row.username, { username: row.username, userId: row.userId });
        }
    }
    return Array.from(map.values());
}

function checkConsecutiveDuty(sortedRows) {
    const violations = [];
    for (let i = 0; i < sortedRows.length; i++) {
        const row = sortedRows[i];
        const duration = getDutyDurationHours(row.inTime, row.outTime);
        if (duration > RULES.MAX_CONSECUTIVE_HOURS) {
            violations.push({
                rule: "连续执勤不超过10小时",
                detail: `执勤${duration.toFixed(2)}小时 (工号: ${row.username}, ${row.inTime} ~ ${row.outTime || "进行中"})`,
            });
        }
    }
    return violations;
}

function check24hCumulative(sortedRows, now) {
    const violations = [];
    const window24hStart = now.subtract(24, "hour");

    for (const row of sortedRows) {
        const inTime = dayjs(row.inTime);
        const outTime = row.outTime ? dayjs(row.outTime) : now;
        if (inTime.isAfter(window24hStart) || outTime.isAfter(window24hStart)) {
            const overlapStart = dayjs.max(inTime, window24hStart);
            const overlapEnd = dayjs.min(outTime, now);
            const hours = parseFloat(overlapEnd.diff(overlapStart, "hour", true).toFixed(2));
            if (hours > RULES.MAX_24H_CUMULATIVE_HOURS) {
                violations.push({
                    rule: "24小时内累计执勤不超过10小时",
                    detail: `累计${hours.toFixed(2)}小时`,
                });
                break;
            }
        }
    }

    let total24h = 0;
    for (const row of sortedRows) {
        const inTime = dayjs(row.inTime);
        const outTime = row.outTime ? dayjs(row.outTime) : now;
        if (inTime.isAfter(window24hStart) || outTime.isAfter(window24hStart)) {
            const overlapStart = dayjs.max(inTime, window24hStart);
            const overlapEnd = dayjs.min(outTime, now);
            total24h += parseFloat(overlapEnd.diff(overlapStart, "hour", true).toFixed(2));
        }
    }

    return { violations, total24h: parseFloat(total24h.toFixed(2)) };
}

function checkRestAfter10h(sortedRows, now) {
    const violations = [];
    const window24hStart = now.subtract(24, "hour");

    const recentRows = sortedRows.filter((r) => {
        const inTime = dayjs(r.inTime);
        return inTime.isAfter(window24hStart);
    });

    if (recentRows.length === 0) return { violations, total24h: 0 };

    let cumulativeHours = 0;
    for (const row of recentRows) {
        const inTime = dayjs(row.inTime);
        const outTime = row.outTime ? dayjs(row.outTime) : now;
        const duration = getDutyDurationHours(row.inTime, row.outTime);
        cumulativeHours += duration;

        if (cumulativeHours > RULES.MAX_24H_CUMULATIVE_HOURS) {
            const needRestUntil = inTime.add(RULES.REST_HOURS_AFTER_10H, "hour");
            const nextDuty = recentRows.find((r) => dayjs(r.inTime).isAfter(outTime));
            if (nextDuty && dayjs(nextDuty.inTime).isBefore(needRestUntil)) {
                violations.push({
                    rule: "累计超10小时后需连续休息8小时",
                    detail: `需休息至${needRestUntil.format("YYYY-MM-DD HH:mm")}，但${nextDuty.inTime}已上岗`,
                });
            }
            break;
        }
    }

    return { violations };
}

function checkWeeklyHours(sortedRows, now) {
    const violations = [];
    const weekStart = now.startOf("week").add(1, "day");
    const weekEnd = weekStart.add(7, "day");

    let totalWeekly = 0;
    for (const row of sortedRows) {
        const inTime = dayjs(row.inTime);
        const outTime = row.outTime ? dayjs(row.outTime) : now;
        if (inTime.isBefore(weekEnd) && outTime.isAfter(weekStart)) {
            const overlapStart = dayjs.max(inTime, weekStart);
            const overlapEnd = dayjs.min(outTime, weekEnd);
            totalWeekly += parseFloat(overlapEnd.diff(overlapStart, "hour", true).toFixed(2));
        }
    }

    totalWeekly = parseFloat(totalWeekly.toFixed(2));
    if (totalWeekly > RULES.MAX_WEEKLY_HOURS) {
        violations.push({
            rule: "每周执勤时间不超过40小时",
            detail: `本周累计${totalWeekly}小时`,
        });
    }

    return { violations, totalWeekly };
}

function checkPositionConsecutive(sortedRows) {
    const violations = [];

    const positionRows = sortedRows.filter((r) => isATCPosition(r.position));
    positionRows.sort((a, b) => dayjs(a.inTime).valueOf() - dayjs(b.inTime).valueOf());

    for (let i = 0; i < positionRows.length; i++) {
        const row = positionRows[i];
        const duration = getDutyDurationHours(row.inTime, row.outTime);
        if (duration > RULES.MAX_POSITION_CONSECUTIVE_HOURS) {
            violations.push({
                rule: "管制席位连续执勤不超过6小时",
                detail: `${row.position}执勤${duration.toFixed(2)}小时 (${row.inTime} ~ ${row.outTime || "进行中"})`,
            });
        }
    }

    for (let i = 1; i < positionRows.length; i++) {
        const prevOut = positionRows[i - 1].outTime ? dayjs(positionRows[i - 1].outTime) : dayjs();
        const currIn = dayjs(positionRows[i].inTime);
        const breakMinutes = currIn.diff(prevOut, "minute");
        if (breakMinutes < RULES.MIN_POSITION_BREAK_MINUTES && breakMinutes >= 0) {
            violations.push({
                rule: "管制席位间休息不少于30分钟",
                detail: `${positionRows[i - 1].position}→${positionRows[i].position}间隔${breakMinutes}分钟`,
            });
        }
    }

    return violations;
}

class CheckDurationService extends BaseService {
    constructor() {
        super("duty", DutyDb);
    }

    async checkAll(now) {
        const currentTime = now || dayjs();
        const window24hStart = currentTime.subtract(24, "hour").format("YYYY-MM-DD HH:mm:ss");
        const window7dStart = currentTime.subtract(7, "day").format("YYYY-MM-DD HH:mm:ss");
        const currentTimeStr = currentTime.format("YYYY-MM-DD HH:mm:ss");

        const allRows = await new Promise((resolve, reject) => {
            const sql = `SELECT * FROM duty WHERE inTime <= ? AND (outTime IS NULL OR outTime >= ?)`;
            this.db.all(sql, [currentTimeStr, window7dStart], (err, rows) => {
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
    }
}

module.exports = CheckDurationService;
