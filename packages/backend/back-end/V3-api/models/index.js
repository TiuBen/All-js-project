const { Sequelize, DataTypes } = require("sequelize");
const dbConfig = require("../config/db.config");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.PORT,
    dialect: dbConfig.DIALECT,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    },
    timezone: "+08:00",
    logging: false,
    query:{raw:true}
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// * 添加 不同的 数据 表格 到 数据库中
const User = sequelize.define("user", require("./utils/user.model"));// *    员工
const CheckIn =require('./utils/checkIn.model')(sequelize);// *    考勤
const Company = require('./utils/company.model')(sequelize);// * 这个是 公司信息
const WebSocketInfo=require('./utils/websocketInfo.model')(sequelize);// ! websocket 广播的 数据源
const BusinessCard=require('./utils/businessCard.model')(sequelize);// * 这个是公司业务获取的名片 
db.businessCard=BusinessCard;


// ******** 数据库之间的关系
User.hasMany(CheckIn);
CheckIn.belongsTo(User);
// ******* 数据库之间的关系

// @STEP 每次数据变动后更新数据
// ! do some init work here
const { usersData, companyInfoData } = require("../data/index");
const {
    zhoufenData,
    cuiXiaoRongTimes,
    zhangDaHaiTimes,
    zhangMingYuanTimes,
    wangJuanJuanTimes,
    luoXuHangTimes,
} = require("../data/index");

(async () => {
    // await sequelize.sync({ force: true });
    // await sequelize.sync({ alter: true });
    // // 保存员工数据
    // usersData.forEach(async (x) => {
    //     const user = await User.create(x);
    //     console.log(user.name);
    // });
    // // 保存公司信息
    // companyInfoData.forEach(async (x) => {
    //     const company = await Company.create(x);
    //     console.log(company.fullCompanyName);
    // });
    // const che = [];
    // che[0] = zhoufenData;
    // che[1] = cuiXiaoRongTimes;
    // che[2] = zhangDaHaiTimes;
    // che[3] = zhangMingYuanTimes;
    // che[4] = wangJuanJuanTimes;
    // che[5] = luoXuHangTimes;
    // che.forEach(async (p, index) => {
    //     const name = p.name;
    //     console.log(index + name);
    //     const user = await User.findOne({ where: { name: name } });
    //     if (user) {
    //         const userData=user.dataValues;
    //         for (const [_date, _checktime] of Object.entries(p.attendance)) {
    //             console.log(_date);
    //             console.log( _checktime);
    //             // console.log(JSON.stringify(_checktime));
    //             // console.log(_date + " " + _checktime.checkin+":00");
    //             // console.log(new Date(Date(_date + " " + _checktime.checkout+":00")));
    //             if (_checktime.checkin!==null && _checktime.checkout!==null) {
    //                 await CheckIn.create({
    //                     user_uuid: userData.uuid,
    //                     user_name: userData.name,
    //                     checkin_date: new Date(_date),
    //                     checkin_time:_checktime.checkin? new Date(_date + " " + _checktime.checkin+":00"):null,
    //                     checkout_time:_checktime.checkout? new Date(_date + " " + _checktime.checkout+":00"):null,
    //                     userId: userData.id,
    //                 });
    //             } else {
    //             }
    //         }
    //     } else {
    //         console.log(user);
    //     }
    // });
})();

module.exports = { db, CheckIn, User, Company,WebSocketInfo };
