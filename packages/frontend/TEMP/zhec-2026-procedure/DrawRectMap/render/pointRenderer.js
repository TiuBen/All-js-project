import { createGPSToScreen } from "../projection/geoProject.js";
import { mapSetting } from "../config/mapSetting.js";
import { dmsGPSPointToScreen} from "../projection/geoProject.js";

export function drawPoints(ctx, screenXYPoints) {
    ctx.save();

    ctx.fillStyle = "#d62828";
    Object.values(screenXYPoints).forEach((p) =>{
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}
