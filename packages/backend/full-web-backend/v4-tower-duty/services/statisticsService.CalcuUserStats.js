const dayjs = require("dayjs");
const { queryDuty } = require("../utils/queryDuty");
const { calculateStatistics } = require("../utils/util/sumDutyRow");
const { FinalEditionDutyRowClip } = require("../utils/util/clipDutyRow");

async function calcUserByRule({ year, month, inTime, outTime, userId }) {
    // console.log("根据规则 计算 统计 数据", year, "month:", month);
    const dutyRows = await queryDuty({ inTime, outTime, userId });

    // console.log("查询结果:", dutyRows.length);
    // console.log(dutyRows);
    if (dutyRows.length > 0) {
        // console.log("开始计算");
        const ddd = dutyRows.flatMap((x) => FinalEditionDutyRowClip(x));
        return calculateStatistics(ddd);
    }

    return [];
}

module.exports = { calcUserByRule };
