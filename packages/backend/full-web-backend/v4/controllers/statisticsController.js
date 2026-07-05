const service = require("../services/statisticsService");
const dayjs = require("dayjs");

//! 当月夜班频次
//! 当月用户时长统计
//! 当月席位频次时长统计
//! 当月合规检查

exports.getDurationStatisticsByUser = (req, res, next) => {
    console.log(
        "Statistics Controller getDurationStatisticsByUser called with params:",
        req.params,
        "and query:",
        req.query
    );
    const { userId, year, month, startTime, endTime } = req.query;
    const dateStr = dayjs()
        .year(year)
        .month(month - 1)
        .date(1);
    const dateEnd = dateStr.add(1, "month");

    // 如果提供了 startTime 和 endTime，使用它们；否则使用默认时间
    inTime = startTime ? startTime : `${dateStr.format("YYYY-MM-DD")} 00:00:00`;
    outTime = endTime ? endTime : `${dateEnd.format("YYYY-MM-DD")} 00:00:01`;

    service
        .getDurationStatisticsByUserId({ userId, inTime, outTime })
        .then((result) => {
            res.send(result);
        })
        .catch(next);
};

exports.getNightCount = (req, res, next) => {
    const ALLOWED_COLUMNS = ["year", "month", "startTime", "endTime", "filter"];
    const { filter, year, month, startTime, endTime } = req.query;

    const invalidParams = Object.keys(req.query).filter((key) => !ALLOWED_COLUMNS.includes(key));

    if (invalidParams.length > 0) {
        return res.status(400).json({
            error: "查询参数错误,只允许: " + ALLOWED_COLUMNS.join(", "),
            invalidParams: invalidParams,
            allowedColumns: ALLOWED_COLUMNS,
        });
    }

    service
        .getNightCount(year, month)
        .then((result) => {
            res.send(result);
        })
        .catch(next);
};

exports.getCheckDurationStatisticsByUser = (req, res, next) => {
    console.log(
        "controller getCheckDurationStatisticsByUser called with \nparams:",
        req.params,
        "\nand \nquery:",
        req.query
    );
    const { userId, year, month } = req.query;

    service
        .checkDuration(userId, year, month)
        .then((result) => {
            res.send(result);
        })
        .catch(next);
};

exports.getPositionSummary = function (req, res, next) {
    console.log("controller getPositionSummary called with \nparams:", req.params, "\nand \nquery:", req.query);

    const { year, month } = req.query;
    service
        .getPositionSummary(year, month)
        .then((result) => {
            res.send(result);
        })
        .catch(next);
};

exports.getDurationStatisticsByUserV2 = function (req, res, next) {
    console.log(
        "controller getDurationStatisticsByUserV2222222222 called with \nparams:",
        req.params,
        "\nand \nquery:",
        req.query
    );

    const { userId, year, month, startTime, endTime } = req.query;
    console.log({
        year,
        month,
        typeofYear: typeof year,
        typeofMonth: typeof month,
    });

    const y = Number(year);
    const m = Number(month);

    const _startTime = startTime ?? dayjs().year(y).month(m).date(1).startOf("day").format("YYYY-MM-DD HH:mm:ss");

    const _endTime =
        endTime ??
        dayjs()
            .year(y)
            .month(m + 1)
            .date(1)
            .startOf("day")
            .add(1, "second")
            .format("YYYY-MM-DD HH:mm:ss");

    console.log("controller getDurationStatisticsByUserV2====" + _startTime + "  " + _endTime);

    service
        .getDurationStatisticsByUserIdV2(userId, _startTime, _endTime)
        .then((result) => {
            res.send(result);
        })
        .catch(next);
};
