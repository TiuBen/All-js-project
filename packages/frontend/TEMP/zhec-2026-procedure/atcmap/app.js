// app.js
import { waypoints,fakeWaypoints, airways, airways2, airways3, airways4 } from "./data.js";
import { depRNAV } from "./depRNAV.js";
import { depTran } from "./depTran.js";
import { arrRNAV } from "./arrRNAV.js";
import { arrTRAN } from "./arrTRAN.js";
import { ilsRNAV } from "./ilsRNAV.js";
import { ilsTRAN } from "./ilsTRAN.js";
import { buildTableModel, renderTable } from "./tableModel.js";
import { createDrawFunctions } from "./draw.js";
import { DEP_01L, DEP_01R, DEP_19L, DEP_19R } from "./depRANVrouteDetails.js";
import { ARR_01L, ARR_01R, ARR_19L, ARR_19R } from "./arrRNAVrouteDetails.js";
import { buildRouteIndex } from "./routeIndex.js";
import { createRender } from "./render.js";
import { enableCanvasPanZoom } from "./canvasControls.js";
import { createRouteNotice } from "./notification.js";



const routeIndex = buildRouteIndex(DEP_01L,DEP_01R,DEP_19L,DEP_19R,ARR_01L,ARR_01R,ARR_19L,ARR_19R);
console.log(routeIndex);

const activeRouteIds = new Set(); // 所有 RNAV / 传统 table 共用同一个 Set


const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");

// 画布大小（你要求的）
canvas.width = 1400;
canvas.height = 1400;

/* ================== DMS → Decimal ================== */

function dmsToDecimal(value) {
    if (typeof value === "number") return value;

    // 去掉空格
    const v = value.trim();

    // ===== 1. DMS: 30°19'36.7"
    let m = v.match(/^(\d+)°(\d+)'([\d.]+)"$/);
    if (m) {
        const deg = +m[1];
        const min = +m[2];
        const sec = +m[3];
        return deg + min / 60 + sec / 3600;
    }

    // ===== 2. DM: 30°26.5"
    m = v.match(/^(\d+)°([\d.]+)"$/);
    if (m) {
        const deg = +m[1];
        const min = +m[2];
        return deg + min / 60;
    }

    // ===== 3. Decimal: 30.4416
    m = v.match(/^\d+(\.\d+)?$/);
    if (m) {
        return +v;
    }

    console.error("Unknown lat/lon format:", value);
    return NaN;
}

/* ================== 标准化航路点 ================== */

const normalizedWaypoints = {};
const allWaypoints = Object.assign({}, waypoints, fakeWaypoints);

Object.keys(allWaypoints).forEach((key) => {
    const p = allWaypoints[key];

    normalizedWaypoints[key] = {
        pointName: p.pointName,
        lat: dmsToDecimal(p.lat),
        lon: dmsToDecimal(p.lon),
    };
});

// 👉 强烈建议你第一次运行时打开看看
console.log("normalizedWaypoints:", normalizedWaypoints);

/* ================== 计算范围 ================== */

const lats = Object.values(normalizedWaypoints).map((p) => p.lat);
const lons = Object.values(normalizedWaypoints).map((p) => p.lon);

const minLat = Math.min(...lats);
const maxLat = Math.max(...lats);
const minLon = Math.min(...lons);
const maxLon = Math.max(...lons);

// ⚠️ padding 不能太大
const padding = 40;

/* ================== 投影函数 ================== */
const { drawPoint, drawLine } = createDrawFunctions(canvas, minLat, maxLat, minLon, maxLon);

// ===== 创建 render 函数 =====
const render = createRender(canvas, drawLine, drawPoint, routeIndex, normalizedWaypoints, activeRouteIds);
// ===== 启用平移缩放 =====
const canvasControls = enableCanvasPanZoom(canvas, render);

const routeNotice = createRouteNotice(routeIndex, activeRouteIds);

// RNAV离场航路
const { runways, fixes, table } = buildTableModel(depRNAV);
const panel = document.getElementById("sidPanel");
renderTable(panel, "RNAV", runways, fixes, table, activeRouteIds,canvasControls,routeIndex,routeNotice);
// 传统离场航路
const { runways: runways2, fixes: fixes2, table: table2 } = buildTableModel(depTran);
const depTranPanel = document.getElementById("depTranPanel");
renderTable(depTranPanel, "传统", runways2, fixes2, table2, activeRouteIds,canvasControls,routeIndex,routeIndex);
// RNAV进场航路
const { runways: runways3, fixes: fixes3, table: table3 } = buildTableModel(arrRNAV);
const arrRNAVPanel = document.getElementById("arrRNAVPanel");
renderTable(arrRNAVPanel, "RNAV", runways3, fixes3, table3, activeRouteIds,canvasControls,routeIndex,routeIndex);
// 传统进场航路
const { runways: runways4, fixes: fixes4, table: table4 } = buildTableModel(arrTRAN);
const arrTranPanel = document.getElementById("arrTranPanel");
renderTable(arrTranPanel, "RNAV", runways4, fixes4, table4, activeRouteIds,canvasControls,routeIndex,routeIndex);
// RNAV进场航路
const { runways: runways5, fixes: fixes5, table: table5 } = buildTableModel(ilsRNAV);
const ilsRNAVPanel = document.getElementById("ilsRNAVPanel");
renderTable(ilsRNAVPanel, "接RNAV点", runways5, fixes5, table5, activeRouteIds,canvasControls,routeIndex,routeIndex);
// 传统进场航路
const { runways: runways6, fixes: fixes6, table: table6 } = buildTableModel(ilsTRAN);
const ilsTranPanel = document.getElementById("ilsTranPanel");
renderTable(ilsTranPanel, "接传统", runways6, fixes6, table6, activeRouteIds,canvasControls,routeIndex,routeIndex);



// render();

// 初始渲染
canvasControls.renderTransformed();

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasControls.renderTransformed();
}

// window.addEventListener("resize", resizeCanvas);
window.addEventListener("resize", () => {
    const { offsetX, offsetY } = canvasControls.getOffset();
    const scale = canvasControls.getScale();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasControls.setTransform(scale, offsetX, offsetY); // 保持原来的视图
});
resizeCanvas();
