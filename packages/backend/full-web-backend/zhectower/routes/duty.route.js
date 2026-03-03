const express = require("express");
const router = express.Router();

const {
    GetWhoIsOnDuty,
    PostToTakeOverDuty,
    NoPrepareTableCheckPostToTakeOverDuty,
    PutToOutDuty,
    DutyController,
} = require("../controller/duty.controller.js");

router.get("/duty", GetWhoIsOnDuty);
// router.post("/", PostToTakeOverDuty)
router.post("/duty", NoPrepareTableCheckPostToTakeOverDuty);
router.put("/duty/:id", DutyController.PutUser);

module.exports = router;
