const { calculateMonthlyNightShiftCount } = require("./util/calculateNightCount");
const { calDurationV3 } = require("./util/calculateDuration");
const { fromDutyDbGetData } = require("./util/fromDutyDbGetData");

module.exports = {
    calculateMonthlyNightShiftCount,
    calDurationV3,
    fromDutyDbGetData,
};
