const express = require("express");
const router = express.Router();

const {PostPrepareForTheJobs,GetPrepareForTheJobs,PutToModifyPrepare}= require("../controller/prepare.controller.js");

router.post("/", PostPrepareForTheJobs);
router.get("/", GetPrepareForTheJobs);
router.put("/", PutToModifyPrepare);



module.exports = router;