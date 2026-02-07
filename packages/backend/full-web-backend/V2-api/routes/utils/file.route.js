module.exports = (app) => {
    const FileController = require('../controllers/file.controller');

    var router = require("express").Router();
    router.get("/file/:id", FileController.downloadFile);
    router.post("/file", FileController.uploadFile);


    app.use("/api/v2", router);
};
