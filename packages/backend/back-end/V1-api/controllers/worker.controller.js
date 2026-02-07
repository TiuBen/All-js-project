const db = require("../models/index.js");
const CONST_VALUES=require('../assert/CONST');
const WorkerTable = db.worker;
const Op = db.Sequelize.Op;


// create and save a new worker
exports.create = (req, res) => {
    // Validate request
    console.log("**************");
    console.log(req.body);
    console.log("**************");
    if (!req.body.name) {
        res.status(400).send({
            message: "新建员工失败",
        });
        return;
    }

    // Create a worker
    const _worker = {
        name: req.body.name,
        sex: req.body.sex,
        phone: req.body.phone,
        age: req.body.age,
        IDCardNo: req.body.IDCardNo,
        SSCardNo: req.body.SSCardNo,
        salary: req.body.salary,
        entryDate: req.body.entryDate,
        contractID: req.body.contractID,
        emergencyContact: req.body.emergencyContact,
        avatar:req.body.avatar
    };

    // Save worker to the WorkerTable
    WorkerTable.create(_worker)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the Worker.",
            });
        });
};

// Retrieve all Workers from database
exports.findAll = (req, res) => {
    WorkerTable.findAll({ where: null }) // MARK
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Workers.",
            });
        });
};

// Find a single Worker with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    WorkerTable.findByPk(id)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error retrieving Worker with id=" + id,
            });
        });
};

// Update a Worker by the id in the request
exports.update = (req, res) => {
    const id = req.params.id;

    WorkerTable.update(req.body, {
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "Worker was updated successfully.",
                });
            } else {
                res.send({
                    message: `Cannot update Worker with id=${id}. Maybe Worker was not found or req.body is empty!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Error updating Worker with id=" + id,
            });
        });
};

// Delete a Worker with the specified id in the request
exports.delete = (req, res) => {
    const id = req.params.id;

    WorkerTable.destroy({
        where: { id: id },
    })
        .then((num) => {
            if (num == 1) {
                res.send({
                    message: "Worker was deleted successfully!",
                });
            } else {
                res.send({
                    message: `Cannot delete Worker with id=${id}. Maybe Worker was not found!`,
                });
            }
        })
        .catch((err) => {
            res.status(500).send({
                message: "Could not delete Worker with id=" + id,
            });
        });
};

// Delete all Worker from the database.
exports.deleteAll = (req, res) => {
    WorkerTable.destroy({
        where: {},
        truncate: false,
    })
        .then((nums) => {
            res.send({ message: `${nums} Worker were deleted successfully!` });
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "Some error occurred while removing all Worker.",
            });
        });
};
