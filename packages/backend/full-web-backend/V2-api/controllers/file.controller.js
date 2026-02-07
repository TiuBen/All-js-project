const { PDFfolderPath, test_1_PDF_file } = require("../config/CONST");
const fs = require("fs");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let d = new Date();
        let todayFolder = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
        let destFolder = PDFfolderPath + todayFolder;
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        console.log(file);

        cb(null, destFolder);
    },
    filename: function (req, file, cb) {
        cb(null, decodeURI(file.originalname));
    },
});

const upload = multer({
    fileFilter(req, file, callback) {
        file.originalname = decodeURI(file.originalname);
        callback(null, true);
    },
    storage: storage,
});

exports.downloadFile = (req, res) => {
    console.log("测试传输文件");
    // console.log(process.env);
    console.log(__dirname);
    console.log(__filename);
    // const path = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/public/PDF/1.pdf";

    //应该先测试是否存在文件
    // 第一步从前端的请求里获取文件路径
    console.log(req.path);
    var fileName=req.path.split('/');
    console.log(fileName);
    var _f=decodeURI(fileName[2]);
    console.log(_f);
    console.log("解析token来获取user");

    fileName = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/public/"+_f;
    res.sendFile(fileName);

    // if (fs.existsSync(test_1_PDF_file)) {
    //     console.log("dddddddddddddd");
    //     // res.contentType("application/pdf");
    //     res.setHeader("Access-Control-Allow-Origin", "*");
    //     res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
    //     res.setHeader("Content-Type", "application/pdf");
    //     res.setHeader("Content-Disposition", "inline; filename=dddd.pdf");
    //     fs.createReadStream(test_1_PDF_file).pipe(res);
    // } else {
    //     res.status(500);
    //     console.log("File not found");
    //     res.send("File not found");
    // }
};

exports.uploadFile = (req, res, next) => {
    console.log("test post upload");

    upload.array("files", { maxCount: 12 })(req, res, (next) => {
        // res.end("File is uploaded");
        console.log("++++++++++++++++++++++");
        console.log("req.body");
        console.log(req.body);
        console.log("req.files");
        // console.log(req.files);
        // console.log(req.body.title);
        // console.log(JSON.stringify( req.body));
        // console.log(req.body.title);
        // console.log(req.body.applyTime);

        return next;
    });
    res.send({ uploadAvatar: "uploadAvatar" });
};

// 这是所有文件的部分
// 比如 <img src='http://api/v2/img/20230/文件' alt=""/>
// 前端获取图片/文件等资源的时候 都是从这里来的

exports.myUpload = upload;
