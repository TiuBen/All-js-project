const service = require("../services/userService");

exports.getAll = async (req, res, next) => {
    try {
        const { fields, groupBy, ...restQuery } = req.query;

        const options = {
            ...restQuery,
        };
        if (fields) {
            options.fields = fields.trim() !== "" ? fields.split(",").map((f) => f.trim()) : ["*"];
        } else {
            options.fields = ["*"];
        }

        if (groupBy && groupBy.trim() !== "") {
            options.groupBy = "order";
        }

        const result = await service.getAll(options);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await service.findById(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const data = req.body;
        const result = await service.create(data);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const result = await service.update(id, data);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await service.delete(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
