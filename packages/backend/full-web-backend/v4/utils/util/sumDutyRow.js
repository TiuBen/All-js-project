const dayjs = require("dayjs");
const {
    Tower_POSITIONS,
    Ground_POSITIONS,
    Delivery_POSITIONS,
    Leader_POSITIONS,
    AOC_POSITIONS,
    DD_POSITIONS,
} = require("../../config/Const");
function calculateStatistics(dutyRecords) {
    const result = {
        totalTime: { time: 0, dayShift: 0, nightShift: 0 },

        totalCommanderTime: { time: 0, dayShift: 0, nightShift: 0 },

        totalTowerMainTime: { time: 0, dayShift: 0, nightShift: 0 },
        totalTowerSubTime: { time: 0, dayShift: 0, nightShift: 0 },

        totalGroundTime: { time: 0, dayShift: 0, nightShift: 0 },

        totalDeliveryTime: { time: 0, dayShift: 0, nightShift: 0 },

        totalAOCTime: { time: 0, dayShift: 0, nightShift: 0 },

        totalDDTime: { time: 0, dayShift: 0, nightShift: 0 },

        // 月度统计
        positionTime: { time: 0, dayShift: 0, nightShift: 0 },
        teacherTime: { time: 0, dayShift: 0, nightShift: 0 },
        traineeTime: { time: 0, dayShift: 0, nightShift: 0 },
    };

    for (const record of dutyRecords) {
        // 如果没有 segments，尝试回退到 inTime/outTime 计算（防御性编程）
        let segments = record.segments;
        if (!segments || segments.length === 0) {
            if (record.inTime && record.outTime) {
                segments = [{ start: record.inTime, end: record.outTime, tags: [] }];
            } else {
                continue;
            }
        }

        for (const seg of segments) {
            const hours = dayjs(seg.end).diff(dayjs(seg.start), "second") / 3600;

            // 2. 标签解析 (关键修复点)
            const tags = seg.tags || [];
            // const isNight = seg.tags.some((t) => t.type === "夜班");
            // // const isTeacher = seg.tags.some((t) => t.type === "教员");
            // const isTeacher = Array.isArray(record.relatedDutyTableRowId);
            // const isLeader = record?.position?.includes("领班");
            // const isTrainee = record?.roleType?.includes("见习");

            // 优先从 tags 中获取角色信息，这是最准确的
            const tagTypes = tags.map((t) => t.type);

            const isNight = tagTypes.includes("夜班");
            const isLeader = tagTypes.includes("领班") || Leader_POSITIONS.includes(record.position);
            const isTeacher = tagTypes.includes("教员");
            const isTrainee = tagTypes.includes("见习") || record.roleType === "见习";

            //--------------------------------------------------
            // 总小时（所有席位都统计）
            //--------------------------------------------------

            result.totalTime.time += hours;

            if (isNight) result.totalTime.nightShift += hours;
            else result.totalTime.dayShift += hours;

            //--------------------------------------------------
            // 教员
            //--------------------------------------------------

            if (isTeacher) {
                result.teacherTime.time += hours;

                if (isNight) result.teacherTime.nightShift += hours;
                else result.teacherTime.dayShift += hours;
            }

            //--------------------------------------------------
            // 见习
            //--------------------------------------------------

            if (isTrainee) {
                result.traineeTime.time += hours;

                if (isNight) result.traineeTime.nightShift += hours;
                else result.traineeTime.dayShift += hours;
            }

            //--------------------------------------------------
            // 领班统计
            //--------------------------------------------------

            if (Leader_POSITIONS.includes(record.position) || isLeader) {
                result.totalCommanderTime.time += hours;

                if (isNight) result.totalCommanderTime.nightShift += hours;
                else result.totalCommanderTime.dayShift += hours;
            }

            //--------------------------------------------------
            // 教员、领班覆盖席位
            //--------------------------------------------------

            if (isTeacher || isLeader) {
                continue;
            }

            //--------------------------------------------------
            // 月度席位统计
            //--------------------------------------------------

            result.positionTime.time += hours;

            if (isNight) result.positionTime.nightShift += hours;
            else result.positionTime.dayShift += hours;

            //--------------------------------------------------
            // 各席位统计
            //--------------------------------------------------

            let target = null;

            if (Tower_POSITIONS.includes(record.position)) {
                if (record.dutyType === "主班") {
                    target = result.totalTowerMainTime;
                } else {
                    target = result.totalTowerSubTime;
                }
            } else if (Ground_POSITIONS.includes(record.position)) {
                target = result.totalGroundTime;
            } else if (Delivery_POSITIONS.includes(record.position)) {
                target = result.totalDeliveryTime;
            } else if (AOC_POSITIONS.includes(record.position)) {
                target = result.totalAOCTime;
            } else if (DD_POSITIONS.includes(record.position)) {
                target = result.totalDDTime;
            }

            if (!target) continue;

            target.time += hours;

            if (isNight) target.nightShift += hours;
            else target.dayShift += hours;
        }
    }

    // 保留两位小数
    Object.values(result).forEach((item) => {
        item.time = Number(item.time.toFixed(2));
        item.dayShift = Number(item.dayShift.toFixed(2));
        item.nightShift = Number(item.nightShift.toFixed(2));
    });

    return result;
}

module.exports = { calculateStatistics };
