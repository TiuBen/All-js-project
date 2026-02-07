// function test(req, res) {
//     console.log(req);
//     res.send({ dddddd: "tsadfgasfdas" });
// }

module.exports = (app) => {
    // const files = require("../controllers/files.controller");

    var router = require("express").Router();

    // // Create a new worker
    // router.post("/", files.uploadAvatar, function (req, res) {
    //     console.log(req.file, req.body);
    //     res.send({"uploadAvatar":"uploadAvatar"});
    // });
    // router.get("/", test);

    // Retrieve all worker
    // router.get("/files", worker.findAll);

    // Retrieve a single worker with id
    // router.get("/files/[filename]", worker.findOne);

    // // Update a worker with id
    // router.put("/:id", worker.update);

    // // Delete a worker with id
    // router.delete("/:id", worker.delete);

    // // Delete all worker
    // router.delete("/", worker.deleteAll);

    app.use("/upload", router);
};
