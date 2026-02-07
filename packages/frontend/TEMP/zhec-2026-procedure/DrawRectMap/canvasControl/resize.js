export function bindResize(canvas, render) {
    function resize() {
        // const dpr = window.devicePixelRatio || 1;
        // const rect = canvas.getBoundingClientRect();

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // const ctx = canvas.getContext("2d");
        // // 坐标系统仍然用 CSS 像素
        // ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // viewport.update(canvas.width, canvas.height, worldScale);
        render();
    }

    window.addEventListener("resize", ()=>{
      resize();
    });
}
