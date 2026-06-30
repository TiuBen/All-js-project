const { successResponse, errorResponse } = require("../utils/apiResponse");
const BaseController = require("./Base.Controller");
const CheckDurationV3Service = require("../services/CheckDurationV3.Service");

const checkDurationV3ServiceInstance = new CheckDurationV3Service();

class CheckDurationController extends BaseController {
    constructor() {
        super(checkDurationV3ServiceInstance);
        this.checkAll = this.checkAll.bind(this);
    }

    async checkAll(req, res, next) {
        console.log("CheckDurationController");
        try {
            const { userId, year, month } = req.query;

            console.log(req.query);

            const result = await checkDurationV3ServiceInstance.check(userId, year, month);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CheckDurationController();
