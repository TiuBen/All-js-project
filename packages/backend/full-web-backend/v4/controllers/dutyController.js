const { successResponse, errorResponse } = require("../utils/util/apiResponse");
const service = require("../services/dutyService");
const hrDutySummaryService = require("../services/hrDutySummaryService");
const { sendEvent } = require("../utils/util/see.js");
const { normalizeDutyQuery } = require("../utils/index.js");

exports.getByQuery = async (req, res, next) => {
    console.log(" DutyController getByQuery");

    try {
        // 从 query 或 params 取 id（兼容两种方式）
        const query = normalizeDutyQuery(req);
        console.log(" DutyController getByQuery query:" + JSON.stringify(query));

        const result = await service.getByQuery(query);
        if (!result) {
            return errorResponse(res, "Not found", 404);
        }
        res.send(result);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    console.log(" DutyController update");

    try {
        const id = req.params.id;
        const data = req.body;

        const result = await service.update(id, data);

        if (!result) {
            return errorResponse(res, "Not found", 404);
        }
        sendEvent("dutyUpdated", result);
        successResponse(res, "Updated successfully", result);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    console.log(" DutyController create");

    try {
        const data = req.body;
        console.log(data);
        const result = await service.create(data);
        if (!result) {
            res.status(500).json({ error: "DutyController create error" });
        }
        sendEvent("dutyUpdated", result);

        res.status(201).send(result);
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    console.log(" DutyController delete");

    try {
        const id = req.params.id;
        const result = await service.delete(id);
        if (!result) {
            return errorResponse(res, "Not found", 404);
        }
        sendEvent("dutyUpdated", result);
        successResponse(res, "Deleted successfully", result);
    } catch (error) {
        next(error);
    }
};

// ==========================================
// hr_duty_summary 考勤汇总 CRUD
// ==========================================

/**
 * 查询考勤汇总记录
 * 支持按 userId, username, startDate, endDate, duty_date 查询
 */
exports.hrDutyGetByQuery = async (req, res, next) => {
    console.log(" DutyController hrDutyGetByQuery");

    try {
        const query = req.query;
        const result = await hrDutySummaryService.getByQuery(query);
        successResponse(res, "Query success", result);
    } catch (error) {
        next(error);
    }
};

/**
 * 根据ID查询单条考勤汇总记录
 */
exports.hrDutyGetById = async (req, res, next) => {
    console.log(" DutyController hrDutyGetById");

    try {
        const { id } = req.params;
        const result = await hrDutySummaryService.getById(id);
        if (!result) {
            return errorResponse(res, "Not found", 404);
        }
        successResponse(res, "Query success", result);
    } catch (error) {
        next(error);
    }
};

/**
 * 创建考勤汇总记录
 * 必填字段: userId, duty_date
 * 可选字段: username, value
 */
exports.hrDutyCreate = async (req, res, next) => {
    console.log(" DutyController hrDutyCreate");

    try {
        const data = req.body;

        // 校验必填字段
        if (!data.userId || !data.duty_date) {
            return errorResponse(res, "userId and duty_date are required", 400);
        }

        const result = await hrDutySummaryService.create(data);
        sendEvent("hrDutyUpdated", result);
        res.status(201).send(result);
    } catch (error) {
        // 处理唯一约束冲突
        if (error.message && error.message.includes("UNIQUE constraint")) {
            return errorResponse(res, "该用户该日期已有记录，请使用更新接口", 409);
        }
        next(error);
    }
};

/**
 * 批量创建/更新考勤汇总记录
 * 使用 INSERT OR REPLACE 实现 upsert
 * 请求体: { records: [{ userId, duty_date, username, value }, ...] }
 */
exports.hrDutyBatchCreate = async (req, res, next) => {
    console.log(" DutyController hrDutyBatchCreate");

    try {
        const { records } = req.body;

        if (!Array.isArray(records) || records.length === 0) {
            return errorResponse(res, "records array is required", 400);
        }

        // 校验每条记录
        for (const record of records) {
            if (!record.userId || !record.duty_date) {
                return errorResponse(res, "Each record must have userId and duty_date", 400);
            }
        }

        const result = await hrDutySummaryService.batchCreate(records);
        sendEvent("hrDutyUpdated", result);
        res.status(201).send(result);
    } catch (error) {
        next(error);
    }
};

/**
 * 更新考勤汇总记录
 * 可更新字段: userId, username, duty_date, value
 */
exports.hrDutyUpdate = async (req, res, next) => {
    console.log(" DutyController hrDutyUpdate");

    try {
        const { id } = req.params;
        const data = req.body;

        // 检查记录是否存在
        const existing = await hrDutySummaryService.getById(id);
        if (!existing) {
            return errorResponse(res, "Not found", 404);
        }

        const result = await hrDutySummaryService.update(id, data);
        sendEvent("hrDutyUpdated", result);
        successResponse(res, "Updated successfully", result);
    } catch (error) {
        next(error);
    }
};

/**
 * 删除考勤汇总记录
 */
exports.hrDutyDelete = async (req, res, next) => {
    console.log(" DutyController hrDutyDelete");

    try {
        const { id } = req.params;

        // 检查记录是否存在
        const existing = await hrDutySummaryService.getById(id);
        if (!existing) {
            return errorResponse(res, "Not found", 404);
        }

        const result = await hrDutySummaryService.delete(id);
        sendEvent("hrDutyUpdated", result);
        successResponse(res, "Deleted successfully", result);
    } catch (error) {
        next(error);
    }
};
