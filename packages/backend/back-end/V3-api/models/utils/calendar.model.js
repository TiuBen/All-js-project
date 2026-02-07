// 日历页面 记录 每个员工 每天的任务
// 时间，创建者，参与者，标题，内容（内容是否可以反向映射为表单或者其他东西？），附件，地点，

const { Sequelize, DataTypes, Model } = require("sequelize");
const formateTimeHHMM = require("../../utils/formateTimeHHMM");

module.exports = (sequelize) => {
    class Todo extends Model {}

    Todo.init(
        {
            user_uuid: {
                type: DataTypes.UUID, // Assuming UUID as the identifier for the Users table
                allowNull: false,
            },
            role:{
                  type:DataTypes.ENUM("创建者","参与者","审核员"),
                  defaultValue:"创建者"
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
            },
            dueDate: {
                type: DataTypes.DATE,
            },
            completed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            // Other model options go here
            sequelize, // We need to pass the connection instance
            modelName: "Todo", // We need to choose the model name
        }
    );
  

    return Todo;
};
