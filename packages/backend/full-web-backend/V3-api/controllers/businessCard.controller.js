const { log } = require("console");
const { Op } = require("sequelize");
const { db } = require("../models/index");
const BusinessCardTable = db.businessCard;
const multer = require("multer");

const SaveFile = require("../utils/SaveFile").SaveFile.fields([
    { name: "img", maxCount: 5 },
    { name: "frontImg", maxCount: 1 },
    { name: "backImg", maxCount: 1 },
]);
const PublicFolder = require("../utils/SaveFile").PublicFolder;

// Function to create a new business card entry
async function createOne(req, res) {
    console.log("create one ");

    console.log("body");
    console.log(req.body);
    console.log("files");
    console.log(req.files);
    console.log(req.files?.backImg);

    try {
        if (req?.files?.frontImg) {
            console.log(
                req.files.frontImg[0].destination.replace(PublicFolder, "") + "/" + req.files.frontImg[0].filename
                );
            req.body.frontImg =
                req.files.frontImg[0].destination.replace(PublicFolder, "") + "/" + req.files.frontImg[0].filename;
        
        }
        if (req.files?.backImg) {
            console.log(
                req.files.backImg[0].destination.replace(PublicFolder, "") + "/" + req.files.backImg[0].filename
                );
            req.body.backImg =
                req.files.backImg[0].destination.replace(PublicFolder, "") + "/" + req.files.backImg[0].filename;
        }
        const newBusinessCard = await BusinessCardTable.create(req.body);
        res.status(200).send(newBusinessCard);
    } catch (error) {
        console.error("Error creating business card:", error);
        res.status(500).json(error);
    }
}

// Function to delete a business card entry
async function deleteOne(req, res) {
    try {
        console.log(req.query.id);
        const deletedBusinessCard = await BusinessCardTable.destroy({
            where: { uuid: req.query.id },
        });
        res.status(200).json(deletedBusinessCard);
    } catch (error) {
        console.error("Error deleting business card:", error);
        throw error;
    }
}

// Function to update a business card entry
async function updateOne(req, res) {
    console.log(req.body);
    try {
        if (req?.files?.frontImg) {
            console.log(
                req.files.frontImg[0].destination.replace(PublicFolder, "") + "/" + req.files.frontImg[0].filename
                );
            req.body.frontImg =
                req.files.frontImg[0].destination.replace(PublicFolder, "") + "/" + req.files.frontImg[0].filename;
        
        }
        if (req.files?.backImg) {
            console.log(
                req.files.backImg[0].destination.replace(PublicFolder, "") + "/" + req.files.backImg[0].filename
                );
            req.body.backImg =
                req.files.backImg[0].destination.replace(PublicFolder, "") + "/" + req.files.backImg[0].filename;
        }
        const updatedBusinessCard = await BusinessCardTable.update(req.body, {
            where: { uuid: req.body.uuid },
        });
        res.status(200).json(updatedBusinessCard);
    } catch (error) {
        console.error("Error updating business card:", error);
        throw error;
    }
}

// Function to read a single business card entry by ID
async function getOne(id) {
    try {
        const businessCard = await BusinessCardTable.findByPk(id);
        return businessCard;
    } catch (error) {
        console.error("Error reading business card:", error);
        throw error;
    }
}

async function getAll(req, res) {
    try {
        const businessCard = await BusinessCardTable.findAll();
        return res.status(200).json(businessCard);
    } catch (error) {
        console.error("Error reading business card:", error);
        res.status(500).json(error);
        throw error;
    }
}

module.exports = {
    createOne,
    deleteOne,
    updateOne,
    getOne,
    getAll,
};
