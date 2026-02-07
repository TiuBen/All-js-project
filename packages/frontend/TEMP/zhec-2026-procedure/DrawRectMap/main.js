import { mapSetting } from "./config/mapSetting.js";
import { waypoints } from "./data/data.js";
import { dmsToDecimal } from "./utils/dmsToDecimal.js";
import { dmsGPSPointToScreen,createProjectionCache } from "./projection/geoProject.js";
import { createGridScale } from "./projection/gridScale.js";
import { projectGeo } from "./projection/geoProject.js";
import { bindMapInteraction } from "./canvasControl/canvasInteraction.js";

import { drawArcLine } from "./render/utils/calcArc.js";

import { createViewport } from "./utils/viewport.js";

import { drawGrid } from "./render/gridRenderer.js";
import { drawPoints } from "./render/pointRenderer.js";
import { drawLine } from "./render/lineRenderer.js";

import { bindResize } from "./canvasControl/resize.js";
import { startLoop } from "./canvasControl/animationLoop.js";

/* ========== canvas ========== */

const canvas = document.getElementById("map");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

/* ========== scale & center ========== */
// const scale = createGridScale(mapSetting);
// const centerGeo = {
//     lat: mapSetting.centerLat,
//     lon: mapSetting.centerLon,
// };

/* ========== viewport ========== */
const viewport = createViewport();
viewport.centerX = 0;
viewport.centerY = 0;

/* ========== project data ========== */
const dmsGPSPoints = Object.assign({}, waypoints);
const  _tempDecimalGPSPoints = {};
Object.keys(dmsGPSPoints).forEach((key) => {
    const p = dmsGPSPoints[key];
    // console.log(p);

    _tempDecimalGPSPoints[key] = {
        pointName: p.pointName,
        lat: dmsToDecimal(p.lat),
        lon: dmsToDecimal(p.lon),
        display: p?.display ?? true,
    };

});

/* ========== 投影缓存 ========== */
const projectionCache = createProjectionCache(_tempDecimalGPSPoints, mapSetting);
// const screenXYPoints = {};
// Object.keys(_tempDecimalGPSPoints).forEach((key) => {
//     const p = _tempDecimalGPSPoints[key];
//     // console.log(p);


//     screenXYPoints[key] =dmsGPSPointToScreen(p, mapSetting);

// });

// console.log(screenXYPoints);
// Object.values(screenXYPoints).forEach((p) =>{
//     console.log(p);
    
// });
// });


const GRID_DEGREE_STEP = 0.1; // 每 0.1°

/* ========== render ========== */
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // renderAll(ctx, viewport, [
    //     () => drawGrid(ctx, viewport, GRID_DEGREE_STEP * scale.worldPerDegree),
    //     () => drawPoints(ctx, pointsWorld, viewport),
    // ]);
    const screenXYPoints= projectionCache.getScreenPoints(mapSetting);
    drawGrid(ctx, { canvasWidth: canvas.width, canvasHeight: canvas.height ,... mapSetting});
    drawPoints(ctx, screenXYPoints);
    drawLine(ctx, [{x:40,y:40},{x:1000,y:1000}]);
    drawArcLine(ctx, [
        { x: 50, y: 100 },
        { x: 100, y: 150 },
        { x: 450, y: 200 },
        { x: 450, y: 300 }
      ], { radius: 10 });
}

/* ========== init ========== */
bindMapInteraction(canvas, mapSetting, render);
bindResize(canvas, render);
startLoop(render);

