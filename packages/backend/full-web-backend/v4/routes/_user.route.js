const express = require('express');
const UserController = require('../controllers/User.Controller');
// const authMiddleware = require('../middlewares/authMiddleware');
// const { validateUser } = require('../validations/userValidation');

// router.get('/', authMiddleware, userController.getAllUsers);
// router.post('/', validateUser, userController.createUser);
// router.get('/:id', authMiddleware, userController.getUserById);
// router.put('/:id', authMiddleware, validateUser, userController.updateUser);
// router.delete('/:id', authMiddleware, userController.deleteUser);

// module.exports = router;

const {generateCRUDRoutes} = require('../utils/routeGenerator');

// 使用示例
// const userRouter = generateCRUDRoutes(express.Router(), userController, {
//     default: [authMiddleware],
//     create: [authMiddleware, validateUser],
//     update: [authMiddleware, validateUser],
// });

const UserRouter = generateCRUDRoutes(express.Router(), UserController);

module.exports = UserRouter;