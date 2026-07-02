const { successResponse, errorResponse } = require("../utils/apiResponse.js");
const BaseService = require("../services/Base.Service.js");

const BaseServiceInstance=new BaseService();

class BaseController {
    constructor(service) {
        console.log("BaseController");
        console.log("================service");
        if (!service) {
            throw new Error("Service instance must be provided");
        }
        this.service = service;
        // this.service = BaseServiceInstance;
        // 绑定所有方法到当前实例
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        // console.log(this.service);
        // console.log("================service");
    }

    async create(req, res, next) {
        try {
            const data = req.body;
            const result = await this.service.create(data);
            successResponse(res, "Created successfully", result, 201);
        } catch (error) {
            next(error);
        }
    }

    async getAll(req, res, next) {
        try {
            // const { page = 1, limit = 10, ...filter } = req.query;
            // const skip = (page - 1) * limit;
            // const results = await this.service.findAll(filter, { skip, limit });
            const { ...filter } = req.query;
            const results = await this.service.findAll(filter);
            const total = await this.service.count(filter);

            successResponse(res, "Fetched successfully", {
                data: results,
                pagination: {
                    // page: Number(page),
                    // limit: Number(limit),
                    // total,
                    // pages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        console.log(" BaseController getById");

        try {
            const id = req.params.id;
            console.log(" BaseController getById id:" + id);

            const result = await BaseServiceInstance.findById(id);
            if (!result) {
                return errorResponse(res, "Not found", 404);
            }
            successResponse(res, "Fetched successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const id = req.params.id;
            const data = req.body;
            const result = await this.service.update(id, data);
            if (!result) {
                return errorResponse(res, "Not found", 404);
            }
            successResponse(res, "Updated successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const id = req.params.id;
            const result = await this.service.delete(id);
            if (!result) {
                return errorResponse(res, "Not found", 404);
            }
            successResponse(res, "Deleted successfully");
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BaseController;
