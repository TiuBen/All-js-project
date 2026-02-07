// app.js
import { waypoints, fakeWaypoints } from "./data/data.js";
import { createTable } from "./table/tableModel.js";
import { arrRNAV } from "./data/RNAV_Arrival.js";
import { depRNAV } from "./data/RNAV_Departure.js";
import { ilsRNAV } from "./data/RNAV_ILSDME.js";
import { arrTRAN } from "./data/TRAN_Arrival.js";
import { depTran } from "./data/TRAN_Departure.js";
import { ilsTRAN } from "./data/TRAN_ILSDME.js";

import { dmsToDecimal } from "./util/dmsToDecimal.js";
import { createCanvasRenderer } from "./canvas/canvasControls.js";
import { createRouteNotice } from "./table/notification.js";

const activeRouteIds = new Set(); // 所有 RNAV / 传统 table 共用同一个 Set

const canvas = document.getElementById("map");

/* ================== 标准化航路点 ================== */
/* ================== DMS → Decimal ================== */
/* ================== 把所有点归一 ================== */
const normalizedWaypoints = {};
const allWaypoints = Object.assign({}, waypoints, fakeWaypoints);

Object.keys(allWaypoints).forEach((key) => {
    const p = allWaypoints[key];
    normalizedWaypoints[key] = {
        pointName: p.pointName,
        lat: dmsToDecimal(p.lat),
        lon: dmsToDecimal(p.lon),
        display:p?.display??true,
    };
});

// 👉 强烈建议你第一次运行时打开看看
// console.log("normalizedWaypoints:", normalizedWaypoints);
/* ================== 投影函数 ================== */
const { renderTransformed } = createCanvasRenderer(canvas, normalizedWaypoints, activeRouteIds, 180);
const createNotice = createRouteNotice(activeRouteIds);

//#region 创建表格
// RNAV---离场航路
const panel = document.getElementById("sidPanel");
createTable(panel, "RNAV", depRNAV, activeRouteIds, { draw: renderTransformed, notice: createNotice });
// 传统---离场航路
const depTranPanel = document.getElementById("depTranPanel");
createTable(depTranPanel, "传统", depTran, activeRouteIds,{ draw: renderTransformed, notice: createNotice });
// RNAV---进场航路
const arrRNAVPanel = document.getElementById("arrRNAVPanel");
createTable(arrRNAVPanel, "RNAV", arrRNAV, activeRouteIds, { draw: renderTransformed, notice: createNotice });
// 传统---进场航路
const arrTranPanel = document.getElementById("arrTranPanel");
createTable(arrTranPanel, "传统",arrTRAN, activeRouteIds,{ draw: renderTransformed, notice: createNotice });
// RNAV进场航路
const ilsRNAVPanel = document.getElementById("ilsRNAVPanel");
createTable(ilsRNAVPanel, "接RNAV程序", ilsRNAV, activeRouteIds, { draw: renderTransformed, notice: createNotice });
// 传统进场航路
const ilsTranPanel = document.getElementById("ilsTranPanel");
createTable(ilsTranPanel, "接传统导航", ilsTRAN, activeRouteIds, { draw: renderTransformed, notice: createNotice });

//#endregion

// 初次渲染
renderTransformed();