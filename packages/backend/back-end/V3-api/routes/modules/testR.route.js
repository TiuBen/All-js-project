console.log("Router TEST");
var routerTest = require("express").Router();

routerTest.get("/test", (req, res) => {
    console.log("dfasdfasdfas");
    console.log(req.params);
});
routerTest.post("/test", (req, res) => {
    console.log("Formsssssss");
});
routerTest.put("/test");
routerTest.delete("/test");

module.exports= routerTest;
