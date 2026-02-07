// main.js
const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

/* ================= 世界参数（永远不变） ================= */
const WORLD_SCALE = 80;   // 1 世界单位 = 40px（固定）
const GRID_SIZE = 1;      // 世界坐标中的网格大小

/* ================= 视口（只决定“看多少”） ================= */
const viewport = {
  centerX: 0,
  centerY: 0,
  width: 0,   // 世界单位
  height: 0
};

/* ================= resize：只改可视范围 ================= */
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  viewport.width = canvas.width / WORLD_SCALE;
  viewport.height = canvas.height / WORLD_SCALE;

  render();
}

/* ================= 世界 → 屏幕 ================= */
function worldToScreen(x, y) {
  return {
    x: (x - viewport.centerX) * WORLD_SCALE + canvas.width / 2,
    y: (viewport.centerY - y) * WORLD_SCALE + canvas.height / 2
  };
}

/* ================= 绘制网格 ================= */
function drawGrid() {
  const minX = viewport.centerX - viewport.width / 2;
  const maxX = viewport.centerX + viewport.width / 2;
  const minY = viewport.centerY - viewport.height / 2;
  const maxY = viewport.centerY + viewport.height / 2;

  ctx.strokeStyle = "#2a2f3a";
  ctx.lineWidth = 0.2;

  ctx.beginPath();

  // 竖线
  for (let x = Math.floor(minX); x <= maxX; x += GRID_SIZE) {
    const p1 = worldToScreen(x, minY);
    const p2 = worldToScreen(x, maxY);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }

  // 横线
  for (let y = Math.floor(minY); y <= maxY; y += GRID_SIZE) {
    const p1 = worldToScreen(minX, y);
    const p2 = worldToScreen(maxX, y);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
  }

  ctx.stroke();
}

/* ================= 原点（辅助观察） ================= */
function drawOrigin() {
  const p = worldToScreen(0, 0);
  ctx.fillStyle = "#ff4d4f";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
  ctx.fill();
}

/* ================= 主渲染 ================= */
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawOrigin();
}

/* ================= 启动 ================= */
window.addEventListener("resize", resize);
resize();
