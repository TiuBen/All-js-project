/* 这个中间件记录所有写入操作的日志 */
const { DutyDb } = require("../config/sqliteDb");

function logMiddleware(req, res, next) {
    const writeMethods = ["POST", "PUT", "PATCH", "DELETE"];
    const listenURLs = ["/api/users", "/api/logs"];

    if (writeMethods.includes(req.method)) {
        // 取请求信息
        const { method, originalUrl, body, query, params } = req;
        const userId = req.user?.id || null; // 如果前面有 auth middleware
        const ip = req.ip || req.headers["x-forwarded-for"];
        const createdAt = new Date().toISOString();

        // 注意：res.on('finish') 确保响应发完后再记录（避免阻塞主流程）
        res.on("finish", () => {
            DutyDb.run(
                `INSERT INTO log (method, url, body, query, params, userId, ip, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    method,
                    originalUrl,
                    JSON.stringify(body || {}),
                    JSON.stringify(query || {}),
                    JSON.stringify(params || {}),
                    userId,
                    ip,
                    createdAt,
                ],
                (err) => {
                    if (err) console.error("日志记录失败:", err.message);
                }
            );
        });
    }

    next();
}

module.exports = logMiddleware;
