module.exports = (app) => {
    const QuotationController = require('../controllers/quotation.controller');

    var router = require("express").Router();
    router.get("/:company/quotation", QuotationController.findAll);
    router.post("/:company/quotation", QuotationController.createOne);


    app.use("/api/v2/erp", router);
};
