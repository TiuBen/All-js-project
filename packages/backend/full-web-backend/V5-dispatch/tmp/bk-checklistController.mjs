import * as templateService from "../services/templateService.js";
import * as checklistService from "../services/checklistService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const listTemplates = asyncHandler(async (req, res) => {
  const items = templateService.listTemplateMeta();
  res.json({ total: items.length, items });
});
const getTemplate = asyncHandler(async (req, res) => {
  const tpl = templateService.getTemplateById(req.params.id);
  if (!tpl) {
    return res.status(404).json({ error: "template not found" });
  }
  res.json(tpl);
});
const listRecords = asyncHandler(async (req, res) => {
  const { flightId, category, date, from, to } = req.query;
  const items = await checklistService.listRecords({
    flightId,
    category,
    date,
    from,
    to
  });
  res.json({ total: items.length, items });
});
const getRecord = asyncHandler(async (req, res) => {
  const record = await checklistService.getRecord(req.params.id);
  if (!record) {
    return res.status(404).json({ error: "record not found" });
  }
  res.json(record);
});
const createRecord = asyncHandler(async (req, res) => {
  const { flightId, checklistCategory } = req.body;
  if (!flightId || !checklistCategory) {
    return res.status(400).json({ error: "flightId and checklistCategory are required" });
  }
  const record = await checklistService.createRecord(req.body);
  res.status(201).json(record);
});
const updateRecord = asyncHandler(async (req, res) => {
  const record = await checklistService.updateRecord(req.params.id, req.body);
  if (!record) {
    return res.status(404).json({ error: "record not found" });
  }
  res.json(record);
});
const deleteRecord = asyncHandler(async (req, res) => {
  const deleted = await checklistService.deleteRecord(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "record not found" });
  }
  res.json({ success: true });
});
export {
  createRecord,
  deleteRecord,
  getRecord,
  getTemplate,
  listRecords,
  listTemplates,
  updateRecord
};
