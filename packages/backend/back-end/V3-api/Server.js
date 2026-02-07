const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan=require("morgan");
// const methodOverride = require('method-override')

//  @STEP APP
const app = express();
const port = 3100;

// @STEP express的初始化部分
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan(":method :url :status"))
// app.use(methodOverride())


// @STEP multer的部分 文件存储
const Upload =require('./utils/SaveFile').Upload
app.use(Upload);



// ! 配置 静态文件
const path = require('path')
app.use( express.static("C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/public"))
// app.use(express.static("public"));
// app.use(express.static("assert"));
// ! 配置 Upload 



// ! 配置 websocket
var expressWs = require("express-ws")(app);
var allWss = expressWs.getWss("");

console.log(process.platform); // Print the platform (e.g., win32, darwin, linux)
console.log(process.env.LC_ALL); // Print the LC_ALL environment variable
console.log(process.env.LANG); // Print the LANG environment variable


app.ws("/", function (ws, req) {
    ws.on("open", (msg) => {
        console.log(msg + "open");
        // allWss.clients.forEach((client)=>{
        //     client.send(allWss.clients.size+" 个 ws is online")
        // })
    });

    ws.on("message", function (msg) {
        console.log("服务器端收到了: " + msg);
        // ! 这里 我们暂时先只被动接受信息 不广播信息
        // allWss.clients.forEach(function (client) {
        //     client.send(msg);
        // });
    });
    ws.on("close", function (msg) {
        console.log(msg + " close");
    });
});

allWss.on("connection", function (ws) {
    // console.log(ws.url);
    // allWss.clients.forEach((client) => {
    //     // console.log(client);
    //     client.send(JSON.stringify(""));
    // });
});

expressWs.getWss().on("close", function (ws) {
    console.log(ws + "is close");
});

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
}
// setInterval(function () {
//     allWss.clients.forEach(function (client) {
//       client.send('从服务器发来的广播信息,现在时间:'+ getCurrentTime());
//     });
//   }, 50000);

// @STEP Auth鉴权

// @STEP 注册路由
const {WebSocketInfo}=require('./models/index');
 
async function  getAllWebsocketInfo(){
    return await WebSocketInfo.findAll();
}

function broadcast(){

}

// #TODO 这里有可以优化的地方
require("../V3-api/routes/index")(app).use(async (req, res) => {
    console.log("fsadfsafasdfasdfas");
    console.log(res.locals);
    const allWsInfo=await WebSocketInfo.findAll()
    allWss.clients.forEach(function (client) {
        // client.send("从服务器发来的广播信息,现在时间:" + getCurrentTime());
        client.send(JSON.stringify(allWsInfo));
    });
});

// // @STEP
app.use("/", (req, res) => {
    console.log("`````````````````````");
    console.log(req.query);
    console.log(req.url);
    console.log(req.body);
    console.log("`````````````````````");

    if (res.headersSent) {
        console.log(" next 在上个被使用了");
        console.log("res.locals");
        console.log(res.locals);
    } else {
        res.send("好的 好的");
    }
});

// // @STEP error
// const ServerErrorHandler=require('./utils/errorHandler').ServerErrorHandler;
// app.use(ServerErrorHandler);

app.listen(port, () => {
    console.log(__dirname);
    console.log(`Example app listening at http://192.168.0.68:${port}`);
});
