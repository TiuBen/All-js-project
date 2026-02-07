module.exports = (app) => {
    const CompanyController = require('../controllers/company.controller');

    var router = require("express").Router();
   
    router.get("/company",CompanyController.getOne);
    router.put('/company/:id',CompanyController.updateOne);
    router.get("/companies",CompanyController.getAll);
    // router.post("/company",UserController.Login);

    app.use("/api/v2", router);
};
