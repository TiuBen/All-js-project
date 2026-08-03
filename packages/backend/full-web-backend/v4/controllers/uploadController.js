const { successResponse, errorResponse } = require("../utils/util/apiResponse");
const { upload, getDutyRows } = require("../services/uploadService");
const fs = require("fs");
const path = require("path"); // 补上path

// 异步文件工具，避免同步阻塞
const fsAsync = fs.promises;

uploadFile = [
    upload.single("file"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return errorResponse(res, "No file uploaded", 400);
            }

            const { year, month } = req.body;
            if (!year || !month) {
                // 异步删除文件，捕获删除失败
                try {
                    await fsAsync.unlink(req.file.path);
                } catch {}
                return errorResponse(res, "year and month are required", 400);
            }

            const UPLOAD_DIR = path.join(__dirname, "../public/ExcelDutyFiles");
            // 统一命名规则：year-month.后缀，和check接口匹配
            const ext = path.extname(req.file.originalname);
            const targetFileName = `${year}-${month}${ext}`;
            const targetPath = path.join(UPLOAD_DIR, targetFileName);

            // 移动文件到标准命名
            await fsAsync.rename(req.file.path, targetPath);

            successResponse(res, "File uploaded successfully", {
                filename: targetFileName,
                path: `/ExcelDutyFiles/${targetFileName}`,
            });
        } catch (error) {
            next(error);
        }
    },
];

checkExcelExists = async (req, res, next) => {
    try {
        const { year, month } = req.query;
        // console.info(`CheckExcelExistsController: ${year}, ${month}`);
        if (!year || !month) {
            // 统一使用 errorResponse
            return errorResponse(res, "year and month are required", 400);
        }

        const UPLOAD_DIR = path.join(__dirname, "../public/ExcelDutyFiles");
        const possibleExts = [".xlsx", ".xls", ".xlsm"];
        let foundFile = null;

        for (const ext of possibleExts) {
            const filePath = path.join(UPLOAD_DIR, `${year}-${month}${ext}`);
            // console.log(filePath);

            // 异步判断文件存在
            let exist = false;
            try {
                await fsAsync.access(filePath);
                exist = true;
            } catch {}
            if (exist) {
                foundFile = `${year}-${month}${ext}`;
                break;
            }
        }

        // 统一成功返回格式
        successResponse(res, "Query success", {
            exists: !!foundFile,
            filename: foundFile,
        });
    } catch (error) {
        next(error);
    }
};

getDutyRowsController = async (req, res, next) => {
    // console.log("getDutyRowsController");

    try {
        const { year, month, username } = req.query;
        // console.info(`GetDutyRowsController: ${year}, ${month}, ${username}`);

        if (!year || !month || !username) {
            return errorResponse(res, "year, month and user are required", 400);
        }

        const rows = getDutyRows(year, month, username);
        if (rows === null) {
            return errorResponse(res, "Excel file not found", 404);
        }

        res.send(rows);
    } catch (error) {
        next(error);
    }
};

// 导出修正：函数名保持一致
module.exports = {
    checkExcelExists,
    uploadFile,
    getDutyRowsController,
};
