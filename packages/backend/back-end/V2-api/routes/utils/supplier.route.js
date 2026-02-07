module.exports = (app) => {
    const SupplierController = require("../controllers/supplier.controller");

    var router = require("express").Router();
    router.get("/:company/supplier", SupplierController.findAll);
    // router.get("/:company/supplier/test", SupplierController.TESTCONNECTION);
    router.post("/:company/supplier", SupplierController.createOne);

    // // Retrieve a single worker with id
    // router.get("/:id", worker.findOne);

    // // Update a worker with id
    // router.put("/:id", worker.update);

    // // Delete a worker with id
    // router.delete("/:id", worker.delete);

    // // Delete all worker
    // router.delete("/", worker.deleteAll);

    // app.use("/api/v2/erp/:company/supplier", router);
    app.use("/api/v2/erp", router);
};
