const { successResponse, errorResponse } = require("../utils/apiResponse");
const BaseController = require("./Base.Controller");
const CheckDurationService = require("../services/CheckDuration.Service");

const checkDurationServiceInstance = new CheckDurationService();

class CheckDurationController extends BaseController {
    constructor() {
        super(checkDurationServiceInstance);
        this.checkAll = this.checkAll.bind(this);
    }

    async checkAll(req, res, next) {
        try {
            const result = await this.service.checkAll();
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CheckDurationController();
