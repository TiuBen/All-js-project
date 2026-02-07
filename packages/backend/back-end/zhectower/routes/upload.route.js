const express = require("express");
const router = express.Router();

const {PostSaveFile}= require("../controller/upload.controller.js");


router.post("/", PostSaveFile);


module.exports = router;