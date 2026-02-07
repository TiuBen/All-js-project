const express = require('express');
const router = express.Router();
const UserController = require('../controller/user.controller');

// 获取所有用户
router.get('/users', UserController.GetUsers);

// 获取单个用户
router.get('/users/:id', UserController.GetUser);

// 创建新用户
router.post('/users', UserController.PostNewUser);

// 更新用户（替换整个资源）
router.put('/users/:id', UserController.PutUser);

// 部分更新用户
router.patch('/users/:id', UserController.PatchUser);

// 删除用户
router.delete('/users/:id', UserController.DeleteUser);

module.exports = router;