const express = require("express");
const router = express.Router();

const fileController = require("../controllers/fileController");

router.get("/exists", fileController.checkExcelStatus);
router.post("/regenerate", fileController.forceRegenerateExcel);
router.post("/download", fileController.downloadExcel);

module.exports = router;
