// const express = require("express");

// const router = express.Router();

// router.get("/", (req, res) => {
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   let counter = 0;
//   const timer = setInterval(() => {
//     counter++;
//     res.write(`data: ${JSON.stringify({ msg: "Hello SSE", count: counter })}\n\n`);
//   }, 2000);

//   req.on("close", () => {
//     clearInterval(timer);
//   });
// });

// module.exports =router;
