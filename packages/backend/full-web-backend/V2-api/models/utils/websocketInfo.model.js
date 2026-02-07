const { Sequelize, DataTypes, Model } = require("sequelize");
const sequelize = require("../index");

// * 全系统发送的通知

class WebsocketInfo extends Model {}


module.exports = (sequelize) => {

    WebsocketInfo.init(
        {
            creator: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            content: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            readed: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            // Other model options go here
            sequelize, // We need to pass the connection instance
            modelName: "WebsocketInfo", // We need to choose the model name
        }
    );




    return WebsocketInfo;
};
