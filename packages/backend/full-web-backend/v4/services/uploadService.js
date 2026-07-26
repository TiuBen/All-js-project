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
        return {
            success: false,
            error: "FILE_NOT_FOUND",
            message: `未找到 ${year}年${parseInt(month) + 1}月的Excel文件`,
            data: null,
        };
    }
    // 2. 读取数据
    try {
        const rows = getRowsByUsername(filePath, user);

        // 3. 检查是否有数据
        if (!rows || rows.length === 0) {
            return {
                success: false,
                error: "USER_NOT_FOUND",
                message: `在Excel中未找到用户 "${user}" 的执勤记录`,
                data: null,
            };
        }

        // 4. 成功返回
        return {
            success: true,
            error: null,
            message: "获取成功",
            data: rows,
            total: rows.length,
        };
    } catch (error) {
        // 5. 异常处理
        console.error("读取Excel文件失败:", error);
        return {
            success: false,
            error: "READ_ERROR",
            message: `读取Excel文件失败: ${error.message}`,
            data: null,
        };
    }
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

const upload = multer({
    storage,
    limits: {
        fileSize: 8 * 1024 * 1024, // 限制10MB
    },
});

module.exports = { upload, getDutyRows };
