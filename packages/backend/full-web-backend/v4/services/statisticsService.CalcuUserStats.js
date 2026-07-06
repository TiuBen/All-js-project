const dayjs = require("dayjs");
const { queryDuty } = require("../utils/queryDuty");

async function calcUserByRule(year, month) {
    console.log("根据规则 计算 统计 数据", year, "month:", month);
    const dutyRows = await queryDuty({ inTime, outTime });
    console.log("查询结果:", dutyRows.length);
}

module.exports = { calcUserByRule };
