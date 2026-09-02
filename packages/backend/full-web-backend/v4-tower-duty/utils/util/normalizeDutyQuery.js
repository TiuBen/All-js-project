const dayjs = require("dayjs");

const ALLOWED_COLUMNS = [
    "id",
    "userId",
    "username",
    "position",
    "dutyType",
    "inTime",
    "outTime",
    "roleType",
    "relatedDutyTableRowId",
    "roleStartTime",
    "roleEndTime",
    "roleTimes",
    "status",
    "relatedPrepareTableId",

    // 统计相关
    "year",
    "month",
    "filter",
    "startDate",
    "startTime",
    "endDate",
    "endTime",
];

function normalizeDutyQuery(req) {
    const query = {};

    // query + params 合并
    const source = {
        ...req.query,
        ...req.params,
    };

    // 只保留允许查询的字段
    for (const key of ALLOWED_COLUMNS) {
        if (source[key] !== undefined && source[key] !== "") {
            query[key] = source[key];
        }
    }

    // id 优先 params
    if (req.params.id != null) {
        query.id = req.params.id;
    }
    // year + month -> inTime/outTime
    if (source.year != null && source.month != null) {
        const year = Number(source.year);
        const month = Number(source.month);

        query.inTime = dayjs().year(year).month(month).date(1).startOf("day").format("YYYY-MM-DD HH:mm:ss");

        query.outTime = dayjs()
            .year(year)
            .month(month + 1)
            .date(1)
            .startOf("day")
            .add(1, "second")
            .format("YYYY-MM-DD HH:mm:ss");
    }

    // startDate + startTime + endDate + endTime
    if (source.startDate && source.startTime && source.endDate && source.endTime) {
        query.inTime = `${source.startDate} ${source.startTime}`;
        query.outTime = `${source.endDate} ${source.endTime}`;
    }

    // 直接传 inTime/outTime 优先级最高
    if (source.inTime) {
        query.inTime = source.inTime;
    }

    if (source.outTime) {
        query.outTime = source.outTime;
    }

    return query;
}

module.exports = {
    normalizeDutyQuery,
};
