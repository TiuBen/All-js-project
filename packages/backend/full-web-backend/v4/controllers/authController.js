const JWTUtil = require("../utils/util/jwt");
const service = require("../services/userService");

exports.login = async (req, res, next) => {
    try {
        // console.log("login");

        const AllUser = await service.getAll({ fields: ["id", "username", "password"] });

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required",
            });
        }

        const user = AllUser.find((u) => u.username === username && u.password === password);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        const userPayload = {
            id: user.id,
            username: user.username,
        };

        const accessToken = JWTUtil.generateAccessToken(userPayload);
        const refreshToken = JWTUtil.generateRefreshToken(userPayload);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            message: "Login successful",
            accessToken,
            username: username,
            id: user.id,
        });
    } catch (error) {
        // console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required",
            });
        }

        const decoded = JWTUtil.verifyToken(refreshToken);

        const AllUser = await service.getAll({ fields: ["id", "username", "password"] });
        const user = AllUser.find((u) => u.id === decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

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
        // console.error("Refresh token error:", error);

        res.clearCookie("refreshToken");

        res.status(403).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.clearCookie("refreshToken");

        res.json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        // console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: "Profile retrieved successfully",
            data: {
                user: req.user,
                protectedData: "This is protected data that only authenticated users can access",
            },
        });
    } catch (error) {
        // console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { email } = req.body;
        const userId = req.user.id;

        const AllUser = await service.getAll({ fields: ["id", "username", "password", "email"] });
        const userIndex = AllUser.findIndex((u) => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (email) {
            AllUser[userIndex].email = email;
            req.user.email = email;
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                user: AllUser[userIndex],
            },
        });
    } catch (error) {
        // console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.validateToken = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: "Token is valid",
            data: {
                user: req.user,
                isValid: true,
            },
        });
    } catch (error) {
        // console.error("Validate token error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
