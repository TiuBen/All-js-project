const express = require("express");
const router = express.Router();

const statisticsController = require("../../controllers/statisticsController");

router.get("/night-count", statisticsController.getNightCount);
router.get("/duty-duration", statisticsController.getDurationStatisticsByUserV2);
router.get("/position-summary", statisticsController.getPositionSummary);
router.get("/check-duration", statisticsController.getCheckDurationStatisticsByUser);

module.exports = router;
