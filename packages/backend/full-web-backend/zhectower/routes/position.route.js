const express = require('express');
const router = express.Router();
const PositionController = require('../controller/position.controller');

// 获取所有用户
router.get('/positions', PositionController.GetPositions);

// 获取单个用户
router.get('/positions/:id', PositionController.GetPosition);

// 创建新用户
router.post('/positions', PositionController.PostNewPosition);

// 更新用户（替换整个资源）
router.put('/positions/:id', PositionController.PutPosition);

// 删除用户
router.delete('/positions/:id', PositionController.DeletePosition);

module.exports = router;