const { UserService:_UserService } = require("../service/index"); // 假设有一个 UserService 处理业务逻辑

const UserService=new _UserService();

const UserController = {
    // 获取所有用户
    GetUsers: async function (req, res) {
        console.log("获取所有用户");
        try {
            const {orderBy}=req.query;
            const users = await UserService.findAll(orderBy);
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch users", error: error.message });
        }
    },

    // 获取单个用户
    GetUser: async function (req, res) {
        console.log("获取单个用户");
        try {
            const userId = req.params.id;
            const user = await UserService.findById(userId);

            if (user) {
                // 解析 position 字段
                try {
                    user.position = JSON.parse(user.position);
                } catch (error) {
                    return res.status(500).json({ message: "Failed to parse position data", error: error.message });
                }
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch user", error: error.message });
        }
    },

    // 创建新用户
    PostNewUser: function (req, res) {
        try {
            const newUser = req.body;
            const createdUser = UserService.createUser(newUser);
            res.status(201).json(createdUser);
        } catch (error) {
            res.status(500).json({ message: "Failed to create user", error: error.message });
        }
    },

    // 更新用户（替换整个资源）
    PutUser:async function (req, res) {
        console.log("更新用户（替换整个资源）");

        try {
            const userId = req.params.id;
            const updatedUser = req.body;
            const result =await UserService.update(userId, updatedUser);
            console.log(result);
            
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Failed to update user", error: error.message });
        }
    },

    // 部分更新用户
    PatchUser: function (req, res) {
        try {
            const userId = req.params.id;
            const updates = req.body;
            const result = UserService.partiallyUpdateUser(userId, updates);
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Failed to partially update user", error: error.message });
        }
    },

    // 删除用户
    DeleteUser: function (req, res) {
        try {
            const userId = req.params.id;
            const result = UserService.deleteUser(userId);
            if (result) {
                res.status(204).send(); // 204 No Content
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Failed to delete user", error: error.message });
        }
    },
};

module.exports = UserController;
