export function enableCanvasPanZoom(canvas, render) {
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const ctx = canvas.getContext("2d");

    const renderTransformed = () => {
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
        ctx.clearRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);
        render(); // 只画内容，不改变 transform
        ctx.restore();
    };

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        const delta = e.deltaY > 0 ? 0.95 : 1.05;
        const minScale = 0.2;
        const maxScale = 8;

        let newScale = Math.max(minScale, Math.min(maxScale, scale * delta));

        offsetX = mx - ((mx - offsetX) * newScale) / scale;
        offsetY = my - ((my - offsetY) * newScale) / scale;

        scale = newScale;
        renderTransformed();
    }, { passive: false });

    canvas.addEventListener("mousedown", (e) => {
        if (e.button === 1) {
            e.preventDefault();
            isDragging = true;
            startX = e.clientX - offsetX;
            startY = e.clientY - offsetY;
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        renderTransformed();
    });

    canvas.addEventListener("mouseup", (e) => { if (e.button === 1) isDragging = false; });
    canvas.addEventListener("mouseleave", () => { isDragging = false; });

    return {
        getScale: () => scale,
        getOffset: () => ({ offsetX, offsetY }),
        setTransform: (s, ox, oy) => { scale = s; offsetX = ox; offsetY = oy; renderTransformed(); },
        renderTransformed // ✅ 重点，提供给 checkbox 调用
    };
}
