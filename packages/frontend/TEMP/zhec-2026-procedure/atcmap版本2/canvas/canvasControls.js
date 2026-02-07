// canvasRenderer.js
export function createCanvasRenderer(canvas, normalizedWaypoints, activeRouteIds, padding = 40) {
    const ctx = canvas.getContext("2d");

    /* ================= 投影：经纬度 → 世界坐标 ================= */
    const lats = Object.values(normalizedWaypoints).map((p) => p.lat);
    const lons = Object.values(normalizedWaypoints).map((p) => p.lon);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    function project(lat, lon) {
        return {
            x: padding + ((lon - minLon) / (maxLon - minLon)) * (canvas.width - padding * 2),
            y: padding + ((maxLat - lat) / (maxLat - minLat)) * (canvas.height - padding * 2),
        };
    }

    /* ================= Pan / Zoom 状态 ================= */
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    /* ================= 绘制函数（世界坐标） ================= */

    function drawPoint(ctx, p) {
        const { display } = p;
        if (!display) return;
        const { x, y } = project(p.lat, p.lon);

        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#d62828";
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.fillText(p.pointName, x + 6, y - 6);
    }

    function drawLine(ctx, points, options = {}) {
        const { style = "solid", color = "#003049", width = 1, dash = [10, 6], opacity = 1 } = options;

        if (points.length < 2) return;

        ctx.beginPath();
        points.forEach((p, i) => {
            const pos = project(p.lat, p.lon);
            i === 0 ? ctx.moveTo(pos.x, pos.y) : ctx.lineTo(pos.x, pos.y);
        });

        ctx.setLineDash(style === "dashed" ? dash : []);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.globalAlpha = opacity;

        ctx.stroke();

        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }

    /* ================= 核心 render ================= */
    function render() {
        //!!activeRouteIds 里面有完整信息
        // activeRouteIds 是 Set
        activeRouteIds.forEach((route) => {
            // 一个 route 里可能有多条 routes
            route.routes.forEach((r) => {
                const pts = r.routePoints.map((id) => normalizedWaypoints[id]).filter(Boolean);

                if (pts.length < 2) return;

                drawLine(ctx, pts, {
                    style: r.routeStyle?.lineStyle || "solid",
                    color: r.routeStyle?.stroke || "#003049",
                    width: 1,
                });
            });
        });

        Object.values(normalizedWaypoints).forEach((p) => drawPoint(ctx, p));

        // 画跑道
        [
            ["EC400", "EC500"], // 第一条
            ["EC410", "EC510"], // 第二条
        ].forEach((ids, i) => {
            const pts = ids.map((id) => normalizedWaypoints[id]).filter(Boolean);

            if (pts.length < 2) return;

            drawLine(ctx, pts, {
                style: "solid",
                color: "green",
                width: 3,
            });
        });
    }

    function renderTransformed() {
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);

        ctx.clearRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);

        render();
        ctx.restore();
    }

    /* ================= 事件 ================= */
    canvas.addEventListener(
        "wheel",
        (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            const delta = e.deltaY > 0 ? 0.95 : 1.05;
            const newScale = Math.min(8, Math.max(0.2, scale * delta));

            offsetX = mx - ((mx - offsetX) * newScale) / scale;
            offsetY = my - ((my - offsetY) * newScale) / scale;
            scale = newScale;

            renderTransformed();
        },
        { passive: false }
    );

    canvas.addEventListener("mousedown", (e) => {
        if (e.button !== 1) return;
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        renderTransformed();
    });

    canvas.addEventListener("mouseup", () => (isDragging = false));
    canvas.addEventListener("mouseleave", () => (isDragging = false));

    /* ================= resize ================= */
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderTransformed();
    }
    window.addEventListener("resize", resize);
    resize();

    /* ================= 对外 API ================= */
    return {
        renderTransformed,
        drawPoint,
        drawLine,
    };
}
