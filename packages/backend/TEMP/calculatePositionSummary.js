const dayjs = require("dayjs");
const { DutyDb } = require("../../config/sqliteDb.js");

function calculatePositionSummary(year, month) {
    console.log("calculatePositionSummary called with year:", year, "month:", month);
    return new Promise((resolve, reject) => {
        const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
        const endDate = dayjs(startDate).add(1, "month").format("YYYY-MM-DD");

        const sql = `
            SELECT * FROM duty WHERE 1=1
            AND inTime <= DATETIME(?)
            AND outTime >= DATETIME(?)
            ORDER BY position ASC
        `;

        DutyDb.all(sql, [`${endDate} 08:30:00`, `${startDate} 18:00:00`], (err, rows) => {
            if (err) {
                console.error("查询月度夜班数据失败:", err);
                reject(new Error("数据库查询失败"));
                return;
            }

            console.log("查询结果:", rows.length);

            // 按 position 和 dutyType 分组统计
            const summary = {};

            rows.forEach((row) => {
                // 计算执勤时长（小时）
                const inTime = dayjs(row.inTime);
                const outTime = dayjs(row.outTime);
                const durationHours = outTime.diff(inTime, "hour", true); // true 表示返回浮点数

                const key = `${row.position}_${row.dutyType || "默认"}`;

                if (!summary[key]) {
                    summary[key] = {
                        position: row.position,
                        dutyType: row.dutyType,
                        totalHours: 0,
                        count: 0,
                        minHours: Infinity, // 初始化最短时长为无穷大
                        maxHours: -Infinity, // 初始化最长时间为无穷小
                        details: [],
                    };
                }

                summary[key].totalHours += durationHours;
                summary[key].count += 1;
                // 更新最短和最长时间
                summary[key].minHours = Math.min(summary[key].minHours, durationHours);
                summary[key].maxHours = Math.max(summary[key].maxHours, durationHours);
            });
            // 计算平均值并格式化结果
            const result = Object.values(summary).map((item) => {
                const avgHours = item.count > 0 ? item.totalHours / item.count : 0;
                return {
                    position: item.position,
                    dutyType: item.dutyType,
                    totalHours: Math.round(item.totalHours * 100) / 100,
                    count: item.count,
                    averageHours: Math.round(avgHours * 100) / 100,
                    minHours: Math.round(item.minHours * 100) / 100,
                    maxHours: Math.round(item.maxHours * 100) / 100,
                    details: item.details,
                };
            });
            const positionSummary = {};

            result.forEach((item) => {
                if (!positionSummary[item.position]) {
                    positionSummary[item.position] = {};
                }

                const data = {
                    totalHours: item.totalHours,
                    count: item.count,
                    averageHours: item.averageHours,
                    minHours: item.minHours,
                    maxHours: item.maxHours,
                    details: item.details,
                };

                if (item.dutyType === "主班") {
                    positionSummary[item.position].main = data;
                } else if (item.dutyType === "副班") {
                    positionSummary[item.position].sub = data;
                } else {
                    // 没有主副班的岗位统一放 main
                    positionSummary[item.position].main = data;
                }
            });

            resolve(positionSummary);
        });
    });
}

module.exports = { calculatePositionSummary };
