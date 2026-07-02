const express = require("express");
const router = express.Router();

const positionController = require("../../controllers/positionController");

router.get("/", positionController.getAll);
router.post("/", positionController.create);
router.get("/:id", positionController.getById);
router.put("/:id", positionController.update);
router.delete("/:id", positionController.delete);

module.exports = router;
