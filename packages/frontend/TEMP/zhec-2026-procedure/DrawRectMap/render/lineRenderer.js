export function drawLine(ctx, points, options = {}) {
    const { style = "solid", color = "#003049", width = 1, dash = [10, 6], opacity = 1 } = options;

    if (points.length < 2) return;

    ctx.save();
    ctx.translate(0.5, 0.5);

    ctx.beginPath();
    points.forEach((p, i) => {
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    });

    ctx.setLineDash(style === "dashed" ? dash : []);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.globalAlpha = opacity;

    ctx.stroke();

    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();
}
