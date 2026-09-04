const { calcNightCount } = require("../services/statisticsService.NightCount.js");
const { checkDuration } = require("../services/statisticsService.CheckDuration.js");
const { calcPositionSummary } = require("../services/statisticsService.PositionSummary.js");
const { calcUserByRule } = require("../services/statisticsService.CalcuUserStats.js");
const dayjs = require("dayjs");

function getStatisticsTimeRange(year, month, startTime = "00:00:00", endTime = "08:30:00") {
    const y = Number(year);
    const m = Number(month);

    return {
        inTime: dayjs().year(y).month(m).date(1).startOf("day").format("YYYY-MM-DD HH:mm:ss"),

        outTime: dayjs()
            .year(y)
            .month(m + 1)
            .date(1)
            .startOf("day")
            .add(1, "second")
            .format("YYYY-MM-DD HH:mm:ss"),
    };
}

//! 支持 year month
//! 当月夜班频次
exports.getNightCount = async (req, res, next) => {
    const ALLOWED_COLUMNS = ["year", "month", "userId", "username", "filter"];
    // 夜班应该是 01日的08:30:00 到 下一月 01日 08:30:00
    const { filter, year, month, startTime, endTime, userId } = req.query;

    const invalidParams = Object.keys(req.query).filter((key) => !ALLOWED_COLUMNS.includes(key));

    if (invalidParams.length > 0) {
        return res.status(400).json({
            error: "查询参数错误,只允许: " + ALLOWED_COLUMNS.join(", "),
            invalidParams: invalidParams,
            allowedColumns: ALLOWED_COLUMNS,
        });
    }

    try {
        //! 这里 不用那个函数了
        // 使用 await 异步等待结果
        //! 传入的month 是
        const start = dayjs().year(year).month(month).date(-1).hour(8).minute(30).second(0).millisecond(0);

        const end = start.add(1, "month").add(1, "day").hour(8).minute(30).second(0).millisecond(0);
        const inTime = start.format("YYYY-MM-DD HH:mm:ss");
        const outTime = end.format("YYYY-MM-DD HH:mm:ss");
        console.log("================== Controller GetNightCount ==", { year, month, inTime, outTime });
        const dutyRows = await queryDuty({ inTime, outTime, userId, username });

        const result = await calcNightCount(dutyRows);

        // 成功响应
        return res.send(result);
    } catch (error) {
        // 捕获到错误后，无缝丢给 Express 的错误处理中间件 (next)
        next(error);
    }
};

//! 当月合规检查
exports.getCheckDurationStatisticsByUser = async (req, res, next) => {
    // console.log(
    //     "Controller getCheckDurationStatisticsByUser called with \nparams:",
    //     req.params,
    //     "\nand \nquery:",
    //     req.query
    // );
    try {
        const { userId, year, month } = req.query;
        const { inTime, outTime } = getStatisticsTimeRange(year, month);

        // 修正：将转换后的数字 y 和 m 传给 Service
        const result = await checkDuration(userId, year, month, inTime, outTime);

        return res.send(result);
    } catch (error) {
        // 捕获异常，并抛给 Express 的错误中间件
        next(error);
    }
};

//! 当月席位频次时长统计
exports.getPositionSummary = async (req, res, next) => {
    // console.log("controller getPositionSummary called with \nparams:", req.params, "\nand \nquery:", req.query);

    try {
        const { year, month } = req.query;
        const result = await calcPositionSummary(year, month);

        return res.send(result);
    } catch (error) {
        // 捕获异常，并抛给 Express 的错误中间件
        next(error);
    }
};

//! 当月用户时长统计
exports.getDurationStatisticsByUserV2 = async (req, res, next) => {
    // console.log(
    //     "controller getDurationStatisticsByUserV2222222222 called with \nparams:",
    //     req.params,
    //     "\nand \nquery:",
    //     req.query
    // );
    const { filter, year, month, startTime, endTime, userId } = req.query;
    try {
        const { inTime, outTime } = getStatisticsTimeRange(year, month);

        // 使用 await 异步等待结果
        const result = await calcUserByRule({ year, month, inTime, outTime, userId });

        // 成功响应
        return res.send(result);
    } catch (error) {
        // 捕获到错误后，无缝丢给 Express 的错误处理中间件 (next)
        next(error);
    }

    return res.status(400).json({});

    // const { userId, year, month, startTime, endTime } = req.query;
    // console.log({
    //     year,
    //     month,
    //     typeofYear: typeof year,
    //     typeofMonth: typeof month,
    // });

    // const y = Number(year);
    // const m = Number(month);

    // const _startTime = startTime ?? dayjs().year(y).month(m).date(1).startOf("day").format("YYYY-MM-DD HH:mm:ss");

    // const _endTime =
    //     endTime ??
    //     dayjs()
    //         .year(y)
    //         .month(m + 1)
    //         .date(1)
    //         .startOf("day")
    //         .add(1, "second")
    //         .format("YYYY-MM-DD HH:mm:ss");

    // console.log("controller getDurationStatisticsByUserV2====" + _startTime + "  " + _endTime);

    // service
    //     .getDurationStatisticsByUserIdV2(userId, _startTime, _endTime)
    //     .then((result) => {
    //         res.send(result);
    //     })
    //     .catch(next);
};
