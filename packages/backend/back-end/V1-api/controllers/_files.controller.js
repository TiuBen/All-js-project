// 保存 文件 图片 等等的 controller

const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest:'C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/assert' });

// *! 还不清楚怎么弄 到底是存到数据库还是就以文件的形式保存
exports.uploadAvatar = (req, res,next) => {
    // console.log("test post upload");
    // console.log(req.originalUrl);
    // return  upload.single("test1111")(req,res,()=>{
    //     next();
    // });
    // res.send({"uploadAvatar":"uploadAvatar"});
};
