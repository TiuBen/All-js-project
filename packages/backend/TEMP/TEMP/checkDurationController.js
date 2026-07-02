const service = require("../services/checkDurationV3Service");

exports.checkAll = async (req, res, next) => {
    console.log("CheckDurationController");
    try {
        const { userId, year, month } = req.query;

        console.log(req.query);

        const result = await service.check(userId, year, month);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};
