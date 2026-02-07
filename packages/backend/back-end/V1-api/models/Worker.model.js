// 一个员工的信息
// 姓名 年龄 身份证号码 社保号码 工资 入职时间 合同编号 所属company(用哪个公司交社保) 所参与的project 紧急联系人
const { Sequelize,DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
    const Worker = sequelize.define(
        'Worker',
        {
            name: { type: DataTypes.STRING }, //员工姓名
            sex: { type: DataTypes.ENUM("男", "女") }, //员工性别
            age: { type: DataTypes.INTEGER }, //员工年龄 TODO  通过 ID 身份证号码计算出
            avatar:{type:DataTypes.TEXT('long') },//头像base64
            email: { type: DataTypes.STRING }, //邮箱
            job: { type: DataTypes.STRING }, //职务
            permission: { type: DataTypes.ARRAY(DataTypes.STRING) }, //系统权限
            personalPhone: { type: DataTypes.STRING }, //个人电话号码
            companyPhone: { type: DataTypes.STRING }, //公司电话号码
            IDCardNo: { type: DataTypes.STRING }, // 身份证号码
            SSCardNo: { type: DataTypes.STRING }, // 社保卡号码哦
            salary: { type: DataTypes.FLOAT }, // 薪酬
            entryDate: { type: DataTypes.DATE }, // 入职时间
            contractID: { type: DataTypes.STRING }, //合同编号
            emergencyContact: { type: DataTypes.STRING }, //紧急联系人
            emergencyPhone: { type: DataTypes.STRING }, //紧急电话号码
            address: { type: DataTypes.STRING }, //家庭住址
            // email:{}
            // companyPhone:{} // 公司资产部分ß
        },
    );

    return Worker;
};
