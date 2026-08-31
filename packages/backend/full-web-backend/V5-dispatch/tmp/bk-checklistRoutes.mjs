import express from "express";
import * as checklistController from "../controllers/checklistController.js";
const router = express.Router();
router.get("/templates", checklistController.listTemplates);
router.get("/templates/:id", checklistController.getTemplate);
router.get("/records", checklistController.listRecords);
router.get("/records/:id", checklistController.getRecord);
router.post("/records", checklistController.createRecord);
router.put("/records/:id", checklistController.updateRecord);
router.delete("/records/:id", checklistController.deleteRecord);
export {
  router as checklistRouter
};
