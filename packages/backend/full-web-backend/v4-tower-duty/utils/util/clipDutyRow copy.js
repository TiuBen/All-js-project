const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
const isBetween = require("dayjs/plugin/isBetween");

// ✅ 补充引入这两个插件
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");

// 统一扩展
dayjs.extend(isBetween);
dayjs.extend(minMax);
dayjs.extend(isSameOrBefore); // ✅ 扩展
dayjs.extend(isSameOrAfter); // ✅

function initDutyRowClips(dutyRow) {
    dutyRow.clips = [
        {
            inTime: dutyRow.inTime,
            outTime: dutyRow.outTime,

            tags: [],

            meta: {},
        },
    ];

    return dutyRow;
}
function roleTimesToSplitters(dutyRecord) {
    const { roleStartTime, roleEndTime } = dutyRecord;

    // 如果 roleStartTime 或 roleEndTime 为空或不是数组，返回空数组
    if (!Array.isArray(roleStartTime) || !Array.isArray(roleEndTime)) {
        return [];
    }

    const splitters = [];
    const length = Math.min(roleStartTime.length, roleEndTime.length);

    for (let i = 0; i < length; i++) {
        const start = roleStartTime[i];
        const end = roleEndTime[i];

        // 检查时间是否有效
        if (start && end) {
            splitters.push({
                start: start,
                end: end,
                tag: {
                    type: "教员",
                    teacherIndex: i,
                },
            });
        }
    }

    return splitters;
}

function validateSplitters(splitters = []) {
    let lastEnd = null;

    for (let i = 0; i < splitters.length; i++) {
        const current = splitters[i];
        const start = dayjs(current.start);
        const end = dayjs(current.end);

        // 1. 验证时间有效性
        if (!start.isValid() || !end.isValid()) {
            console.warn(`[validateSplitters] invalid time at index ${i}`);
            return false;
        }

        // 2. 验证当前段的开始必须在结束之前
        if (!start.isBefore(end)) {
            console.warn(`[validateSplitters] start must be before end at index ${i}`);
            return false;
        }

        // 3. 验证与上一段是否重叠
        if (lastEnd && start.isBefore(lastEnd)) {
            console.warn(`[validateSplitters] splitter ${i} overlaps with previous splitter`);
            return false;
        }

        lastEnd = end;
    }

    return true;
}
// 通用的切割
function splitTimeSegment(segment, splitters = []) {
    if (!splitters.length) {
        return [segment];
    }

    // 先检测 splitters 之间是否有重叠
    if (!validateSplitters(splitters)) {
        throw new Error("Splitters have overlapping time ranges");
    }
    // 按开始时间排序
    // splitters = [...splitters].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
    // console.log("splitters", splitters);

    // 强制变成 [] 形式
    let segments = [
        {
            ...segment,
        },
    ];
    // console.log("segments");

    // console.log(segments);
    let loopTime = 0;
    for (const splitter of splitters) {
        // console.log("splitter:\t" + loopTime);
        // console.log(splitter);
        const next = [];

        const cutStart = dayjs(splitter.start);
        const cutEnd = dayjs(splitter.end);

        for (const seg of segments) {
            // console.log("seg", seg);
            const segStart = dayjs(seg.start);
            const segEnd = dayjs(seg.end);

            // 没有交集，不切
            if (cutEnd.isSameOrBefore(segStart) || cutStart.isSameOrAfter(segEnd)) {
                // console.log("没有交集，不切");
                next.push(seg);
                continue;
            }

            // 左边
            if (cutStart.isAfter(segStart)) {
                // console.log("左边" + cutStart.format("YYYY-MM-DD HH:mm:ss") + "  " + segStart.format("YYYY-MM-DD HH:mm:ss"));

                next.push({
                    ...seg,
                    end: cutStart.format("YYYY-MM-DD HH:mm:ss"),
                    tags: [...(seg.tags ?? [])],
                });
            }

            // 中间（交集）
            next.push({
                ...seg,
                start: dayjs.max(segStart, cutStart).format("YYYY-MM-DD HH:mm:ss"),
                end: dayjs.min(segEnd, cutEnd).format("YYYY-MM-DD HH:mm:ss"),
                tags: [...(seg.tags ?? []), ...(splitter.tag ? [splitter.tag] : [])],
            });

            // 右边
            if (cutEnd.isBefore(segEnd)) {
                // console.log("右边");

                next.push({
                    ...seg,
                    start: cutEnd.format("YYYY-MM-DD HH:mm:ss"),
                    tags: [...(seg.tags ?? [])],
                });
            }
        }
        // console.log("next");

        // console.log(next);
        // console.log("\n\n");

        segments = next;
        loopTime++;
    }

    return segments;
}

