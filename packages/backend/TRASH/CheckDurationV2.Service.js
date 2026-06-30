const BaseService = require("./Base.Service");
const { DutyDb } = require("../config/sqliteDb.js");
const dayjs = require("dayjs");
const { normalizeRow } = require("../utils/sqliteSaveReadArrayTools.js");
const { getWindowGroups, mergeByGap, checkWithExclusion } = require("../utils/check.js");

class CheckDurationV2Service extends BaseService {
    constructor() {
        super("duty", DutyDb);
    }

    _queryDutyByMonth(userId, year, month) {
        const monthStart = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).startOf("day");
        const monthEnd = monthStart.endOf("month");
        const bufferStart = monthStart.subtract(7, "day");

        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM duty WHERE userId = ? AND inTime <= ? AND (outTime >= ? OR outTime IS NULL) ORDER BY inTime ASC`;
            const params = [
                userId,
                monthEnd.format("YYYY-MM-DD HH:mm:ss"),
                bufferStart.format("YYYY-MM-DD HH:mm:ss"),
            ];
            this.db.all(sql, params, (err, rows) => {
                if (err) return reject(err);
                resolve((rows || []).map(normalizeRow));
            });
        });
    }

    /**
     * @param {Object} params
     * @param {number|string} params.userId
     * @param {number|string} params.year
     * @param {number|string} params.month
     * @param {number} [params.windowSize=24] - 窗口大小（小时）
     * @param {number} [params.threshold=8] - 累积阈值（小时）
     * @param {number} [params.gap=30] - 合并间隔（分钟）
     * @param {number} [params.excludeGap=4] - 排除间隔（小时）
     */
    async checkByMonth({ userId, year, month, windowSize = 24, threshold = 8, gap = 30, excludeGap = 4 }) {
        const records = await this._queryDutyByMonth(userId, year, month);

        if (!records || records.length === 0) {
            return {
                userId,
                year: Number(year),
                month: Number(month),
                hasViolation: false,
                message: "该用户该月无执勤数据",
            };
        }

        // 1. 窗口分组
        const groups = getWindowGroups(records, windowSize);

        // 2. 对每组做间隔合并 + 累积检查
        const groupResults = groups.map((group, index) => {
            const { merged, hasMerged } = mergeByGap(group, gap);
            const checkResult = checkWithExclusion(merged, threshold, excludeGap);

            return {
                groupIndex: index,
                baseRecordId: group[0].id,
                baseInTime: group[0].inTime,
                recordCount: group.length,
                mergedCount: merged.length,
                hasMerged,
                mergedRecords: merged,
                ...checkResult,
            };
        });

        const hasViolation = groupResults.some((g) => g.exceeded);

        return {
            userId,
            year: Number(year),
            month: Number(month),
            windowSize,
            threshold,
            gap,
            excludeGap,
            hasViolation,
            totalGroups: groups.length,
            groupResults,
        };
    }
}

module.exports = CheckDurationV2Service;
