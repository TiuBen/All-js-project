module.exports = (app) => {
  const FormController = require('../controllers/form.controller');

  var router = require("express").Router();
 
  router.get("/form",FormController.findOneByName);
  router.put('/form/:id',FormController.updateOne);
  router.post("/form",FormController.createOne);

  app.use("/api/v2", router);
};
