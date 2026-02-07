// 这是 每天员工考勤 数据表
// 包含有
// 员工UUID
// 上班时间 年月日24小时制的小时分秒
// 下班时间 年月日24小时制的小时分秒

const { Sequelize, DataTypes, Model } = require("sequelize");
const formateTimeHHMM = require("../../utils/formateTimeHHMM");


module.exports = (sequelize) => {
    class CheckIn extends Model {}

    CheckIn.init(
        {
            user_uuid: {
                type: DataTypes.UUID, // Assuming UUID as the identifier for the Users table
                allowNull: false,
            },
            user_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            checkin_date: {
                type: DataTypes.DATEONLY,
                defaultValue: DataTypes.NOW,
                allowNull: true,
            },
            checkin_time: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: true,
            },
            checkout_time: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            // location_latitude: {
            //   type: DataTypes.DECIMAL(10, 6), // Decimal data type for latitude coordinates
            // },
            // location_longitude: {
            //   type: DataTypes.DECIMAL(10, 6), // Decimal data type for longitude coordinates
            // },
            // location_name: {
            //   type: DataTypes.STRING,
            // },
            note: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            // photo_url: {
            //   type: DataTypes.STRING,
            // },
            // checkin_type: {
            //   type: DataTypes.STRING,
            // },
            // is_public: {
            //   type: DataTypes.BOOLEAN,
            //   defaultValue: true, // Assuming check-ins are public by default
            // },
            // is_approved: {
            //   type: DataTypes.BOOLEAN,
            //   defaultValue: false, // Assuming check-ins require approval and are not approved by default
            // },
            // approval_status: {
            //   type: DataTypes.STRING,
            // },
        },
        {
            // Other model options go here
            sequelize, // We need to pass the connection instance
            modelName: "CheckIn", // We need to choose the model name
            indexes: [
                {
                    unique: true,
                    fields: ["user_name", "checkin_date"],
                },
            ],
        }
    );
    CheckIn.afterUpdate("checkInAfterCreate",  (checkin, options) => {
        console.log("===========================");

        sequelize.models["WebsocketInfo"].create({
            creator: checkin.user_name,
            content: `${checkin.user_name}在${formateTimeHHMM( checkin.checkout_time)}下班了!`,
        });

        console.log("===========================");
    });

    return CheckIn;
};
