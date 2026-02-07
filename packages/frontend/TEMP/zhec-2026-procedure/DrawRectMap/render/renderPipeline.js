// 👉 未来你可以加图层开关、zIndex、缓存

export function renderAll(ctx, viewport, layers) {
    ctx.clearRect(0, 0, viewport.canvasWidth, viewport.canvasHeight);
  
    layers.forEach(layer => layer());
  }
  