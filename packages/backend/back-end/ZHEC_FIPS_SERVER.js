const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes, Model } = require("sequelize");
const { getAnswers, ans1path } = require("./answerToDb");
const fs = require("fs");

const app = express();
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// model 部分
// controller 部分
// router 部分

const sequelize = new Sequelize("zhecfips", "root", "root1234", {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    timezone: "+08:00",
    logging: false,
    query: { raw: true },
});

const pureModel = {
    date: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    taskType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    callsign: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    departureAirport: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    destinationAirport: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    landingAirport: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    takeoffTime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sobt: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eobt: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    atot: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sibt: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    eldt: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    aldt: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    entranceWayPoint: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    runwayNum: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    standNum: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    aircraftType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
};

const _202401 = sequelize.define("202401月", pureModel, {
    timestamps: false,
    freezeTableName: true,
});
const _202402 = sequelize.define("202402月", pureModel, {
    timestamps: false,
    freezeTableName: true,
});

const _202403 = sequelize.define("202403月", pureModel, {
    timestamps: false,
    freezeTableName: true,
});
const _202404 = sequelize.define("202404月", pureModel, {
    timestamps: false,
    freezeTableName: true,
});
const all = sequelize.define("all", pureModel, {
      timestamps: false,
      freezeTableName: true,
  });
  

// (async () => {
//     await sequelize.sync();
// })();

//
app.post("/fips", async (req, res) => {
    const rawQuery = req.query;
    console.log(req.body);

    try {
        const _1 = await _202401.findAll(req.body);
        res.send(_1);
    } catch (error) {
        console.log(error);
    }
});

app.get("/fips", async (req, res) => {
      const rawQuery = req.query;
      console.log(req.body);
  
      try {
          const _all = await all.findAll(req.body);
          res.send(_all);
      } catch (error) {
          console.log(error);
      }
  });
  

const port = 3104;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
