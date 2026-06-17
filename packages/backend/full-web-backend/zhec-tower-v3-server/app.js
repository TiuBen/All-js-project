const express = require("express");
const cors = require("cors");
// const morgan = require('morgan');
const bodyParser = require("body-parser");

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

app.get("/api/events", (req, res) => {
    initSSE(req, res);
    // startHeartbeat();
});

// 路由
app.use("/api", routes);

//
app.use(express.static("public"));
const path = require("path");
app.use("/api", express.static(path.join(__dirname, "public")));
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/public", express.static(__dirname + +"/" + "public"));
// app.use("/images", express.static(__dirname + +"/" + "public"));
app.use("/images", express.static(path.join(__dirname, "public")));

// 错误处理中间件
// app.use(errorMiddleware);

module.exports = app;
