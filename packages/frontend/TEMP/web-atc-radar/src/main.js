import { fabric } from "fabric";
import RadarLabel from "./RadarLabel.js";
import RadarLabelClass from "./RadarLabeClass.js";
import SnRadarLabel from "./SnRadarLabel.class.js";
import { drawArrowLine } from "./utils/mouseEventListener.js";
import {drawHubeiFromGeoJSON} from "./utils/drawHubei.js"

// // 1. 创建 Worker
// const worker = new Worker(new URL("./worker/worker.js", import.meta.url), { type: "module" });

// // 3. 监听 Worker 返回的消息
// worker.onmessage = function (e) {
//     const { command, data } = e.data;

//     if (command === "dataUpdated") {
//         // 更新雷达标签
//         // console.log(data);

//         const updatedSnRadarLabel = Object.assign(new SnRadarLabel(), data); // 如果 SnRadarLabel 有一个空的构造函数

//         updateUI(updatedSnRadarLabel);
//     }
// };

 const testSn = new SnRadarLabel(400, 300, "SSN001");

function draw() {
    if (!needRedraw) {
        requestAnimationFrame(draw);
        return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(accumulatedOffsetX + offsetX, accumulatedOffsetY + offsetY);
    ctx.fillStyle = "lightblue";
    ctx.fillRect(100, 100, 200, 150);
    ctx.fillStyle = "darkblue";
    ctx.font = "20px sans-serif";
    ctx.fillText("可移动图形", 120, 180);
    ctx.restore();
    testSn.render(ctx);

    if (isMiddleDown) {
        drawArrowLine(startX, startY, currentX, currentY, ctx);
    }

    drawHubeiFromGeoJSON(ctx);
    needRedraw = false;
    requestAnimationFrame(draw);
}

// the canvas event listener
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let isMiddleDown = false;
let startX = 0,
    startY = 0;
let currentX = 0,
    currentY = 0;
let offsetX = 0,
    offsetY = 0;
let accumulatedOffsetX = 0,
    accumulatedOffsetY = 0;

let needRedraw = true;

//# region canvas 的鼠标交互部分
// 鼠标中键按下事件
canvas.addEventListener("mousedown", (e) => {
    if (e.button === 1) {
        // 1 表示鼠标中键
        isMiddleDown = true;
        canvas.style.cursor = "move"; // 改变光标样式为抓取
        startX = e.offsetX;
        startY = e.offsetY;
        currentX = startX;
        currentY = startY;
        needRedraw = true;
        e.preventDefault(); // 防止默认行为（如滚动）
    }
});

// 鼠标移动事件
canvas.addEventListener("mousemove", (e) => {
    if (isMiddleDown) {
        currentX = e.offsetX;
        currentY = e.offsetY;

        needRedraw = true;
    }
});

// 鼠标释放事件
canvas.addEventListener("mouseup", (e) => {
    if (e.button === 1 && isMiddleDown) {
        isMiddleDown = false;
        canvas.style.cursor = "default";
        // offsetX = currentX - startX;
        // offsetY = currentY - startY;
        // accumulatedOffsetX += offsetX;
        // accumulatedOffsetY += offsetY;
        // 释放时才累加偏移量
        accumulatedOffsetX += currentX - startX;
        accumulatedOffsetY += currentY - startY;
        // offsetX = 0;
        // offsetY = 0;
        needRedraw = true;
    }
});

// 防止中键滚动页面
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener(
    "wheel",
    (e) => {
        if (e.buttons === 4) e.preventDefault();
    },
    { passive: false }
);

//# endregion

// 启动动画循环
requestAnimationFrame(draw);

// // 3. UI更新函数（使用requestAnimationFrame防抖）
// let lastRenderTime = 0;
// function updateUI(newData) {
//     ctx.save();

//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.translate(offsetX, offsetY); // 平移
//     const testSn = new SnRadarLabel(400, 300, "AAAAAAAAAA");
//     testSn.render(ctx);

//     const now = performance.now();
//     if (now - lastRenderTime < 16) return; // 限流至≈60FPS
//     lastRenderTime = now;

//     // newData.forEach((item) => {
//     //     const label = new fabric.Text(item.text, {
//     //         left: item.x,
//     //         top: item.y,
//     //         fontSize: 18,
//     //         fill: "Green",
//     //         fontFamily: "Arial",
//     //         textAlign: "left",
//     //         selectable: false, // The label is not selectable
//     //     });
//     //     canvas.add(label);
//     // });
//     newData.render(ctx);
//     ctx.restore();

//     // ctx.requestRenderAll();
// }

export default canvas;
