// controllers/authController.js
const JWTUtil = require("../utils/jwt");
const UserService = require("../services/User.Service");
const userService = new UserService();

class AuthController {
    /**
     * 用户登录
     */
    static async login(req, res) {
        console.log("login");

        const AllUser = await userService.getAll({ fields: ["id", "username", "password"] });
        // console.log(AllUser);

        try {
            const { username, password } = req.body;

            // 参数验证
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Username and password are required",
                });
            }

            // 查找用户
            const user = AllUser.find((u) => u.username === username && u.password === password);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials",
                });
            }

            // 生成令牌
            const userPayload = {
                id: user.id,
                username: user.username,
            };

            const accessToken = JWTUtil.generateAccessToken(userPayload);
            const refreshToken = JWTUtil.generateRefreshToken(userPayload);

            // 设置刷新令牌到 httpOnly cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
            });

            res.json({
                success: true,
                message: "Login successful",
                accessToken,
                username: username,
                id: user.id,
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    /**
     * 刷新访问令牌
     */
    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Refresh token required",
                });
            }

            const decoded = JWTUtil.verifyToken(refreshToken);

            // 查找用户是否存在
            const user = AllUser.find((u) => u.id === decoded.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // 生成新的访问令牌
            const userPayload = {
                id: user.id,
                username: user.username,
            };
            const newAccessToken = JWTUtil.generateAccessToken(userPayload);

            res.json({
                success: true,
                message: "Token refreshed successfully",
                data: {
                    accessToken: newAccessToken,
                    user: userPayload,
                },
            });
        } catch (error) {
            console.error("Refresh token error:", error);

            // 清除无效的刷新令牌
            res.clearCookie("refreshToken");

            res.status(403).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
        }
    }

    /**
     * 用户登出
     */
    static async logout(req, res) {
        try {
            // 清除刷新令牌 cookie
            res.clearCookie("refreshToken");

            res.json({
                success: true,
                message: "Logout successful",
            });
        } catch (error) {
            console.error("Logout error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    /**
     * 获取用户资料
     */
    static async getProfile(req, res) {
        try {
            // 用户信息已经在中间件中附加到 req.user
            res.json({
                success: true,
                message: "Profile retrieved successfully",
                data: {
                    user: req.user,
                    protectedData: "This is protected data that only authenticated users can access",
                },
            });
        } catch (error) {
            console.error("Get profile error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    /**
     * 更新用户资料
     */
    static async updateProfile(req, res) {
        try {
            const { email } = req.body;
            const userId = req.user.id;

            // 查找用户
            const userIndex = users.findIndex((u) => u.id === userId);
            if (userIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            // 更新用户信息
            if (email) {
                users[userIndex].email = email;
                req.user.email = email; // 更新令牌中的用户信息
            }

            res.json({
                success: true,
                message: "Profile updated successfully",
                data: {
                    user: users[userIndex],
                },
            });
        } catch (error) {
            console.error("Update profile error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    /**
     * 验证令牌
     */
    static async validateToken(req, res) {
        try {
            // 如果中间件验证通过，直接返回用户信息
            res.json({
                success: true,
                message: "Token is valid",
                data: {
                    user: req.user,
                    isValid: true,
                },
            });
        } catch (error) {
            console.error("Validate token error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
}

module.exports = AuthController;
