const dayjs = require("dayjs");
const minMax = require("dayjs/plugin/minMax");
dayjs.extend(minMax);
function clipDutyRow(row, { inTime, outTime }) {
    if (!row) return row;

    const result = { ...row };

    const originalStart = dayjs(row.inTime);
    const originalEnd = dayjs(row.outTime);

    let clipStart = originalStart;
    let clipEnd = originalEnd;

    let before = 0;
    let after = 0;

    if (inTime) {
        const queryStart = dayjs(inTime);

        if (queryStart.isAfter(originalStart)) {
            before = parseFloat(queryStart.diff(originalStart, "hour", true).toFixed(2));
            clipStart = queryStart;
        }
    }

    if (outTime) {
        const queryEnd = dayjs(outTime);

        if (queryEnd.isBefore(originalEnd)) {
            after = parseFloat(originalEnd.diff(queryEnd, "hour", true).toFixed(2));
            clipEnd = queryEnd;
        }
    }

    result.clip = {
        enabled: before > 0 || after > 0,
        startTime: clipStart.format("YYYY-MM-DD HH:mm:ss"),
        endTime: clipEnd.format("YYYY-MM-DD HH:mm:ss"),
        before,
        after,
    };

    return result;
}

module.exports = { clipDutyRow };
