const express = require("express");
const router = express.Router();
const { exportAsExcel } = require("../utils/util/exportAsExcel");

router.get("/", async (req, res) => {
    try {
        console.log("download-excel");
        const { startDate, startTime, endDate, endTime } = req.query;

        const filePath = await exportAsExcel(startDate, startTime, endDate, endTime);
        res.download(filePath, "小时数统计.xlsx", (err) => {
            if (err) {
                console.error("File send error:", err);
                res.status(500).send("Error sending file");
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating Excel");
    }
});

module.exports = router;
