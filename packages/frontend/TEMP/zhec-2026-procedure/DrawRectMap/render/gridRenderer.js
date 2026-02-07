export function drawGrid(ctx, mapSetting) {
    const { canvasWidth=9999, canvasHeight=9999,  centerScreenX = 700,  centerScreenY = 350 ,GRID_SIZE_PX=200,zoom=1} = mapSetting;
    ctx.save();
    ctx.translate(0.5, 0.5);

    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 0.5;

    const GRID_SIZE = GRID_SIZE_PX*zoom; // ★ 每一格 100px
    const half = GRID_SIZE / 2;

    /* ================= 垂直线 ================= */

    // 向右
    for (let x = centerScreenX + half; x <= canvasWidth; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    // 向左
    for (let x = centerScreenX - half; x >= 0; x -= GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    /* ================= 水平线 ================= */

    // 向下
    for (let y = centerScreenY + half; y <= canvasHeight; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }

    // 向上
    for (let y = centerScreenY - half; y >= 0; y -= GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
    ctx.restore();
}
