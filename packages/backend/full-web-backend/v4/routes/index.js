const express = require("express");
const { generateCRUDRoutes } = require("../utils/routeGenerator");

const router = express.Router();
const cacheMiddleware = require("../middlewares/cacheMiddleware");

// User 部分

// 1. 初始化底层服务
const UserService = require("../services/User.Service");
const DutyService = require("../services/Duty.Service");

const dutyService = new DutyService();
const userService = new UserService(dutyService); // 注入 UserService

// 2. 初始化控制器
const UserController = require("../controllers/User.Controller");
const userController = new UserController(userService, dutyService); // 注入 DutyService

//  login logout refreshTOKEN
const AuthController = require("../controllers/Auth.Controller");
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/refresh", AuthController.refreshToken);

const LogController = require("../controllers/Log.Controller");
router.get("/log",LogController.getAll);




const { authenticateToken, optionalAuth, requireAdmin } = require('../middlewares/auth');




//#region 关于user部分的Router
const StatisticsController = require("../controllers/Statistics.Controller");
router.get("/users/:id/nightCount", StatisticsController.getNightShiftCountStatisticsByUser);
// router.get("/users/:id/teachStatistics", StatisticsController.getTeachTimeStatisticsByUser);
router.get("/users/:id/dutyStatistics", StatisticsController.getDurationStatisticsByUser);
const UserRouter = generateCRUDRoutes(express.Router(), userController);
router.use("/users", UserRouter);
//#endregion

//#region 关于考勤du的部分在这里
const DutyController = require("../controllers/Duty.Controller");
const dutyController = new DutyController(dutyService);
const { checkDutyMiddleware } = require("../middlewares/checkRoleMiddleware");
router.get("/duty", dutyController.getAll);
router.post("/duty", checkDutyMiddleware, dutyController.create);
router.get("/duty/:id", dutyController.getById);
router.put("/duty/:id", dutyController.update);
router.delete("/duty/:id", dutyController.delete);
//#endregion

//#region 关于席位Position的部分在这里
const PositionController = require("../controllers/Position.Controller");
const PositionRouter = generateCRUDRoutes(express.Router(), PositionController);
router.use("/positions", PositionRouter);
//#region 关于席位的部分在这里



//##region 文件的部分在这里
const FileController = require("../controllers/File.Controller");

router.get("/files/exists", FileController.checkExcelStatus);
router.post("/files/regenerate", FileController.forceRegenerateExcel);
router.post("/files/download", FileController.downloadExcel);

// SEE 
const {initSSE}=require("../utils/see")
router.get("/events", initSSE);



//##region 导出EXCEL的部分在这里
//! 示例：从数据库中查询数据、计算后导出为 Excel
const { exportAsExcel } = require("../utils/exportAsExcel");
router.get("/download-excel", async (req, res) => {
    try {
        console.log("download-excel");
        const {startDate,startTime,endDate,endTime}=req.query;

        const filePath = await exportAsExcel(startDate,startTime,endDate,endTime);
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
