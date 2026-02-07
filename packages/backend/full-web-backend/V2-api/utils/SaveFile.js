const { PDFfolderPath, test_1_PDF_file } = require("../config/CONST");
const fs = require("fs");
const multer = require("multer");

// ! 静态文件的结构部分
// user 保存每个 用户配置config 头像avatar 这两个文件
// files  功能分类 合同 自己某天制作的规格书
// config 系统配置 比如 个人名片的配置模版

const PathPrefix = {
    ProjectPath: "C:/Users/HJW-AMD-PRP/Documents/",
    userConfig: "/user/config",
    publicSetting: "/public/setting",
    pdf: "/pdf",
};

// !这部分 是 formdata 可能要处理 头像的图片
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const url = req.url;
        let prefixPath = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/public";
        if (url.toLowerCase().includes("user")) {
            prefixPath = prefixPath + PathPrefix.userConfig;
        } else if (url.toLowerCase().includes("pdf")) {
            prefixPath = prefixPath + PathPrefix.pdf;
        }

        let d = new Date();
        let todayFolder = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        let destFolder = prefixPath+"/" + todayFolder;
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        // console.log(file);

        cb(null, destFolder);
    },
    filename: function (req, file, cb) {
        cb(null, decodeURI(file.originalname));
    },
});

const SaveFile = multer({
    fileFilter(req, file, callback) {
        file.originalname = decodeURI(file.originalname);
        callback(null, true);
    },
    storage: storage,
});
// * 这个地方可以处理多个部分 在这里通用处理
const Upload=SaveFile.fields([{name:"files",maxCount:5},{name:"attachment",maxCount:5},{name:"img",maxCount:5}])
module.exports = { SaveFile ,Upload};
