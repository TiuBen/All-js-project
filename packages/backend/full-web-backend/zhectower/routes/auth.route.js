const express = require("express");
const router = express.Router();

const {
    PostFaceImageToCompareFace,
    PostFaceImageToCompareFace2,
    // uploadFiles,
    // uploadMiddleware,
    FindIsWho,
    aliyunFaceCompare
} = require("../controller/auth.controller");

router.post("/face/verify",aliyunFaceCompare);
// router.post("/face/find",FindIsWho);

module.exports = router;
