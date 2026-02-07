const { Sequelize, DataTypes, Model } = require("sequelize");

const companyModel = {
    fullCompanyName: { type: DataTypes.STRING },
    companyAbbreviation: { type: DataTypes.STRING },
    englishName: { type: DataTypes.STRING },
    logo: { type: DataTypes.TEXT },
    businessAddress: { type: DataTypes.STRING },
    telephone: { type: DataTypes.STRING },
    bankName: { type: DataTypes.STRING },
    bankAccountNumber: { type: DataTypes.STRING },
    legalRepresentative: { type: DataTypes.STRING },
    companyIntroduction: { type: DataTypes.STRING },
    officialSeal: { type: DataTypes.STRING },
    businessLicense: { type: DataTypes.STRING },
    taxpayerIdentificationNumber: { type: DataTypes.STRING },
    companyName: { type: DataTypes.STRING },
    companyAddress: { type: DataTypes.STRING },
};

module.exports = { companyModel };
