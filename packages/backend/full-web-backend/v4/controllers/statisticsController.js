const service = require("../services/statisticsService");
const dayjs = require("dayjs");

exports.getDurationStatisticsByUser = (req, res, next) => {
    console.log("controller getDurationStatisticsByUser called with params:", req.params, "and query:", req.query);
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
    // let inTime, outTime;

    // // 检查 startTime 是否符合 YYYY-MM-DD HH:mm:ss 格式
    // if (startTime) {
    //     const isValid = dayjs(startTime, "YYYY-MM-DD HH:mm:ss", true).isValid();
    //     if (!isValid) {
    //         return res.status(400).json({
    //             error: "startTime 格式错误，必须为 YYYY-MM-DD HH:mm:ss",
    //             received: startTime,
    //         });
    //     }
    //     inTime = startTime;
    // }

    // // 检查 endTime 是否符合 YYYY-MM-DD HH:mm:ss 格式
    // if (endTime) {
    //     const isValid = dayjs(endTime, "YYYY-MM-DD HH:mm:ss", true).isValid();
    //     if (!isValid) {
    //         return res.status(400).json({
    //             error: "endTime 格式错误，必须为 YYYY-MM-DD HH:mm:ss",
    //             received: endTime,
    //         });
    //     }
    //     outTime = endTime;
    // }

    // // 根据参数构建 inTime 和 outTime

    // if (year && month) {
    //     // 如果有年月日，构建完整的日期时间
    //     const dateStr = dayjs()
    //         .year(year)
    //         .month(month - 1)
    //         .date(1);
    //     const dateEnd = dateStr.add(1, "month");

    //     // 如果提供了 startTime 和 endTime，使用它们；否则使用默认时间
    //     inTime = startTime ? startTime : `${dateStr.format("YYYY-MM-DD")} 00:00:00`;
    //     outTime = endTime ? endTime : `${dateEnd.format("YYYY-MM-DD")} 00:00:01`;
    // } else {
    //     // 如果没有年月日，检查是否直接提供了 inTime 和 outTime
    //     if (!req.query.startTime || !req.query.endTime) {
    //         return res.status(400).json({
    //             error: "查询参数错误,必须包含 year, month 或 inTime, outTime",
    //         });
    //     }
    //     inTime = req.query.startTime;
    //     outTime = req.query.endTime;
    // }

    // if (!inTime || !outTime) {
    //     return res.status(400).json({
    //         error: "查询参数错误",
    //     });
    // }

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
