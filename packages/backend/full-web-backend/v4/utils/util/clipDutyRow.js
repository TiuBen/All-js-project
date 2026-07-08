const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
dayjs.extend(minMax);
const dayjs = require("dayjs");

function splitTimeSegment(segment, splitters = []) {
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

        if (!cutStart.isValid() || !cutEnd.isValid()) {
            continue;
        }

        if (!cutStart.isBefore(cutEnd)) {
            continue;
        }

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
