const express = require("express");
const { generateCRUDRoutes } = require("../utils/routeGenerator");

const router = express.Router();
const cacheMiddleware = require("../middlewares/cacheMiddleware");

// User 部分

// 2. 初始化控制器
const userController = require("../controllers/userController");

//  login logout refreshTOKEN
const authController = require("../controllers/authController");
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);

const logController = require("../controllers/logController");
router.get("/log", logController.getAll);

const { authenticateToken, optionalAuth, requireAdmin } = require("../middlewares/auth");

//#region 关于user部分的Router
const statisticsController = require("../controllers/statisticsController");
router.get("/users/:id/nightCount", statisticsController.getNightShiftCountStatisticsByUser);

// 夜班段数查询接口
const { calculateNightShiftCount, calculateMonthlyNightShiftCount } = require("../utils/calculateNightShiftCount");
router.get("/night-count/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { date } = req.query;

        if (!userId || !date) {
            return res.status(400).json({
                success: false,
                message: "缺少必要参数: userId 和 date",
            });
        }

        const result = await calculateNightShiftCount(userId, date);
        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("查询夜班段数失败:", error);
        res.status(500).json({
            success: false,
            message: "查询夜班段数失败",
            error: error.message,
        });
    }
});
// router.get("/users/:id/teachStatistics", statisticsController.getTeachTimeStatisticsByUser);
router.get("/users/:id/dutyStatistics", statisticsController.getDurationStatisticsByUser);
router.get("/night-monthly/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { year, month } = req.query;

        if (!userId || !year || !month) {
            return res.status(400).json({
                success: false,
                message: "缺少必要参数: userId, year, month",
            });
        }

        const result = await calculateMonthlyNightShiftCount(userId, parseInt(year), parseInt(month));
        res.json({
            ...result,
        });
    } catch (error) {
        console.error("查询月度夜班数据失败:", error);
        res.status(500).json({
            success: false,
            message: "查询月度夜班数据失败",
            error: error.message,
        });
    }
});
const UserRouter = generateCRUDRoutes(express.Router(), userController);
router.use("/users", UserRouter);
//#endregion

//#region 关于Statistics部分的Router
router.get("/Statistics", statisticsController.getNightShiftCountStatisticsByUser);
const StatisticsRouter = generateCRUDRoutes(express.Router(), statisticsController);
router.use("/Statistics", StatisticsRouter);
//#endregion

//#region 关于考勤du的部分在这里
const dutyController = require("../controllers/dutyController");
const { checkDutyMiddleware } = require("../middlewares/checkRoleMiddleware");
router.get("/duty", dutyController.getAll);
router.post("/duty", checkDutyMiddleware, dutyController.create);
router.get("/duty/:id", dutyController.getById);
router.put("/duty/:id", dutyController.update);
router.delete("/duty/:id", dutyController.delete);
//#endregion

//#region 关于席位Position的部分在这里
const positionController = require("../controllers/positionController");
const PositionRouter = generateCRUDRoutes(express.Router(), positionController);
router.use("/positions", PositionRouter);
//#region 关于席位的部分在这里

//##region 文件的部分在这里
const fileController = require("../controllers/fileController");

router.get("/files/exists", fileController.checkExcelStatus);
router.post("/files/regenerate", fileController.forceRegenerateExcel);
router.post("/files/download", fileController.downloadExcel);

// SEE
const { initSSE } = require("../utils/see");
router.get("/events", initSSE);

//##region 执勤时间检查
const checkDurationController = require("../controllers/checkDurationController");
router.get("/check-duration", checkDurationController.checkAll);
//#endregion

//##region 导出EXCEL的部分在这里
//! 示例：从数据库中查询数据、计算后导出为 Excel
const { exportAsExcel } = require("../utils/exportAsExcel");
router.get("/download-excel", async (req, res) => {
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

// router.get("*", async (req, res) => {
//     console.log("all  request");

//     console.log(req.url);
// });

module.exports = router;
