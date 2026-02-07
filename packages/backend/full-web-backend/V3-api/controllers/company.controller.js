const { Op } = require("sequelize");
const {Company} = require("../models/index");


// Find a single company by ID
exports.getOne = async (req, res) => {
    console.log(req.query);
    try {
        const company = await Company.findOne({ where: { fullCompanyName: {[Op.substring] :req.query.name} } });
        console.log("company");
        console.log(company.dataValues);
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
// Find all companies
exports.getAll = async (req, res) => {
    console.log(req.params);
    try {
        const companies = await Company.findAll();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
// Update a company by ID
exports.updateOne = async (req, res) => {
    try {
        const company = await Company.findOne({ where: { id: req.params.id } });
        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        // !Update the company attributes
        company.fullCompanyName = req.body.FullCompanyName;
        company.companyAbbreviation = req.body.CompanyAbbreviation;
        company.englishName = req.body.EnglishName;
        //! Update other attributes as needed

        await company.save();
        res.json(company);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
