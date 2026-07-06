const { successResponse, errorResponse } = require("../utils/util/apiResponse");
const service = require("../services/dutyService");
const { sendEvent } = require("../utils/util/see.js");

exports.getByQuery = async (req, res, next) => {
    console.log(" DutyController getByQuery");

    try {
        // 从 query 或 params 取 id（兼容两种方式）
        const id = req.query.id || req.params.id;
        let query = req.query;
        if (id) {
            query = { ...query, id };
        }
        if (req.query.startDate && req.query.startTime && req.query.endDate && req.query.endTime) {
            query = {
                ...query,
                inTime: `${req.query.startDate} ${req.query.startTime}`,
                outTime: `${req.query.endDate} ${req.query.endTime}`,
            };
        }

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
