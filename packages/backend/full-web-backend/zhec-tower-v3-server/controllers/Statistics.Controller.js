const { successResponse, errorResponse } = require("../utils/apiResponse");
const BaseController = require("./Base.Controller");
const StatisticsService = require("../services/Statistics.Service");

const StatisticsServiceInstance = new StatisticsService();

class StatisticsController extends BaseController {
    constructor() {
        //console.log("StatisticsController");

        super(StatisticsServiceInstance);
        this.getAll = this.getAll.bind(this);
        this.getDurationStatisticsByUser = this.getDurationStatisticsByUser.bind(this);
        this.getNightShiftCountStatisticsByUser = this.getNightShiftCountStatisticsByUser.bind(this);
        // this.getTeachTimeStatisticsByUser = this.getTeachTimeStatisticsByUser.bind(this);
    }

    getAll(req, res, next) {
        //console.log("StatisticsController getAll");
        //console.log(req.query);

        this.service
            .getAll(req.query)
            .then((result) => {
                res.send(result);
            })
            .catch(next);
    }

    getDurationStatisticsByUser(req, res, next) {
        // console.log("StatisticsController getDurationStatisticsByUser");
        const {id} = req.params;
        this.service
            .getDurationStatisticsByUserId(id,req.query)
            .then((result) => {
                res.send(result);
            })
            .catch(next);
    }

    getNightShiftCountStatisticsByUser(req, res, next) {
        // console.log("StatisticsController getNightShiftStatisticsByUser");
        const {id} = req.params;
        this.service
            .getNightShiftCountStatisticsByUserId(id,req.query)
            .then((result) => {
                res.send(result);
            })
            .catch(next);
    }

    // getTeachTimeStatisticsByUser(req, res, next) {
    //     //console.log("StatisticsController getTeachTimeStatisticsByUser");
    //     this.service
    //         .getTeachTimeStatisticsByUser(req.params.id,req.query)
    //         .then((result) => {
    //             res.send(result);
    //         })
    //         .catch(next);
    // }
}

module.exports = new StatisticsController();
