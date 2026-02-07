const { Sequelize, DataTypes, Model } = require("sequelize");
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

// *TEST Connection
async function TestConnection() {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

TestConnection();

const  CONST_VALUES=require('../assert/CONST.js');


const db=require('../models/index.js');

 function TestModel() {
     console.log("TestModel")
    db.worker.sync().then(()=>{
        db.worker.create(CONST_VALUES.nullWorker);
    });
}
TestModel();


