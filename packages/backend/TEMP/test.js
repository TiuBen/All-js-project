const express = require("express");
var cors = require("cors");
const app = express();
const port = 3100;

app.use(express.json()); // parse requests of content-type - application/json
app.use(express.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded

app.use(cors());

// !TEST 待删除
app.use("/assert", express.static(__dirname + "/assert"));
console.log(`${__dirname}/assert/`);
// !TEST 待删除

const db = require("./models/index.js");
// db.sequelize.sync({ force: true });
db.sequelize.sync();

// @STEP Worker
require("./routes/worker.routes")(app);
// @STEP Todo
require("./routes/todo.routes")(app);

//  保存.获取 文件
// POST /upload: 调用 uploadFiles控制器的功能。
// GET /files 获取/files图像列表。
// GET /files/:name 下载带有文件名的图像。

const multer = require("multer");
const upload2=multer();
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "/Users/shenning/Documents/VSCode/atc-worktime-backend/assert/");
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

// TODO
app.post("/upload", upload.single("avatar"), function (req, res, next) {
    console.log(req.file, req.body);
    res.send("成功了");
    next();
});
// TODO

// !TEST 待删除
function testController(req, res) {
    console.log(res.body);
    res.send({ test: "test" });
}
const testRouter = express.Router();
testRouter.get("/", testController);
app.use("/test", testRouter);
// !TEST 待删除

// !TEST 测试用 POSTMAN这类工具发送的请求
app.all("*" ,(req, res) => {
    console.log("从前端发来的访问,测试用:");
    console.log(req.method+req.originalUrl);
    res.send(req.body)
    console.log("====");
});

// !TEST 测试用 POSTMAN这类工具发送的请求

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});




// const fs = require("fs");
// const path = require("path");
// const csv = require("fast-csv");
// const tools = require("./ ./parseFunctions");
// const convertHTML2PDF = require("./convertHTML2PDF");
// const CRUD = require("./CRUD");
// const ENV = require("./assert/CONST");

//  convertHTML2PDF.testURL("http://localhost:3000/guigesu");
//  convertHTML2PDF.testDOM();

// tools.test();

// const csv = require('csv-parser')
// fs.createReadStream('/Users/shenning/Downloads/湖北指纹统计_202105/守夜值班统计_2021_6_1.csv')
// fs.createReadStream('/Users/shenning/Documents/VSCode/ATC-worktime-cal/值班统计_2021_6_1.csv')
//   .pipe(csv({ separator: ',' }))
//   .on('data', (data) => results.push(data))
//   .on('end', () => {
    // console.log(results);
//     for (let index = 0; index < 10; index++) {
//         const element = results[index];
//     console.log(element);

//     }
    // [
    //   { NAME: 'Daffy Duck', AGE: '24' },
    //   { NAME: 'Bugs Bunny', AGE: '22' }
    // ]
//   });
// const test = require("./Test/csvToSql.js");

// test.testCsvToSql();

// const csv = require("fast-csv");

// fs.createReadStream("/Users/shenning/Documents/VSCode/ATC-worktime-cal/值班统计_2021_6_1.csv")
//     .pipe(csv.parse({ headers: true, ignoreEmpty: false,strictColumnHandling: }))
//     .on("error", (error) => console.error(error))
//     .on("data", (row) => {
//         results.push(row);
//     })
//     .on("end", (rowCount) => {
//         console.log(`Parsed ${rowCount} rows`);
//         for (let index = 0; index < 5; index++) {
//             const element = results[index];
//             console.log(element);
//         }
//     });

// const readline = require("readline");

// const results = [];
// async function processLineByLine(path) {
//     const fileStream = fs.createReadStream(`/Users/shenning/Documents/VSCode/atc-worktime-backend/${path}`);

//     const rl = readline.createInterface({
//         input: fileStream,
//         crlfDelay: Infinity,
//     });
//     // 注意：我们使用 crlfDelay 选项将 input.txt 中的所有 CR LF 实例（'\r\n'）识别为单个换行符。

//     results.length = 0;
//     for await (const line of rl) {
//         // input.txt 中的每一行在这里将会被连续地用作 `line`。
//         // console.log(`Line from file: ${line}`);
//         results.push(line);
//     }
// }

// processLineByLine();

// const express = require("express");
// var cors = require("cors");

// var bodyParser = require("body-parser");
// // const { log } = require("console");
// const app = express();
// const port = 3100;

// app.use(cors());
// app.options('*', cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // var multer = require("multer");
// // var upload = multer({dest:"C:/Users/HJW-AMD-PRP/Documents/"});
// // app.post("/api/v2/file",upload.array('files'),function(req,res){
// //     console.log(req.body);
// //     console.log(req.files);
// //     // res.send()
// // })


