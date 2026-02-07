// utils/jwt.js
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || "your-secret-key";

class JWTUtil {
    // 生成访问令牌 (15分钟过期)
    static generateAccessToken(payload) {
        return jwt.sign(payload, secret, { expiresIn: "15m" });
    }

    // 生成刷新令牌 (7天过期)
    static generateRefreshToken(payload) {
        return jwt.sign(payload, secret, { expiresIn: "7d" });
    }

    // 验证令牌
    static verifyToken(token) {
        try {
            return jwt.verify(token, secret);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                throw new Error("Token expired");
            } else if (error.name === "JsonWebTokenError") {
                throw new Error("Invalid token");
            } else {
                throw new Error("Token verification failed");
            }
        }
    }
    /**
     * 检查令牌是否即将过期（在5分钟内过期）
     */
    static isTokenExpiringSoon(token) {
        try {
            const decoded = jwt.decode(token);
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = decoded.exp - currentTime;

            return timeUntilExpiry < 300; // 5分钟
        } catch (error) {
            return true;
        }
    }
}

module.exports = JWTUtil;
