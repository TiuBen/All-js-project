const { PDFfolderPath, test_1_PDF_file } = require("../config/CONST");
const fs = require("fs");
const multer = require("multer");
const { contractID } = require("../models/utils/user.model");

// ! 静态文件的结构部分
// user 保存每个 用户配置config 头像avatar 这两个文件
// files  功能分类 合同 自己某天制作的规格书
// config 系统配置 比如 个人名片的配置模版

const PathPrefix = {
    ProjectPath: "C:/Users/HJW-AMD-PRP/Documents/",
    publicSetting: "public/setting",
    user: "user/config",
    pdf: "pdf",
    businesscard: "名片",
    supplier: "产品目录",
    contract: "合同",
};

// !这部分 是 formdata 可能要处理 头像的图片

// ! 根据 路由 来设置存储位置
//  *  整体 文件存放路径格式
// *  头部路径+年月日+分类
const PublicFolder = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/public";

function todayFolder() {
    let d = new Date();
    let todayFolder = d.getFullYear() + "_" + (d.getMonth() + 1) + "_" + d.getDate();

    return todayFolder;
}

function catFolder(url) {
    let _url = url.toLowerCase();
    let secondPath = "";
    if (_url.includes("user")) {
        secondPath = PathPrefix.user;
    } else if (_url.includes("pdf")) {
        secondPath = PathPrefix.pdf;
    } else if (_url.includes("pdf")) {
        secondPath = PathPrefix.pdf;
    } else if (_url.includes("businesscard")) {
        secondPath = PathPrefix.businesscard;
    } else if (_url.includes("supplier")) {
        secondPath = PathPrefix.supplier;
    } else if (_url.includes("contract")) {
        secondPath = PathPrefix.contract;
    } else {
        secondPath = "/未定义目录";
    }
    return secondPath;
}

function makePolderPath(url) {
    var fullPath = "";
    if (catFolder(url)) {
        return (fullPath = PublicFolder + "/" + todayFolder() + "/" + catFolder(url));
    }

    return (fullPath = PublicFolder + "/" + todayFolder());
}

function isLatin1(text) {
    try {
        Buffer.from(text, "latin1").toString("utf8");
        return true;
    } catch (error) {
        return false;
    }
}

function testLatin1(text){
    const afterText= Buffer.from(text, "latin1").toString("utf8");
    console.log("raw:"+text +" ; "+ text.length);
    console.log("utf:"+afterText +" ; "+ afterText.length);
    if (text===afterText) {
        return false;
    }
    return true;
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("destination :"+ req.originalUrl);
        let destFolder = makePolderPath(req.originalUrl);
        console.log("destFolder :" + destFolder);
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        cb(null, destFolder);
    },
    filename: function (req, file, cb) {
        var filename = "";
        if (req.body[file.fieldname] !== undefined) {
            // *这个解决前端发送的
            filename = req.body[file.fieldname];
        } else {
            // *这个解决 Postman 发送的

            if (file.originalname.length=== Buffer.from(file.originalname, "latin1").toString("utf8").length) {
                filename=file.originalname;
            } else {
                filename=Buffer.from(file.originalname, "latin1").toString("utf8");
            }
        }

        if (fs.existsSync(makePolderPath(req.originalUrl) + "/" + filename)) {
            console.log(filename);
            cb(new Error("Same Name File exits!"));
        } else {
            cb(null, filename);
        }

        // console.log("filename decodeURI: " + decodeURI(file.originalname)); // ! 这个用POSTMan 是没问题的
        // const filename=makePath(null,file.originalname);
        // console.log("filename null"+filename);
        // console.log("filename latin1: " + Buffer.from(file.originalname, "latin1").toString("utf8"));
        // const filename= Buffer.from(file.originalname, "latin1").toString("utf8");
    },
});

const SaveFile = multer({
    storage: storage,
    defParamCharset: "utf8",
    defCharset: "utf8",
});
// SaveFile.single("frontImg");


// * 这个地方可以处理多个部分 在这里通用处理
const Upload = SaveFile.fields([
    { name: "files", maxCount: 5 },
    { name: "attachment", maxCount: 5 },
    { name: "img", maxCount: 5 },
    { name: "frontImg", maxCount: 1 },
    { name: "backImg", maxCount: 1 },
]);
module.exports = { PublicFolder,SaveFile, Upload };
