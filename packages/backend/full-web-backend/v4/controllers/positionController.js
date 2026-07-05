const service = require("../services/positionService");

exports.getAll = async (req, res, next) => {
    console.log(" PositionController getAll");

    try {
        const query = req.query;
        const result = await service.getAll(query);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    console.log(" PositionController getById");

    try {
        const id = req.params.id;
        const result = await service.getById(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    console.log(" PositionController create");

    try {
        const data = req.body;
        const result = await service.create(data);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    console.log(" PositionController update");

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
    console.log(" PositionController delete");

    try {
        const id = req.params.id;
        const result = await service.delete(id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
