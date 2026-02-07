const express = require("express");
const router=express.Router();

const {GetQuestion,PutToModifyQuestion}=require("../controller/atcLicenseExam.controller");

router.get("/",GetQuestion);
router.put("/",PutToModifyQuestion);

module.exports=router;