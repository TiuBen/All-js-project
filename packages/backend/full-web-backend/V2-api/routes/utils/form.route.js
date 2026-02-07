const Upload = require("../utils/SaveFile").Upload;

// module.exports = (app) => {
//     app.post(
//         "/api/v2/form",
//         SaveFile.fields([
//             { name: "file1", maxCount: 1 },
//             { name: "avatar", maxCount: 1 },
//             { name: "attachment", maxCount: 3 },
//         ]),
//         function (req, res, next) {
//             // req.body contains the text fields
//             console.log(req.body);
//             console.log(req.files);
//             // console.log(req.files["avatar"][0]);
//         }
//     );
// };

module.exports = (app) => {
    const FormController = require('../controllers/form.controller');

    console.log("Router From");
    var router = require("express").Router();
    // router.post("/form/:", FormController.createOneFormData);
    // router.post("/file", FileController.uploadFile);

    // @STEP 一部分是处理 Form模版
    router.get("/forms/type=:type",(req,res)=>{console.log(req.params);})
    router.post("/forms",(req,res)=>{console.log("Formsssssss");})
    router.put("/forms")
    router.delete("/forms/id=?id")

    // @STEP 一部分是处理 Form数据
    router.get("/forms",FormController.findOneFormData)
    router.post("/form",Upload,FormController.createOneFormData)
    router.put("/form")
    router.delete("/form/id=?id")



    app.use("/api/v2", router);
};
