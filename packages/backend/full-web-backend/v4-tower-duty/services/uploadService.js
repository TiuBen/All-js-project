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
        // 从请求体中获取 year 和 month
        const { year, month } = req.body;

        // if (!year || !month) {
        //     // 兜底：如果没传年月，就用原始文件名
        //     console.warn("未提供 year/month 参数，使用原始文件名:", file.originalname);
        //     return cb(null, file.originalname);
        // }

        // // 获取原始扩展名（.xls / .xlsx / .xlsm）
        // const ext = path.extname(file.originalname);
        // // 强制命名为 year-month.ext
        // const filename = `${year}-${month}${ext}`;

        // console.log("上传文件保存为:", filename);
        // cb(null, filename);

        if (!year || !month) {
            return cb(new Error("必须提供 year 和 month"));
        }
        // 获取扩展名
        const ext = path.extname(file.originalname).toLowerCase();
        // 只允许 Excel
        const allowedExt = [".xls", ".xlsx", ".xlsm"];
        if (!allowedExt.includes(ext)) {
            return cb(new Error("只允许上传 .xls、.xlsx、.xlsm 文件"));
        }
        const baseName = `${year}-${month}`;
        // 删除同一个 year-month 下可能存在的其他扩展名
        for (const oldExt of allowedExt) {
            const oldFile = path.join(UPLOAD_DIR, `${baseName}${oldExt}`);
            if (fs.existsSync(oldFile)) {
                fs.unlinkSync(oldFile);
                console.log("删除旧文件:", oldFile);
            }
        }
        // 最终文件名仍然保留当前上传文件的扩展名
        const filename = `${baseName}${ext}`;
        console.log("上传文件保存为:", filename);
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 8 * 1024 * 1024, // 限制10MB
    },
});

module.exports = { upload, getDutyRows };
