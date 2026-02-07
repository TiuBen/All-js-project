const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    const Supplier = sequelize.define("quotation", {
        itemName: { type: DataTypes.STRING, defaultValue: "风扇", allowNull: false },
        neederName: { type: DataTypes.STRING, defaultValue: "顾客", allowNull: false },
        supplierName: { type: DataTypes.STRING, defaultValue: "鼎道工厂", allowNull: false },
        specification: { type: DataTypes.STRING, defaultValue: "风扇", allowNull: true },
        itemDetail: { type: DataTypes.STRING, defaultValue: "长宽高数量", allowNull: false },
        getPrice: { type: DataTypes.FLOAT, defaultValue: 0.1, allowNull: false },
        salePrice: { type: DataTypes.FLOAT, defaultValue: 0.2, allowNull: false },
        quotationStaff: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        quotationTime: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
        targetProfit: { type: DataTypes.FLOAT, allowNull: false },
        reviewOpinion: { type: DataTypes.STRING, allowNull: false },
        supplement: { type: DataTypes.STRING, allowNull: true },
        ourCompanyName: { type: DataTypes.STRING, defaultValue: "鼎道" },
    });

    return Supplier;
};
