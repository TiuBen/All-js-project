const express = require("express");
const router = express.Router();

const checkDurationController = require("../controllers/checkDurationController");

router.get("/", checkDurationController.checkAll);

module.exports = router;
