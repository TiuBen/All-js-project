const createBaseService = require("../services/baseService.js");
const { successResponse, errorResponse } = require("../utils/util/apiResponse.js");
const { UserDb } = require("../config/sqliteDb.js");

const service = createBaseService("base", UserDb);

exports.create = async (req, res, next) => {
    try {
        const data = req.body;
        const result = await service.create(data);
        successResponse(res, "Created successfully", result, 201);
    } catch (error) {
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const { ...filter } = req.query;
        const results = await service.findAll(filter);
        const total = await service.count(filter);

        successResponse(res, "Fetched successfully", {
            data: results,
            pagination: {},
        });
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await service.findById(id);
        if (!result) {
            return errorResponse(res, "Not found", 404);
        }
        successResponse(res, "Fetched successfully", result);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await service.update(id, data);
        if (!result) {
            return errorResponse(res, "Not found", 404);
        }
        successResponse(res, "Updated successfully", result);
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await service.delete(id);
        if (!result) {
            return errorResponse(res, "Not found", 404);
        }
        successResponse(res, "Deleted successfully");
    } catch (error) {
        next(error);
    }
};
