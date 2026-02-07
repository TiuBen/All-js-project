const BaseController = require("./Base.Controller");
const PositionService = require("../services/Position.Service");

const PositionServiceInstance = new PositionService();

class PositionController extends BaseController {
    constructor() {
        //console.log("PositionController");

        super(PositionServiceInstance);
    }

    getAll(req, res) {
        const query = req.query;

        PositionServiceInstance.getAll(query)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Server error" });
            });
    }

    getById(req, res) {
        const id = req.params.id;

        PositionServiceInstance.getById(id)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Server error" });
            });
    }

    create(req, res) {
        const data = req.body;

        PositionServiceInstance.create(data)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Server error" });
            });
    }

    delete(req, res) {
        const id = req.params.id;

        PositionServiceInstance.delete(id)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Server error" });
            });
    }
    update(req, res) {
        const id = req.params.id;
        const data = req.body;

        PositionServiceInstance.update(id, data)
            .then((result) => {
                res.json(result);
            })
            .catch((err) => {
                res.status(500).json({ error: "Server error" });
            });
    }
}

module.exports = new PositionController();

// 这样 require 回去的时候就直接拿到一个 已经实例化好的对象：

// js
// Copy
// Edit
// // routes.js
// const positionController = require('./PositionController');

// app.get('/positions', positionController.getAll);
// 不过它有几个特点需要注意：

// 实例是单例

// 因为 require 会缓存结果，new PositionController() 只会执行一次，所有引入它的地方都用的是同一个对象。

// 如果里面有可变状态（例如保存请求数据），可能会引发共享数据问题。

// 无法继承或扩展

// 如果未来想继承 PositionController，直接导出实例会比较麻烦，一般会导出类本身 module.exports = PositionController;。

// 适合 stateless controller

// 如果这个 controller 不存储实例变量（比如只处理请求、响应），导出实例很方便。

// 如果你是 Express 控制器 并且没打算保存状态，那这种写法很省事。
// 但如果有状态，建议改成：

// js
// Copy
// Edit
// module.exports = PositionController;
