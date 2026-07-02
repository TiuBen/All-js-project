const { successResponse, errorResponse } = require("./util/apiResponse");
const cache = require("./util/cache");
const { calDuration, calculateTimeInDailyRange, calDurationV2, calDurationV3 } = require("./util/calculateDuration");
const { calculateNightShiftCount, calculateMonthlyNightShiftCount } = require("./util/calculateNightShiftCount");
const { calculateNightShifts } = require("./util/calculateNightShifts");
const { checkRule } = require("./util/checkV3");
const { exportAsExcel } = require("./util/exportAsExcel");
const { formateDecimal } = require("./util/formateDecimal");
const { fromDutyDbGetData, useDutyDataGetRelatedTeachData } = require("./util/fromDutyDbGetData");
const JWTUtil = require("./util/jwt");
const { generateCRUDRoutes } = require("./util/routeGenerator");
const { initSSE, sendEvent, startHeartbeat } = require("./util/see");
const { normalizeValue, normalizeRow } = require("./util/sqliteSaveReadArrayTools");

module.exports = {
    successResponse,
    errorResponse,
    cache,
    calDuration,
    calculateTimeInDailyRange,
    calDurationV2,
    calDurationV3,
    calculateNightShiftCount,
    calculateMonthlyNightShiftCount,
    calculateNightShifts,
    checkRule,
    exportAsExcel,
    formateDecimal,
    fromDutyDbGetData,
    useDutyDataGetRelatedTeachData,
    JWTUtil,
    generateCRUDRoutes,
    initSSE,
    sendEvent,
    startHeartbeat,
    normalizeValue,
    normalizeRow,
};