// // app.use(upload.array());
// //
// // var options = {
// //     dotfiles: "ignore",
// //     etag: false,
// //     extensions: ["htm", "html", "pdf"],
// //     index: false,
// //     maxAge: "1d",
// //     redirect: false,
// //     setHeaders: function (res, path, stat) {
// //         //   res.setHeader('x-timestamp', Date.now())
// //         console.log("jeader");
// //         res.setHeader("Content-Disposition", "Inline");
// //         res.setHeader("Content-type", "application/pdf");
// //     },
// // };
// app.use(express.static("assert"));
// app.use(express.static("public"));

// // app.get("/file1", async (req, res) => {
// //     console.log(req.params);
// //     await processLineByLine("守夜值班统计_2021_6_1.csv");
// //     res.send(results);
// // });

// // app.get("/file2", async (req, res) => {
// //     console.log(req.params);
// //     await processLineByLine("值班统计_2021_6_1.csv");
// //     res.send(results);
// // });

// // 测试 韩晶威公司 的数据EXCEL的 CSV文件
// // const csvFilePath = "/Users/shenning/Desktop/常用资料/采购订单确认.csv";

// // app.post("/csv", async (req, res) => {
// //     console.log("测试 韩晶威公司 的数据EXCEL的 CSV文件");
// //     var lookUpKey = req.body.lookUpKey;
// //     console.log(lookUpKey);
// //     const rows = [];
// //     fs.createReadStream(csvFilePath)
// //         .pipe(csv.parse({ headers: true }))
// //         .on("error", (error) => console.error(error))
// //         .on("data", (row) => {
// //             rows.push(row);
// //         })
// //         .on("end", (rowCount) => {
// //             console.log(`Parsed ${rowCount} rows`);
// //             //测试
// //             var _test = tools.getKeyValueTypeCount(lookUpKey, rows);
// //             console.log(_test);

// //             //
// //             console.log(rows[2]);

// //             res.send(JSON.stringify(_test));
// //         });
// // });

// //  @STEP GET POST PUT  DELETE
// // @STEP POST 添加员工的计划
// // app.get("/plan", (req, res) => {
// //     console.log("网页正在GET数据: 员工的计划");
// //     console.log(req.path.replace(`/`,""));
// //     var tableName=req.path.replace(`/`,"");
// //     const sqlText = req.query;
// //     console.log(sqlText);
// //     // *! 这个地方要修改
// //     var [key, value] = Object.entries(sqlText)[0];
// //     console.log(key + ":" + value);
// //     // CRUD.CollectionFind(ENV.DefaultDbName, tableName, key + "= '" + value + "'", res);
// //     CRUD.selectObjFromTable(ENV.DefaultDbName,tableName,req,res);
// // });
// // app.post("/plan", (req, res) => {
// //     console.log("网页正在POST数据: 员工的计划");
// //     const plan = req.body;
// //     console.log(plan);
// //     // CRUD.TestConnection(res);
// //     CRUD.CollectionAdd(ENV.DefaultDbName, ENV.DefaultTableName, plan, res);
// //     // res.send(plan )
// // });
// // app.put("/plan",(req, res) => {
// //     console.log("网页正在PUT数据: 员工的计划");
// //     // console.log(req);
// //     CRUD.CollectionModify(ENV.DefaultDbName, ENV.DefaultTableName, req, res);

// // })

// // //

// // app.get('/api/test',(req,res)=>{
// //     console.log("正在测设");
// //     // let _content= (new Date()).toISOString();
// //     // console.log(req);
// //     res.send( {title:"标题",date:(new Date()).getMilliseconds()});
// // })

// // var  count=0;

// // app.post('/api/test',(req,res)=>{
// //     console.log("===正在测设");
// //     console.log(req.body);
// //     // let _content= (new Date()).toISOString();
// //     // console.log(req);
// //     count=count+1;
// //     res.send( {...req.body,"count":count});

// //     console.log("***正在测设");

// // })

// // (()=>{console.info("测试连接字符串");console.log(connectionString)})()

// const db = require("./V2-api/models/index.js");
// db.sequelize.sync();
// // 供应商
// require("./V2-api/routes/supplier.route")(app);
// require("./V2-api/routes/quotation.route")(app);
// require("./V2-api/routes/files.route")(app);
// require("./V2-api/routes/login.route")(app);
// require("./V2-api/routes/pdfMake.route")(app);


// //
// // const Users = ["沈宁", "吴迪", "张明园"];
// // app.post("/login", (req, res) => {
// //     console.log(req.body);
// //     console.log("登录认证");
// //     if (Users.includes(req.body.UserName)) {
// //         res.send(JSON.stringify({ IsAuth: true }));
// //     } else {
// //         res.send(JSON.stringify({ IsAuth: false }));
// //     }
// // });

// // @STEP
// app.post("/", (req, res) => {
//     console.log(req.body);
//     console.log("ddddddd");
//     res.send(JSON.stringify("好的 好的"));
// });

// // const db = require("./models/index.js");
// // db.sequelize.sync({ force: true });

// // @STEP Worker
// // require('./routes/worker.routes')(app);

// app.listen(port, () => {
//     // console.log(`Example app listening at http://localhost:${port}`);
//     console.log(`Example app listening at http://192.168.0.68:${port}`);
// });
