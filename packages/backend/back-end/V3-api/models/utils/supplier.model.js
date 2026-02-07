const { Sequelize,DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    const Supplier = sequelize.define(
        'Supplier',
        {
            rawData:{type:DataTypes.JSON,allowNull:false},
            company:{type:DataTypes.STRING,allowNull:false}
        },
    );

    return Supplier;
};
