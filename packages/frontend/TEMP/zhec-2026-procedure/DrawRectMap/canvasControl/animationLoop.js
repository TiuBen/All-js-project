export function startLoop(render) {
    function loop() {
      render();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
  