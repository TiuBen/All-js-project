const express = require("express");
const router = express.Router();

const authRoute = require("./routes/auth.route");
const dutyRoute = require("./routes/duty.route");
const positionRoute = require("./routes/position.route");
const statisticsRoute = require("./routes/statistics.route");
const userRoute = require("./routes/user.route");
const uploadRoute = require("./routes/upload.route");

router.use("/auth", authRoute);
router.use("/users", userRoute);
router.use("/statistics", statisticsRoute);
router.use("/duty", dutyRoute);
router.use("/positions", positionRoute);
router.use("/file", uploadRoute);

module.exports = router;
