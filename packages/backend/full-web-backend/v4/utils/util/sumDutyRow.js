const dayjs = require("dayjs");
const { Leader_POSITIONS, CalcRule } = require("../../config/Const");
function calculateStatistics(dutyRecords) {
    const result = {};

    // 初始化
    Object.keys(CalcRule).forEach((key) => {
        result[key] = {
            time: 0,
            dayShift: 0,
            nightShift: 0,
        };
    });

    // 其它统计
    result.positionTime = { time: 0, dayShift: 0, nightShift: 0 };
    result.teacherTime = { time: 0, dayShift: 0, nightShift: 0 };
    result.traineeTime = { time: 0, dayShift: 0, nightShift: 0 };

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
            const tagTypes = tags.map((t) => t.type);

            const isNight = tagTypes.includes("夜班");
            const isLeader = tagTypes.includes("领班") || Leader_POSITIONS.includes(record.position);
            const isTeacher = tagTypes.includes("教员");
            const isTrainee = tagTypes.includes("见习") || record.roleType === "见习";
            //------------------------------------------------------
            // CalcRule 自动统计
            //------------------------------------------------------

            Object.entries(CalcRule).forEach(([key, rule]) => {
                const { filter = {} } = rule;

                if (filter.position && !filter.position.includes(record.position)) {
                    return;
                }

                if (filter.dutyType && !filter.dutyType.includes(record.dutyType)) {
                    return;
                }

                result[key].time += hours;

                if (isNight) {
                    result[key].nightShift += hours;
                } else {
                    result[key].dayShift += hours;
                }
            });

            //------------------------------------------------------
            // 教员
            //------------------------------------------------------

            if (isTeacher) {
                result.teacherTime.time += hours;

                if (isNight) {
                    result.teacherTime.nightShift += hours;
                } else {
                    result.teacherTime.dayShift += hours;
                }
            }

            //------------------------------------------------------
            // 见习
            //------------------------------------------------------

            if (isTrainee) {
                result.traineeTime.time += hours;

                if (isNight) {
                    result.traineeTime.nightShift += hours;
                } else {
                    result.traineeTime.dayShift += hours;
                }
            }

            //------------------------------------------------------
            // 月度席位统计
            // 教员、领班不计入席位时间
            //------------------------------------------------------

            if (!isTeacher && !isLeader) {
                result.positionTime.time += hours;

                if (isNight) {
                    result.positionTime.nightShift += hours;
                } else {
                    result.positionTime.dayShift += hours;
                }
            }
        }
    }

    //------------------------------------------------------
    // 保留两位小数
    //------------------------------------------------------

    Object.values(result).forEach((item) => {
        item.time = Number(item.time.toFixed(2));
        item.dayShift = Number(item.dayShift.toFixed(2));
        item.nightShift = Number(item.nightShift.toFixed(2));
    });

    return result;
}

module.exports = { calculateStatistics };
