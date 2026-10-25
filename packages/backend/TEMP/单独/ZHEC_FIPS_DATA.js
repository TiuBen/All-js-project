/* 这个文件是用来处理FIPS数据的 */
/* 1 EXCEL 读取到数据库 */
/* 2 处理数据 */

var XLSX = require("xlsx");
const fs = require("node:fs");

const testFilePath = "C:/Users/HJW-AMD-PRP/Desktop/航班流量跑道/1月/20240101流量明细.xls";

// @STEP1 获取到了CSV格式的文件

// 获取到了CSV格式的文件
// @STEP 创建数据库 table 格式

const mysql = require("mysql2");
// 创建连接
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "root1234",
    database: "zhecfips",
    keepAliveInitialDelay: 30000, // 3s
    enableKeepAlive: true,
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL database:", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

// 进出时间 系统计算的 如果在某日的数据里有 则这个航班实际发生在今日
// SOBT EOBT 之间还是有差别 应该以EOBT为 实际的起飞时间 特别是 EOBT里面还有日期

// 想要计算得到什么数据
// 走廊口的分布
// 某某目的地到某某目的地的航班平均飞行时间

// ATOT Actual Take-Off Time 实际起飞时
// CTOT Calculated Take-Off Time 计算起飞时间
// EOBT Estimated Off-Block Time 预计撤轮挡时间
// ETOT Estimated Take-Off Time 预计起飞时间
// SOBT Scheduled Off-Block Time 计划撤轮挡时刻
function processFile(filePath) {
    const [fileName] = filePath.split("\\").slice(-1);
    console.log("fileName:" + fileName);
    const dbTableName = fileName.slice(0, 6);
    //     const date = fileName.slice(6, 8);
    //     console.log("dbTableName:"+dbTableName);
    //     console.log("date:"+fileName+":"+date);

    var workbook = XLSX.readFile(filePath, { codepage: 936 });
    const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
    const csvFile = XLSX.utils.sheet_to_csv(sheet1);
    const csvFileLines = csvFile.split("\n");

    //     console.log(` INSERT INTO zhecfips.${dbTableName} `);

    for (let index = 1; index < csvFileLines.length; index++) {
        const oneLine = csvFileLines[index];
        const oneLineArray = oneLine.split(",");
        const insertSQL = ` INSERT INTO zhecfips.${dbTableName}月 (date, taskType, callsign, departureAirport, destinationAirport, landingAirport, takeoffTime, sobt, eobt, atot, sibt, eldt, aldt, entranceWayPoint, runwayNum, standNum, aircraftType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        const date = fileName.slice(6, 8);
        const taskType = oneLineArray[0] || "";
        const callsign = oneLineArray[1] || "";
        const departureAirport = oneLineArray[2] || "";
        const destinationAirport = oneLineArray[3] || "";
        const landingAirport = oneLineArray[4] || "";
        const takeoffTime = oneLineArray[5] || "";
        const sobt = oneLineArray[6] || "";
        const eobt = oneLineArray[7] || "";
        const atot = oneLineArray[8] || "";
        const sibt = oneLineArray[9] || "";
        const eldt = oneLineArray[10] || "";
        const aldt = oneLineArray[11] || "";
        const entranceWayPoint = oneLineArray[12] || "";
        const runwayNum = oneLineArray[13] || "";
        const standNum = oneLineArray[14] || "";
        const aircraftType = oneLineArray[15] || "";
        const VALUE = [
            date,
            taskType,
            callsign,
            departureAirport,
            destinationAirport,
            landingAirport,
            takeoffTime,
            sobt,
            eobt,
            atot,
            sibt,
            eldt,
            aldt,
            entranceWayPoint,
            runwayNum,
            standNum,
            aircraftType,
        ];

        //   console.log(oneLineArray);
        connection.execute(insertSQL, VALUE, (err, result, fields) => {
            if (err instanceof Error) {
                console.error("createTableSQL" + err);
                return;
            }
        });
    }
}

// @STEP1 存到数据库

function saveExcelFiletToDB(filePath) {
    const [fileName] = filePath.split("\\").slice(-1);
    const dbTableName = fileName.slice(0, 6);

    // 任务,航班号,起飞站,目的站,落地站,进/出时间,SOBT,EOBT,ATOT,SIBT,ELDT,ALDT,走廊口,跑道,停机位,机型
    const createTableSQL = ` CREATE TABLE IF NOT EXISTS zhecfips.${dbTableName}月 (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(20),
      taskType VARCHAR(10),
      callsign VARCHAR(20),
      departureAirport CHAR(4),
      destinationAirport CHAR(4),
      landingAirport VARCHAR(20),
      takeoffTime VARCHAR(20),
      sobt VARCHAR(20),
      eobt VARCHAR(20),
      atot VARCHAR(20),
      sibt VARCHAR(20),
      eldt VARCHAR(20),
      aldt VARCHAR(20),
      entranceWayPoint VARCHAR(20),
      runwayNum VARCHAR(20), 
      standNum VARCHAR(20), 
      aircraftType VARCHAR(20)
  );`;

    connection.query(createTableSQL, (err, result) => {
        if (err instanceof Error) {
            console.error("createTableSQL" + err);
            return;
        } else {
            // console.log("Table created successfully!");
        }
    });
    processFile(filePath);
}

const path = require("path");
const { log } = require("node:console");
// @STEP3 循环读取文件夹
function readdir(dirPath) {
    const subDirs = fs.readdirSync(dirPath);
    //     console.log(subDirs);
    subDirs.forEach(function (subDir) {
        const subDirPath = path.join(dirPath, subDir);
        const stat = fs.statSync(subDirPath);
        if (stat.isDirectory()) {
            readdir(subDirPath);
        } else {
            // console.log(subDirPath);
            //!! 处理文件
            const [monthNum, fileName] = subDirPath.split("\\").slice(-2);
            // console.log(monthNum,fileName);
            console.log(fileName.slice(0, 6));
            saveExcelFiletToDB(subDirPath);
        }
    });
}

function saveExcelFiletToDBSingleTable(filePath) {
    console.log(filePath);
    //! 数据库中 ALL TABLE 已经存在
    const [monthNum, fileName] = filePath.split("\\").slice(-2);
    const [date] = fileName.match(/^\d+/);
    console.log("fileName:" + typeof date + " :" + String(date) + " :" + date);

    var workbook = XLSX.readFile(filePath, { codepage: 936 });
    const sheet1 = workbook.Sheets[workbook.SheetNames[0]];
    const csvFile = XLSX.utils.sheet_to_csv(sheet1);
    const csvFileLines = csvFile.split("\n");

    //     console.log(` INSERT INTO zhecfips.${dbTableName} `);

    for (let index = 1; index < csvFileLines.length; index++) {
        const oneLine = csvFileLines[index];
        const oneLineArray = oneLine.split(",");
        const insertSQL = ` INSERT INTO zhecfips.all (date, taskType, callsign, departureAirport, destinationAirport, landingAirport, takeoffTime, sobt, eobt, atot, sibt, eldt, aldt, entranceWayPoint, runwayNum, standNum, aircraftType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        // !!

        // !!
        const taskType = oneLineArray[0] || "";
        const callsign = oneLineArray[1] || "";
        const departureAirport = oneLineArray[2] || "";
        const destinationAirport = oneLineArray[3] || "";
        const landingAirport = oneLineArray[4] || "";
        const takeoffTime = oneLineArray[5] || "";
        const sobt = oneLineArray[6] || "";
        const eobt = oneLineArray[7] || "";
        const atot = oneLineArray[8] || "";
        const sibt = oneLineArray[9] || "";
        const eldt = oneLineArray[10] || "";
        const aldt = oneLineArray[11] || "";
        const entranceWayPoint = oneLineArray[12] || "";
        const runwayNum = oneLineArray[13] || "";
        const standNum = oneLineArray[14] || "";
        const aircraftType = oneLineArray[15] || "";
        const VALUE = [
            date,
            taskType,
            callsign,
            departureAirport,
            destinationAirport,
            landingAirport,
            takeoffTime,
            sobt,
            eobt,
            atot,
            sibt,
            eldt,
            aldt,
            entranceWayPoint,
            runwayNum,
            standNum,
            aircraftType,
        ];

        //   console.log(oneLineArray);
        connection.execute(insertSQL, VALUE, (err, result, fields) => {
            if (err instanceof Error) {
                console.error("createTableSQL" + err);
                return;
            }
        });
    }
}

const delSQL = `DELETE FROM zhecfips.all`;
connection.query(delSQL, (err, result, fields) => {
    if (err instanceof Error) {
        console.error("DELETE" + err);
        return;
    }
});

const createTableSQL = ` CREATE TABLE IF NOT EXISTS zhecfips.all (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date VARCHAR(20),
      taskType VARCHAR(10),
      callsign VARCHAR(20),
      departureAirport CHAR(4),
      destinationAirport CHAR(4),
      landingAirport VARCHAR(20),
      takeoffTime VARCHAR(20),
      sobt VARCHAR(20),
      eobt VARCHAR(20),
      atot VARCHAR(20),
      sibt VARCHAR(20),
      eldt VARCHAR(20),
      aldt VARCHAR(20),
      entranceWayPoint VARCHAR(20),
      runwayNum VARCHAR(20), 
      standNum VARCHAR(20), 
      aircraftType VARCHAR(20)
  );`;

connection.query(createTableSQL, (err, result) => {
    if (err instanceof Error) {
        console.error("createTableSQL" + err);
        return;
    } else {
        console.log("Table created successfully!");
    }
});

function readAllFileThenSaveToDbSingleTable(dirPath) {
    var count = 0;
    const subDirs = fs.readdirSync(dirPath);
    //     console.log(subDirs);
    subDirs.forEach(function (subDir) {
        const subDirPath = path.join(dirPath, subDir);
        const stat = fs.statSync(subDirPath);
        if (stat.isDirectory()) {
            readAllFileThenSaveToDbSingleTable(subDirPath);
        } else {
            //!! 处理文件
            console.log("subDirPath " + subDirPath);
            count = count + 1;
            saveExcelFiletToDBSingleTable(subDirPath);
        }
    });
    console.log(count);
}

const DIR_PAHT = "C:/Users/HJW-AMD-PRP/Desktop/航班流量跑道";

// readdir(DIR_PAHT); // !!要执行的话运行一次
readAllFileThenSaveToDbSingleTable(DIR_PAHT);

// console.log(lines.length);
