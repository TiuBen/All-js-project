// 创建返回带有闭包的绘图函数
export function createDrawFunctions(canvas, minLat, maxLat, minLon, maxLon) {
    const padding = 40;

    function project(lat, lon) {
        return {
            x: padding + ((lon - minLon) / (maxLon - minLon)) * (canvas.width - padding * 2),
            y: padding + ((maxLat - lat) / (maxLat - minLat)) * (canvas.height - padding * 2),
        };
    }

    function drawPoint(ctx, p) {
        const { x, y } = project(p.lat, p.lon);

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#d62828";
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        ctx.fillText(p.pointName, x + 8, y - 8);
    }

    function drawLine(ctx, points,  options = {}) {
        const {
            style = "solid", // "solid" 或 "dashed"
            color = "#003049", // 线条颜色
            width = 2, // 线宽
            dash = [12, 8], // 虚线模式
            opacity = 1, // 透明度
        } = options;
        ctx.beginPath();

        points.forEach((p, i) => {
            const pos = project(p.lat, p.lon);
            i === 0 ? ctx.moveTo(pos.x, pos.y) : ctx.lineTo(pos.x, pos.y);
        });

        // 设置线条样式
        ctx.setLineDash(style === "dashed" ? dash : []);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.globalAlpha = opacity;

        ctx.stroke();

        // 重置状态
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }

    return { drawPoint, drawLine };
}
