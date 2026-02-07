export function createRender(
    canvas,
    drawLine,
    drawPoint,
    routeIndex,
    waypoints,
    activeRouteIds
) {
    const ctx = canvas.getContext("2d");

    


    return function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        activeRouteIds.forEach(routeId => {
            const line = routeIndex.get(routeId);
            if (!line) {
                console.warn("[DRAW] 未找到 line:", routeId);
                return;
            }

            const pts = line.points
                .map(id => waypoints[id])
                .filter(Boolean);

            drawLine(ctx, pts, {
                style: line.lineStyle || "solid",
                width: 1
            });
        });

        Object.values(waypoints)
            .forEach(p => drawPoint(ctx, p));
    };
}
