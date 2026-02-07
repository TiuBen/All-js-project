const express = require("express");
const router = express.Router();

const {PostFaceImageToCompareFace}= require('../controller/auth.controller');

router.post("/face", PostFaceImageToCompareFace);


module.exports = router;