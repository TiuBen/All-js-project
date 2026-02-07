const clients = new Set();

function initSSE(req, res) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  // 保存客户端
  clients.add(res);
  console.log("新的 SSE 连接, 当前客户端数:", clients.size);

  req.on("close", () => {
    clients.delete(res);
    console.log("客户端断开, 当前客户端数:", clients.size);
  });
}

function sendEvent(type, data) {
  console.log("发送事件:", type, data);
  clients.forEach(c => {
    c.write(`event: ${type}\n`);
    c.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// 心跳
function startHeartbeat() {
  setInterval(() => {
    clients.forEach(c => {
      c.write(`event: heartbeat\n`);
      c.write(`data: ${Date.now()}\n\n`);
    });
  }, 20000);
}

module.exports = { initSSE, sendEvent, startHeartbeat };
