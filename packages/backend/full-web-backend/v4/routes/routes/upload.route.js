const express = require("express");
const router = express.Router();
const { uploadFile, checkExcelExists, getDutyRowsController } = require("../../controllers/uploadController");

router.post("/", uploadFile);
router.get("/check-excel", checkExcelExists);
router.get("/duty-rows", getDutyRowsController);

module.exports = router;
