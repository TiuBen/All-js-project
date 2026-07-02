const express = require("express");
const router = express.Router();

const dutyController = require("../../controllers/dutyController");
const { checkDutyMiddleware } = require("../../middlewares/checkRoleMiddleware");

router.get("/", dutyController.getAll);
router.post("/", checkDutyMiddleware, dutyController.create);
router.get("/:id", dutyController.getById);
router.put("/:id", dutyController.update);
router.delete("/:id", dutyController.delete);

module.exports = router;
