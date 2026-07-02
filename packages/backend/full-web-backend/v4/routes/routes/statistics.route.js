const express = require("express");
const router = express.Router();

const statisticsController = require("../../controllers/statisticsController");

router.get("/night-count", statisticsController.getNightCount);
router.get("/duty-duration", statisticsController.getDurationStatisticsByUser);
router.get("/check-duration", statisticsController.getDurationStatisticsByUser);

module.exports = router;
