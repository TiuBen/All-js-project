const express = require("express");
const router = express.Router();

const {GetPositions,GetRoles,GetUsers,GetAllByMonth,GetNow,GetByID}= require('../controller/query.controller');


router.get("/positions", GetPositions);
router.get("/roles", GetRoles);
router.get("/orderedusername", GetUsers);
router.get("/statics", GetAllByMonth);
router.get("/all", GetAllByMonth);
router.get("/now", GetNow);
router.get("", GetByID);


module.exports = router;