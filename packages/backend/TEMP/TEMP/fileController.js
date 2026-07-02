const fs = require("fs");
const path = require("path");
const { sendEvent } = require("../utils/see");
const { exportAsExcel } = require("../utils/exportAsExcel");

const FILE_DIR = path.join(__dirname, "..", "src");

exports.downloadExcel = async (req, res, next) => {
    try {
        const fileName = req.query.fileName;

        if (!fileName || fileName.trim() === "") {
            return res.status(400).json({
                error: "文件名不能为空",
            });
        }

        if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
            return res.status(400).json({
                error: "文件名包含非法字符",
            });
        }

        const filePath = path.join(FILE_DIR, fileName);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "文件不存在",
                fileName: fileName,
            });
        }

        const stats = fs.statSync(filePath);
        if (!stats.isFile()) {
            return res.status(400).json({
                error: "请求的路径不是文件",
            });
        }

        const fileExtension = path.extname(fileName).toLowerCase();
        const mimeTypes = {
            ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls": "application/vnd.ms-excel",
            ".csv": "text/csv",
            ".pdf": "application/pdf",
            ".txt": "text/plain",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".ppt": "application/vnd.ms-powerpoint",
            ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".zip": "application/zip",
            ".rar": "application/x-rar-compressed",
            ".7z": "application/x-7z-compressed",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".mp4": "video/mp4",
            ".mp3": "audio/mpeg",
            ".json": "application/json",
            ".xml": "application/xml",
        };

        const contentType = mimeTypes[fileExtension] || "application/octet-stream";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Content-Length", stats.size);

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error("下载文件时出错:", err);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: "文件下载失败",
                    });
                }
            }
        });
    } catch (error) {
        console.error("下载Excel时出错:", error);
        res.status(500).json({
            error: "服务器内部错误",
        });
    }
};

exports.checkExcelStatus = async (req, res, next) => {
    console.log("checkExcelStatus");
    const { fileName } = req.query;
    if (!fileName) {
        return res.status(400).json({ error: "Missing fileName" });
    }

    const filePath = path.join(FILE_DIR, fileName);
    const exists = fs.existsSync(filePath);

    res.json({ exists });
};

exports.forceRegenerateExcel = async (req, res, next) => {
    console.log("forceRegenerateExcel" + req.url);
    const { fileName } = req.query;
    console.log("forceRegenerateExcel:" + fileName);
    if (!fileName) {
        return res.status(400).json({ error: "Missing fileName" });
    }

    const { startDate, startTime, endDate, endTime, needMonth } = req.body;

    await exportAsExcel(startDate, startTime, endDate, endTime, needMonth, fileName);

    res.json({ message: "Regeneration done" });
};