// const NIGHT_SHIFT_RULES = [
//     {
//         name: "夜班段1",
//         startHour: 18,
//         startMinute: 0,
//         endHour: 21,
//         endMinute: 0,
//     },
//     {
//         name: "夜班段2",
//         startHour: 21,
//         startMinute: 0,
//         endHour: 24,
//         endMinute: 0,
//     },
//     {
//         name: "夜班段3",
//         startHour: 24,
//         startMinute: 0,
//         endHour: 8,
//         endMinute: 30,
//     },
// ];
const NIGHT_SHIFT_RULES = [
    {
        name: "管制夜班",
        startHour: 24,
        startMinute: 0,
        endHour: 8,
        endMinute: 0,
    },
];
// 生成 1800-2100 2100-2400 2400-0830的 切分
/**
 * 根据 dutyRow 生成每天固定的切割时间段
 * @param {Object} dutyRow
 * @param {Array} seed 规则数组
 */
function nightShiftSegmentMaker(dutyRow, seed = NIGHT_SHIFT_RULES) {
    const { inTime, outTime } = dutyRow;

    const startDay = dayjs(inTime).startOf("day").subtract(1, "day");
    const endDay = dayjs(outTime).startOf("day");

    const result = [];

    for (let day = startDay; !day.isAfter(endDay.add(1, "day")); day = day.add(1, "day")) {
        for (const rule of seed) {
            let start, end;

            // 开始时间
            if (rule.startHour === 24) {
                start = day.add(1, "day").startOf("day");
            } else {
                start = day.hour(rule.startHour).minute(rule.startMinute).second(0);
            }

            // 结束时间
            if (rule.endHour === 24) {
                end = day.add(1, "day").startOf("day");
            } else if (rule.endHour < rule.startHour || rule.startHour === 24) {
                // 跨天
                end = day.add(1, "day").hour(rule.endHour).minute(rule.endMinute).second(0);
            } else {
                end = day.hour(rule.endHour).minute(rule.endMinute).second(0);
            }
            // ===== 与 duty 是否有交集 =====
            // 无交集直接跳过
            if (end.isSameOrBefore(inTime) || start.isSameOrAfter(outTime)) {
                continue;
            }

            result.push({
                start: start.format("YYYY-MM-DD HH:mm:ss"),
                end: end.format("YYYY-MM-DD HH:mm:ss"),
                tag: {
                    type: "夜班",
                    role: `${day.format("MM-DD")}${rule.name}`,
                    belongDate: day.format("YYYY-MM-DD"),
                },
            });
        }
    }

    return result;
}

function FinalEditionDutyRowClip(dutyRow) {
    // 1. 将 dutyRow 转换为 splitTimeSegment 需要的标准格式
    const baseSegment = {
        // ...dutyRow,
        start: dutyRow.inTime,
        end: dutyRow.outTime,
    };
    // 2. 生成角色切割
    const roleSplitters = roleTimesToSplitters(dutyRow);
    // console.log("\n\n roleSplitters:||");
    // console.log(roleSplitters);
    // console.log("\n\n");
    const segmentsAfterRole = splitTimeSegment(baseSegment, roleSplitters);
    // console.log(segmentsAfterRole);

    // 3. 生成夜班切割
    const nightSplitters = nightShiftSegmentMaker(dutyRow);
    // console.log("nightSplitters:||");
    // console.log(nightSplitters);
    // console.log("nightSplitters:\n\n");

    // 第四步：第二次切割，在 Role 切割的基础上，继续对 Night 进行切割
    // 注意：这里传入的是已经切好的数组 segmentsAfterRole
    const finalSegments = segmentsAfterRole.flatMap((segment) => splitTimeSegment(segment, nightSplitters));
    // console.log("\n\n finalSegments:||");
    // console.dir(finalSegments, { depth: null });
    // console.log("\n\n");
    // 6. 返回结果
    return { ...dutyRow, segments: finalSegments };
    // return segmentsAfterRole;
}

module.exports = { FinalEditionDutyRowClip };
