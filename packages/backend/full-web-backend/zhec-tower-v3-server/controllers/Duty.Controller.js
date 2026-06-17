const { successResponse, errorResponse } = require("../utils/apiResponse");
const BaseController = require("./Base.Controller");
const DutyService = require("../services/Duty.Service.js");
const { sendEvent } = require("../utils/see.js");


const DutyServiceInstance = new DutyService();

class DutyController extends BaseController {
    constructor() {
        //console.log("DutyController");

        super(DutyServiceInstance);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.create = this.create.bind(this);
        this.delete = this.delete.bind(this);

    }

    getAll(req,res,next) {
        // //console.log("DutyController getAll");
        // //console.log(req.query);
        
        const userId=req.params.id;
        const query=req.query;
        const needCalculate=query.calculate;

        this.service
            .getAll(query,needCalculate)
            .then((result) => {
                if (!result) {
                    return errorResponse(res, "Not found", 404);
                }
                res.send(result);
            })
            .catch(next);
    }

    async getById(req, res, next) {
        //console.log(" DutyController getById");

        try {
            const id = req.params.id;
            //console.log(" DutyController getById id:" + id);

            const result = await this.service.findById(id);
            if (!result) {
                return errorResponse(res, "Not found", 404);
            }
            res.send(result);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        //console.log("DutyController update");
        //console.log(req.params);
        //console.log(req.body);
        try {
            const id = req.params.id;
            //console.log(req.body);
            const data = req.body;
            
            const result = await this.service.update(id, data);
            // //console.log(result);
            
            if (!result) {
                return errorResponse(res, "Not found", 404);
            }
            sendEvent("dutyUpdated",result);
            successResponse(res, "Updated successfully", result);
        } catch (error) {
            next(error);
        }
    }

    // async getUserDutyStatistics(req,res,next){
    //     //console.log(" DutyController getUserDutyStatistics");
    //     const query=req.query;
    //     this.service
    //     .getAll(query)
    //     .then((result) => {
    //         res.locals.data=result;
    //         next();
    //         // res.json(result);
    //     })
    //     .catch(next);

    // }

    async create(req, res, next) {
        console.log(" DutyController create");

        //
        try {
            const data = req.body;
            console.log(data);
            const result = await this.service.create(data);
            //console.log(result);
            if (!result) {
                res.status(500).json({ error: "DutyController create error" });
            }
            sendEvent("dutyUpdated",result);

            res.status(201).send(result);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        console.log(" DutyController delete");

        try {
            const id = req.params.id;
            const result = await this.service.delete(id);
            if (!result) {
                return errorResponse(res, "Not found", 404);
            }
            sendEvent("dutyUpdated",result);
            successResponse(res, "Deleted successfully", result);
        }catch (error) {
            next(error);
        }
    }

}

module.exports =  DutyController;
