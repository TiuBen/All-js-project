export function bindMapInteraction(canvas, mapSetting, render) {
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    /* ========== 缩放（滚轮） ========== */
    canvas.addEventListener(
        "wheel",
        (e) => {
            e.preventDefault();
            console.log("缩放");

            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.min(10, Math.max(mapSetting.zoomStep, mapSetting.zoom * delta));

            mapSetting.zoom = newZoom;
            render();
        },
        { passive: false }
    );

    /* ========== 平移（中键 / 拖拽） ========== */
    canvas.addEventListener("mousedown", (e) => {
        if (!mapSetting.enablePan) return;
        if (e.button !== 1) return;

        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;

        // ★ 鼠标样式：抓住
        canvas.style.cursor = "grabbing";
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        lastX = e.clientX;
        lastY = e.clientY;

        const degreePerPixel = mapSetting.GRID_DEGREE / mapSetting.GRID_SIZE_PX / mapSetting.zoom;

        mapSetting.centerLon -= dx * degreePerPixel;
        mapSetting.centerLat += dy * degreePerPixel;

        mapSetting.centerScreenY += dx*mapSetting.zoom;
        mapSetting.centerScreenY += dy*mapSetting.zoom;;

        render();
    });

    ["mouseup", "mouseleave"].forEach((evt) =>
        canvas.addEventListener(evt, () => {
            isDragging = false;
            canvas.style.cursor = "default";
        })
    );

}
