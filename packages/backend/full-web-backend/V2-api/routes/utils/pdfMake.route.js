module.exports=(app)=>{
    const pdfMakeController=require('../controllers/pdfMake.controller');
    var router=require("express").Router();
    router.get('/idcard',pdfMakeController.getPdf);


    app.use("/api/v2",router);
}