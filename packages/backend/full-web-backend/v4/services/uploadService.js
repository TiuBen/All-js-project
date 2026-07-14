const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { getRowsByUsername } = require("../utils/excel/readExcelFileByYearMonthAndSelectUserRow");

const UPLOAD_DIR = path.join(__dirname, "../public/ExcelDutyFiles");

function getExcelFilePath(year, month) {
    const possibleExts = [".xlsx", ".xls", ".xlsm"];
    for (const ext of possibleExts) {
        const filePath = path.join(UPLOAD_DIR, `${year}-${month}${ext}`);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    return null;
}

function getDutyRows(year, month, user) {
    const filePath = getExcelFilePath(year, month);
    if (!filePath) {
        return null;
    }
    return getRowsByUsername(filePath, user);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (!fs.existsSync(UPLOAD_DIR)) {
            fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // 直接使用前端传过来的新文件名，不做任何修改
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

module.exports = { upload, getDutyRows };
