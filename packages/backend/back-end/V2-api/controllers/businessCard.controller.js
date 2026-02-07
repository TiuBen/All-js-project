const { Op } = require("sequelize");
const {db} = require("../models/index");
const BusinessCardTable = db.businessCard;

// Function to create a new business card entry
async function createOne(req,res) {
    // console.log(req.body);
    try {
      const newBusinessCard = await BusinessCardTable.create(req.body);
      res.status(200).json (newBusinessCard);
    } catch (error) {
      console.error('Error creating business card:', error);
      res.status(500).json (error);
    }
  }
  
  // Function to delete a business card entry
  async function deleteOne(req,res) {
    console.log(req.query);
    try {
      const deletedBusinessCard = await BusinessCardTable.destroy({
        where: { uuid:req.query.uuid },
      });
      res.status(200).json( deletedBusinessCard);
    } catch (error) {
      console.error('Error deleting business card:', error);
      throw error;
    }
  }
  
  // Function to update a business card entry
  async function updateOne(req,res) {
    console.log(req.body);
    try {
      const updatedBusinessCard = await BusinessCardTable.update(req.body, {
        where: { uuid:req.body.uuid },
      });
      res.status(200).json( updatedBusinessCard);
    } catch (error) {
      console.error('Error updating business card:', error);
      throw error;
    }
  }
  
  // Function to read a single business card entry by ID
  async function getOne(id) {
    try {
      const businessCard = await BusinessCardTable.findByPk(id);
      return businessCard;
    } catch (error) {
      console.error('Error reading business card:', error);
      throw error;
    }
  }
  
  async function getAll(req,res) {
    try {
      const businessCard = await BusinessCardTable.findAll();
      return res.json( businessCard);
    } catch (error) {
      console.error('Error reading business card:', error);
      res.status(500).json(error)
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