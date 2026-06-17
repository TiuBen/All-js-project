const fs = require("fs");
const path = require("path");
const { sendEvent } = require("../utils/see");
const { exportAsExcel } = require("../utils/exportAsExcel");

const FILE_DIR = path.join(__dirname, "..", "src");

class FileController {
    async downloadExcel(req, res) {
        try {
            const fileName = req.query.fileName;

            // 检查文件名是否有效
            if (!fileName || fileName.trim() === "") {
                return res.status(400).json({
                    error: "文件名不能为空",
                });
            }

            // 安全检查：防止目录遍历攻击
            if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
                return res.status(400).json({
                    error: "文件名包含非法字符",
                });
            }

            const filePath = path.join(FILE_DIR, fileName); // 根据你的实际目录结构调整

            // 检查文件是否存在
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    error: "文件不存在",
                    fileName: fileName,
                });
            }

            // 检查路径是否是文件（不是目录）
            const stats = fs.statSync(filePath);
            if (!stats.isFile()) {
                return res.status(400).json({
                    error: "请求的路径不是文件",
                });
            }
            // 根据文件后缀设置 Content-Type
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
            // 设置下载头信息
            res.setHeader("Content-Type", contentType);
            res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
            res.setHeader("Cache-Control", "no-cache"); // 防止缓存
            res.setHeader("Content-Length", stats.size); // 对于大文件，可以设置更多的头信息
            // 下载文件
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
    }

    async checkExcelStatus(req, res) {
        console.log("checkExcelStatus");
        const { fileName } = req.query;
        if (!fileName) {
            return res.status(400).json({ error: "Missing fileName" });
        }

        const filePath = path.join(FILE_DIR, fileName);

        const exists = fs.existsSync(filePath);

        res.json({ exists });
    }

    async forceRegenerateExcel(req, res) {
        console.log("forceRegenerateExcel" + req.url);
        const { fileName } = req.query;
        console.log("forceRegenerateExcel:" + fileName);
        if (!fileName) {
            return res.status(400).json({ error: "Missing fileName" });
        }

        const { startDate, startTime, endDate, endTime, needMonth } = req.body;

        await exportAsExcel(startDate, startTime, endDate, endTime, needMonth, fileName);
        // await exportAsExcel();

        // const filePath = path.join(FILE_DIR, fileName);
        // 重新导出Excel

        // 模拟生成需要 3 秒
        // sendEvent("excel", { fileName, status: "done" });
        // setTimeout(() => {
        //     fs.writeFileSync(filePath, `Regenerated at ${new Date()}`);
        //     res.json({ message: "Regeneration started" });
        // }, 4000);
        res.json({ message: "Regeneration done" });
    }
}

module.exports = new FileController();
