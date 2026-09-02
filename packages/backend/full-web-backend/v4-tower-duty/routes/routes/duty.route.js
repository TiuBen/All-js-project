const express = require("express");
const router = express.Router();

const dutyController = require("../../controllers/dutyController");
const { checkDutyMiddleware } = require("../../middlewares/checkRoleMiddleware");

// ==========================================
// 原有 duty CRUD 路由
// ==========================================
router.get("/", dutyController.getByQuery);
router.post("/", checkDutyMiddleware, dutyController.create);
router.get("/:id", dutyController.getByQuery);
router.put("/:id", dutyController.update);
router.delete("/:id", dutyController.delete);

// ==========================================
// hr_duty_summary 考勤汇总 CRUD 路由
// 路由前缀: /duty/hr-duty
// ==========================================
router.get("/hr-duty/list", dutyController.hrDutyGetByQuery);
router.get("/hr-duty/:id", dutyController.hrDutyGetById);
router.post("/hr-duty", dutyController.hrDutyCreate);
router.post("/hr-duty/batch", dutyController.hrDutyBatchCreate);
router.put("/hr-duty/:id", dutyController.hrDutyUpdate);
router.delete("/hr-duty/:id", dutyController.hrDutyDelete);

module.exports = router;
