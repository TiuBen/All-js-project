// 一个员工的信息
// 姓名 年龄 身份证号码 社保号码 工资 入职时间 合同编号 所属company(用哪个公司交社保) 所参与的project 紧急联系人
const { Sequelize,DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    const Todo = sequelize.define(
        'Todo',
        {
            workerID: { type: DataTypes.STRING,defaultValue:"默认员工" }, // 谁创建的
            title:{type:DataTypes.STRING,defaultValue:"标题"},// 内容
            content:{type:DataTypes.STRING,defaultValue:"写点什么吧"},// 内容
            tags:{type:DataTypes.STRING,defaultValue:"灵感" },// 标签
        },
    );

    return Todo;
};
