const BusinessCardController = require("../../controllers/businessCard.controller");
var router = require("express").Router();


const Upload=require("../../utils/SaveFile").Upload;

router.get("/businesscard", BusinessCardController.getAll);
router.get("/businesscard/:id", BusinessCardController.getOne);
router.put("/businesscard", BusinessCardController.updateOne);
router.post("/businesscard",Upload,BusinessCardController.createOne);
router.delete("/businesscard", BusinessCardController.deleteOne);


module.exports=router;