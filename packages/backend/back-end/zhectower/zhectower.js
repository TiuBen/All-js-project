const express = require("express");
// const https = require('https');
// const fs = require('fs');
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
// const options = {
//     key: fs.readFileSync('./.cert/key.pem'),
//     cert: fs.readFileSync('./.cert/rootCA.pem'),
//   };
  



app.use(cors());
app.options("*", cors());
app.use(bodyParser.json( {limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
// Middleware to parse text/plain request bodies
// app.use(express.text({ limit: '10mb' }));


// const { serverActions } = require("./utils/CONST");

app.use(express.static("public"));
app.use("/public", express.static(__dirname + +"/"+"public"));
// app.use("/public/日常照片", express.static(__dirname + +"/"+"public/日常照片"));
// console.log(`${__dirname}/assert/`);
// console.log(`${__dirname}/assert/`);


// const { GetWhoIsOnDuty } = require("./lib/GetWhoIsOnDuty");
// const { TakeOverTheJob } = require("./lib/TakeOverTheJob");
// const { PrepareForTheJob } = require("./lib/PrepareForTheJob");
// const { GetWhoIsPrepared } = require("./lib/GetWhoIsPrepared");
// const { GetThisPosition } = require("./lib/GetThisPosition");

// const db = require("./utils/SqliteDb");
// db.all("SELECT * FROM prepare", [], (err, rows) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log(rows);
//     rows.forEach((row) => {
//         console.log(row);
//     });
// });

// db.close((err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log("Close the database connection.");
// });

const prepare=require("./routes/prepare.route");
app.use("/prepare", prepare);
const duty=require("./routes/duty.route");
app.use("/duty", duty);
const statistics=require("./routes/statistics.route");
app.use("/statistics", statistics);
// const compare=require("./routes/auth.route");
// app.use("/auth", compare);
// const upload=require("./routes/upload.route");
// app.use("/upload", upload);

app.use("/test", (req, res) => {
  console.log("test");
    res.send({
      username:"shenning"
    });
});


//! 管制员 执照部分的路由
// const atcLicenseExam=require("./routes/atcLicenseExam.route");
// app.use("/atcLicense/license/exam", atcLicenseExam);

// const server = https.createServer(options, app);

// const {_matchAns}=require('./utils/run2atcexam2ans');
// _matchAns();

// const {TTTTTT}=require('./lib/GetWhoIsOnDuty')
//  TTTTTT();

// const {_calTimeDurationArray}=require("./controller/statisticsV2.controller")
//  _calTimeDurationArray("沈宁","2024-11-15","2024-11-30","00:00:00","23:59:59");

// app.use("/", async (req, res) => {
//     // console.log(req.body);
//     const payload = req.body;
//     const ACTION = req.body.action;
//     // console.log(ACTION);
//     switch (ACTION) {
//         // case serverActions.GetWhoIsOnDuty:
//         //     const data = await GetWhoIsOnDuty(payload);
//         //     res.send(data);
//         //     break;
//         // case serverActions.TakeOverTheJob:
//         //     console.log("TakeOverTheJob");
//         //     const data2 = await TakeOverTheJob(payload);
//         //     console.log("data2" + JSON.stringify(data2));
//         //     res.send(data2);
//         //     break;
//         case serverActions.PrepareForTheJob:
//             console.log("PrepareForTheJob");
//             const data3 = await PrepareForTheJob(payload);
//             console.log("data3" + JSON.stringify(data3));
//             res.send(data3);
//             break;
//         case serverActions.GetWhoIsPrepared:
//             const data4 = await GetWhoIsPrepared(payload);
//             console.log("data4" + JSON.stringify(data4));
//             res.send(data4);
//             break;
//         case serverActions.GetThisPosition:
//             const data5 = await GetThisPosition(payload);
//             console.log("data5" + JSON.stringify(data5));
//             res.send(data5);
//             break;

//         case "READ_ENGLISH_ANS_TO_DB":
//             readEngAnsToDb(RawEngSelectionAnswerFile);
//             break;
//         default:
//             res.send("OK");
//             break;
//     }
// });

const port = 3104;
// server.listen(port,() => {
//     console.log(`Server is running on port ${port}`);
// });
app.listen(port,() => {
  console.log(`Server is running on port ${port}`);
});
