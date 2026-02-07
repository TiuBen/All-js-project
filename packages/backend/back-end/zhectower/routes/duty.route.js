const express = require("express");
const router = express.Router();

const {GetWhoIsOnDuty,PostToTakeOverDuty,NoPrepareTableCheckPostToTakeOverDuty,PutToOutDuty}= require("../controller/duty.controller.js");

router.get("/", GetWhoIsOnDuty);
// router.post("/", PostToTakeOverDuty)
router.post("/", NoPrepareTableCheckPostToTakeOverDuty);
router.put("/",PutToOutDuty)

module.exports = router;