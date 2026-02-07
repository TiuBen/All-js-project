const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
//  @STEP APP
const app = express();
const port = 3100;

// @STEP express的初始化部分
app.use(cors());
app.options("*", cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ! 配置 静态文件
app.use(express.static("assert"));
app.use(express.static("public"));

// ! 配置 websocket
var expressWs = require("express-ws")(app);
var allWss=expressWs.getWss('/');

app.ws("/echo", function (ws, req) {
    ws.on("message", function (msg) {
        ws.send(msg);
        allWss.clients.forEach(function(client){
          client.send(msg);
        })
    });
    ws.on("close", function (msg) {
      console.log(ws+" close");
  });
    console.log("echo");



});

expressWs.getWss().on('connection',function(ws){
  console.log("is connected");
  allWss.clients.forEach((client)=>{
    client.send("广播 XXX is online ")
  })
})

expressWs.getWss().on("close",function(ws){
  console.log("is close");
})




// @STEP Auth鉴权

// @STEP 路由
require('./V3-api/routes/index')(app);


// require("./V2-api/routes/checkIn.route")(app).use(tttt);

const resetColor = "\x1b[0m";
const redColor = "\x1b[31m";
const greenColor = "\x1b[32m";
const blueColor = "\x1b[34m";

console.log( require("./V2-api/routes/index")(app));



// app.use("/test")

// // @STEP
app.use("/", (req, res) => {
    console.log(redColor + "/");
    console.log(req.query);
    console.log(req.url);
    console.log(req.body);
    console.log(resetColor);
    res.send("好的 好的");
});

app.listen(port, () => {
    console.log(`Example app listening at http://192.168.0.68:${port}`);
});
