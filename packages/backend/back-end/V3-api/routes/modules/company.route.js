    const CompanyController = require('../../controllers/company.controller');

    var router = require("express").Router();
   
    // router.get("/company",CompanyController.getOne);
    // router.put('/company/:id',CompanyController.updateOne);
    router.get("/company",CompanyController.getAll);
    // router.post("/company",UserController.Login);


    module.exports=router;