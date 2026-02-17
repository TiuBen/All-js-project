const express = require("express");
const cors = require("cors");
// const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const { initSSE, startHeartbeat } = require("./utils/see");
const routes = require("./routes");

const app = express();

// 中间件
app.use(cors());
app.options("*", cors());
// app.use(morgan('dev'));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// ! 监听的中间件
const logMiddleware = require("./middlewares/logMiddleware");
app.use(logMiddleware);

// 


// 路由
app.use("/api", routes);

//
app.use(express.static("public"));
const path = require("path");
app.use("/api", express.static(path.join(__dirname, "public")));
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/public", express.static(__dirname + "/" + "public"));
// app.use("/images", express.static(__dirname + +"/" + "public"));
app.use("/images", express.static(path.join(__dirname, "public")));

// 错误处理中间件
// app.use(errorMiddleware);

// 健康检查端点
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        service: "Auth API",
    });
});

// 404 处理
app.use("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});
 
// const { PrismaBetterSQLite3 } =require("@prisma/adapter-better-sqlite3") ;

// const {PrismaClient} = require("./generated/prisma/client")

// const adapter = new PrismaBetterSQLite3({
//     url: "file:./src/test.db"
//   }, {
//     timestampFormat: 'unixepoch-ms'
//   });

// const prisma = new PrismaClient({adapter})

// async function test() {
//     return  prisma.Duty.findUnique({
//         where: {
//           id: 99,
//         },
//       })
// }

// async function main() {
//     const data = await test();
//     console.log(data);
//   }
  
//   main();


module.exports = app;
