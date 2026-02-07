// const RawQuestionFilesDir="C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/atctiku/rawFiles/qustionFiles"

const RawQuestionFilesDir =
    "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/atctiku/rawFiles/qustionFiles/Test";

const RawAnswerFilesDir = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/atctiku/rawFiles/answerFiles";

const RawEngSelectionAnswerFile =
    "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/atctiku/rawFiles/answerFiles/英语单选题答案.csv";

const { Sequelize, DataTypes, Model } = require("sequelize");

const pureQModel = {
    num: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    qId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    rawNum: {
        type: DataTypes.STRING,
    },
    txt: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    A: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    B: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    C: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    D: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    rightAns: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: true,
    },
};

const SECTIONS = [
    "航空气象",
    "空中导航",
    "通信、导航和监视设备",
    "飞行原理",
    "航空器及应用",
    "航空情报",
    "空中交通管制一般规定",
    "空域",
    "人为因素",
    "通用航空",
    "机场管制",
    "进近管制",
    "进近雷达管制",
    "区域管制",
    "区域雷达管制",
    "飞行服务",
    "运行监控（地区)",
    "运行监控（民航局）",
    "特殊技能ADS-B",
    "机坪管制",
    "英语单选",
    // "英语阅读"
];

module.exports = { RawAnswerFilesDir, RawQuestionFilesDir,RawEngSelectionAnswerFile,pureQModel,SECTIONS };
