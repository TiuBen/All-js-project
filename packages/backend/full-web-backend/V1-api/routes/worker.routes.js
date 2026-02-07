module.exports = app => {
    const worker = require("../controllers/worker.controller.js");
  
    var router = require("express").Router();
  
    // Create a new worker
    router.post("/", worker.create);
  
    // Retrieve all worker
    router.get("/", worker.findAll);
  
    // Retrieve a single worker with id
    router.get("/:id", worker.findOne);
  
    // Update a worker with id
    router.put("/:id", worker.update);
  
    // Delete a worker with id
    router.delete("/:id", worker.delete);
  
    // Delete all worker
    router.delete("/", worker.deleteAll);
  
    app.use('/worker', router);
  };
  