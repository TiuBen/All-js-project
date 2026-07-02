const express = require("express");
const router = express.Router();

const { initSSE } = require("../utils/util/see");

router.get("/", initSSE);

module.exports = router;
