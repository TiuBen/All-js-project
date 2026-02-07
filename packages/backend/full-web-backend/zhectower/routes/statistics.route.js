const express = require("express");
const router = express.Router();

const {GetStatistics}= require("../controller/statisticsV2.controller.js");

router.get("/", GetStatistics);

module.exports = router;

