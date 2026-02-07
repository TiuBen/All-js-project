
    const FileController = require('../../controllers/file.controller');

    var router = require("express").Router();
    // router.get("/file/:id", FileController.downloadFile);
    // router.post("/file", FileController.uploadFile);

    router.get('/disk',FileController.getDir)

    // app.use("/api/v2", router);

    module.exports=router;
