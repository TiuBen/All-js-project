// middleware/auth.js
const JWTUtil = require("../utils/jwt.js");

const authMiddleware = {
    // 验证访问令牌
    authenticateToken: (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: "Access token required" });
        }

        try {
            const decoded = JWTUtil.verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
    },

    // 可选认证（用于某些可公开访问的接口）
    optionalAuth: (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (token) {
            try {
                const decoded = JWTUtil.verifyToken(token);
                req.user = decoded;
            } catch (error) {
                // 令牌无效，但不阻止请求
            }
        }
        next();
    },

    /**
     * 验证管理员权限
     */
    requireAdmin: (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access token required",
            });
        }

        try {
            const decoded = JWTUtil.verifyToken(token);

            // 检查用户角色
            if (!decoded?.role || decoded?.role !== "admin") {
                return res.status(403).json({
                    success: false,
                    message: "Admin access required",
                });
            }

            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
    },
};

module.exports = authMiddleware;
