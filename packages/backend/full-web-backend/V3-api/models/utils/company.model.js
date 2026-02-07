const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    class Company extends Model {}

    Company.init(
        {
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
        },
        {
            // Other model options go here
            sequelize, // We need to pass the connection instance
            modelName: "Company", // We need to choose the model name
        }
    );

    return Company;
};
