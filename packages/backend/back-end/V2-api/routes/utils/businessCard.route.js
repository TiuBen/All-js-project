module.exports = (app) => {
    const BusinessCardController = require('../controllers/businessCard.controller');

    var router = require("express").Router();
   
    router.get("/businesscard",BusinessCardController.getAll);
    router.get("/businesscard/:id",BusinessCardController.getOne);
    router.put('/businesscard',BusinessCardController.updateOne);
    router.post("/businesscard",BusinessCardController.createOne);
    router.delete("/businesscard",BusinessCardController.deleteOne);

    app.use("/api/v2", router);
};
