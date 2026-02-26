const { Sequelize, DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    const atctiku = sequelize.define("atctiku", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        num: {
            type: DataTypes.STRING,
        },
        qId: {
            type: DataTypes.STRING,
        },
        rawNum: {
            type: DataTypes.STRING,
        },
        txt: {
            type: DataTypes.STRING,
        },
        A: {
            type: DataTypes.STRING,
        },
        B: {
            type: DataTypes.STRING,
        },
        C: {
            type: DataTypes.STRING,
        },
        D: {
            type: DataTypes.STRING,
        },
        rightAns: {
            type: DataTypes.STRING,
        },
    });

    return businessCard;
};
