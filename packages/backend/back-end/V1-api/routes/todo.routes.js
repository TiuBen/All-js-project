// http://localhost:3100/fuck/?id=?                 query { id: '?' }
// http://localhost:3100/fuck/?id=2&&name=shenning  { id: '2', name: 'shenning' }
// http://localhost:3100/fuck/id=?                   没有query
//

module.exports = (app) => {
    const todo = require("../controllers/todo.controller.js");

    // @STEP 处理单个todo
    var singleTodoRouter = require("express").Router();

    // /todo/${id}
    // 创建单个Todo
    singleTodoRouter.post("/", todo.createOne);
    // 获取单个Todo by ID
    ////singleTodoRouter.get("/:id", todo.findOneByID);
    // 修改单个Todo by ID
    ////singleTodoRouter.put("/:id", todo.UpdateOneByID);
    // 删除单个Todo by ID
    ////singleTodoRouter.delete("/:id", todo.DeleteOneByID);

    app.use("/todo", singleTodoRouter);

    // @STEP 处理所有todo
    // /todos
    var multiTodoRouter = require("express").Router();
    // 获取所有的Todo
    ////todoS_Router.get("/", todo.getAll);
    // 删除所有的Todo
    ////todoS_Router.delete("/", todo.deleteAll);

    // TODO 添加时间范围
    // /todos/${name=?}             /todos?name=‘沈宁‘
    // /todos/${workerID=?}         /todoe?workerID=1

    // 获取某个Worker的所有Todo by workerName/workerID
    ////router.get("/?:workerName", todo.findOneByWorkerName);
    // 修改某个Worker的所有Todo by workerName/workerID
    // 删除某个Worker的所有Todo by workerName/workerID

    // /todos/${name=?}/${id=?}
    // /todos/${workerID=?}/${id=?}
    // 获取某个workerName/workerID的单个Todo
    ////router.get("/?:workerName/?:id=", todo.findOneByWorkerName);
    // 修改某个workerName/workerID的单个Todo
    // 删除某个workerName/workerID的单个Todo
    app.use("/todos", multiTodoRouter);
};
