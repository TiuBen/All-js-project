// 一个员工的信息
// 姓名 年龄 身份证号码 社保号码 工资 入职时间 合同编号 所属company(用哪个公司交社保) 所参与的project 紧急联系人
const { Sequelize, DataTypes, Model } = require("sequelize");

const userModel = {
    // * 简单信息
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, unique: true }, //员工姓名
    sex: { type: DataTypes.ENUM("男", "女") }, //员工性别
    personalPhone: { type: DataTypes.STRING }, //个人电话号码
    email: { type: DataTypes.STRING }, // * 邮箱 可以有多个邮箱 然后用;分隔
    // 公司分配的资源
    expressAddress: { type: DataTypes.STRING }, // 快递收件地址
    companyPhone: { type: DataTypes.STRING }, //公司分配电话号码
    companyEmail: { type: DataTypes.STRING }, //公司分配邮箱号码
    job: { type: DataTypes.STRING }, //职务

    // 紧急情况
    emergencyContact: { type: DataTypes.STRING }, //紧急联系人
    emergencyContactRelation: { type: DataTypes.STRING }, //紧急联系人关系
    emergencyPhone: { type: DataTypes.STRING }, //紧急电话号码
    emergencyAddress: { type: DataTypes.STRING }, //紧急联系地址

    // 丰富个人信息
    IDCardNo: { type: DataTypes.STRING }, // 身份证号码
    avatar: { type: DataTypes.TEXT("long") }, //头像base64

    // * 非必要信息 但是属于员工和公司之间的
    salary: { type: DataTypes.FLOAT }, // 薪酬
    entryDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, // 入职时间
    contractID: { type: DataTypes.STRING }, //合同编号
    SSCardNo: { type: DataTypes.STRING }, // 社保卡号码哦

    //系统权限
    permissions: {
        type: DataTypes.STRING,
        // set(val) {
        //     this.setDataValue('permission',val.join(";"));
        //  },
        //  get() {
        //     return this.getDataValue('permission').split(";")
        // },
    }, //系统权限

    // 密码
    password: { type: DataTypes.STRING, defaultValue: "123456" }, // 密码
};

module.exports =  userModel ;
