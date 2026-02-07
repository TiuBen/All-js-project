const Sequelize = require("sequelize");

const dbConfig = require("../config/db.config.js");
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
});


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 添加 不同的 数据 表格 到 数据库中
db.worker = require("./Worker.model.js")(sequelize);
db.todo = require("./todo.model.js")(sequelize);
db.supplier = require('./supplier.model')(sequelize);
db.quotation = require('./')
module.exports = db;
