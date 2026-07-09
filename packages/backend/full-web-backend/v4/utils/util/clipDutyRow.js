const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
dayjs.extend(minMax);
const dayjs = require("dayjs");
function validateSplitters(splitters = []) {
    for (let i = 0; i < splitters.length; i++) {
        const current = splitters[i];

        const start = dayjs(current.start);
        const end = dayjs(current.end);

        if (!start.isValid() || !end.isValid()) {
            return {
                valid: false,
                error: `invalid time at index ${i}`,
            };
        }

        if (!start.isBefore(end)) {
            return {
                valid: false,
                error: `start must be before end at index ${i}`,
            };
        }

        // 检查下一段
        if (i < splitters.length - 1) {
            const next = splitters[i + 1];

            const nextStart = dayjs(next.start);
            const nextEnd = dayjs(next.end);

            if (!nextStart.isValid() || !nextEnd.isValid()) {
                return {
                    valid: false,
                    error: `invalid time at index ${i + 1}`,
                };
            }

            // 必须保证
            // 当前结束 <= 下一段开始
            if (end.isAfter(nextStart)) {
                return {
                    valid: false,
                    error: `splitter ${i} overlaps splitter ${i + 1}`,
                };
            }
        }
    }

    return {
        valid: true,
    };
}
function splitTimeSegment(segment, splitters = []) {
    // 先检测 splitters 之间是否有重叠
    if (hasOverlap(splitters)) {
        throw new Error("Splitters have overlapping time ranges");
    }
    // 按开始时间排序
    splitters = [...splitters].sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

    let segments = [
        {
            ...segment,
        },
    ];

    for (const splitter of splitters) {
        const next = [];

        const cutStart = dayjs(splitter.start);
        const cutEnd = dayjs(splitter.end);

        // if (!cutStart.isValid() || !cutEnd.isValid()) {
        //     continue;
        // }

        // if (!cutStart.isBefore(cutEnd)) {
        //     continue;
        // }

        for (const seg of segments) {
            const segStart = dayjs(seg.start);
            const segEnd = dayjs(seg.end);

            // 没有交集，不切
            if (cutEnd.isSameOrBefore(segStart) || cutStart.isSameOrAfter(segEnd)) {
                next.push(seg);
                continue;
            }

            // 左边
            if (cutStart.isAfter(segStart)) {
                next.push({
                    ...seg,
                    end: cutStart.format("YYYY-MM-DD HH:mm:ss"),
                });
            }

            // 中间（交集）
            next.push({
                ...splitter,
                start: dayjs.max(segStart, cutStart).format("YYYY-MM-DD HH:mm:ss"),
                end: dayjs.min(segEnd, cutEnd).format("YYYY-MM-DD HH:mm:ss"),
            });

            // 右边
            if (cutEnd.isBefore(segEnd)) {
                next.push({
                    ...seg,
                    start: cutEnd.format("YYYY-MM-DD HH:mm:ss"),
                });
            }
        }

        segments = next;
    }

    return segments;
}
