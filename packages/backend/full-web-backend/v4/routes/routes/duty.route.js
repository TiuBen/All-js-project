const express = require("express");
const router = express.Router();

const dutyController = require("../../controllers/dutyController");
const { checkDutyMiddleware } = require("../../middlewares/checkRoleMiddleware");

router.get("/", dutyController.getByQuery);
router.post("/", checkDutyMiddleware, dutyController.create);
router.get("/:id", dutyController.getByQuery);
router.put("/:id", dutyController.update);
router.delete("/:id", dutyController.delete);

module.exports = router;
