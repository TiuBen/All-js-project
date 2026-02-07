const db = require("../models/index.js");
const TodoTable = db.todo;
const Op = db.Sequelize.Op;


const nullTodo = {
        workerID: 1, // 谁创建的
        content:"写点什么要做的吧",// 内容
        tags:"灵感",// 标签
};

// create and save a new Todo
exports.createOne = (req, res) => {
    // Validate request
    if (!req.body.content) {
        res.status(400).send({
            message: "新建Todo失败",
        });
        return;
    }

    // Create a Todo
    const _todo = {
        workerID: req.body.workerID,
        title:req.body.title,
        content:req.body.content,
        tags:req.body.tags
    };

    // Save Todo to the Todo
    TodoTable.create(_todo)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Todo.",
            });
        });
};

// Retrieve all Todo from database
exports.findAll = (req, res) => {
    TodoTable.findAll({ where: {workerID:req.params.workerID } }) // MARK
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Todo.",
            });
        });
};

// Find a single Todo with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    TodoTable.findByPk(id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error retrieving Todo with id=" + id,
            });
        });
};

// Update a Todo by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    TodoTable.update(req.body, {
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "Todo was updated successfully.",
                });
            } else {
                res.send({
                    message: `Cannot update Todo with id=${id}. Maybe Todo was not found or req.body is empty!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error updating Todo with id=" + id,
            });
        });
};

// Delete a Todo with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    TodoTable.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "Todo was deleted successfully!",
                });
            } else {
                res.send({
                    message: `Cannot delete Todo with id=${id}. Maybe Todo was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete Todo with id=" + id,
            });
        });
};

// Delete all Todo from the database.
exports.deleteAll = (req, res) => {
    TodoTable.destroy({
        where: {},
        truncate: false,
    })
        .then((nums) => {
            res.send({ message: `${nums} Todo were deleted successfully!` });
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all Todo.",
            });
        });
};
