function wsTriggerMiddle(req, res) {
    //
    // 从数据库里 findAll
    const data = [];
    console.log("wsTriggerMiddle");
    // const io=this;
    console.log(req.app.ws);
    // req.app.getWss("/",)
    // req.app.io.emit("message", res.locals); // *
    // req.app.io.broadcast("message", res.locals); // *
}

const CheckInController = require("../../controllers/checkIn.controller");

var router = require("express").Router();

router.put("/checkin", CheckInController.updateOne);
router.post("/checkin", CheckInController.createOne);
router.get("/checkin", CheckInController.getOne);
router.get("/checkins", CheckInController.getAllByUser);

module.exports = router;
