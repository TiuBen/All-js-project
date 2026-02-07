/**
 * 在 Canvas 上绘制带圆角的折线（目前支持三个点）
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x: number, y: number}>} points - 至少包含三个点 [{x,y}, {x,y}, {x,y}]
 * @param {Object} options
 * @param {number} [options.radius=10] - 圆角半径
 * @param {boolean} [options.stroke=true] - 是否描边
 * @param {boolean} [options.fill=false] - 是否填充
 */
// export function drawArcLine(ctx, points, options = {}) {
//     ctx.beginPath();
//     if (!points || points.length < 3) {
//         throw new Error("至少需要三个点");
//     }

//     const { radius = 10, stroke = true, fill = false } = options;
//     const [p1, p2, p3] = points;

//     // 计算 p1->p2 和 p2->p3 的单位向量
//     const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
//     const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

//     const len1 = Math.hypot(v1.x, v1.y);
//     const len2 = Math.hypot(v2.x, v2.y);

//     if (len1 === 0 || len2 === 0) {
//         // 如果有重合点，退化为直线
//         ctx.moveTo(p1.x, p1.y);
//         ctx.lineTo(p3.x, p3.y);
//         return;
//     }

//     // 单位向量
//     const u1 = { x: v1.x / len1, y: v1.y / len1 };
//     const u2 = { x: v2.x / len2, y: v2.y / len2 };

//     // 实际用于绘制的起点和终点（从 p2 向两侧回退 radius）
//     const r1 = Math.min(radius, len1);
//     const r2 = Math.min(radius, len2);

//     const start = { x: p2.x + u1.x * r1, y: p2.y + u1.y * r1 };
//     const end = { x: p2.x + u2.x * r2, y: p2.y + u2.y * r2 };

//     // 控制点：使用三次贝塞尔，控制点在 start 和 end 的切线方向上
//     // 一个经验公式：控制点距离 = radius * k，k ≈ 0.5519（圆的贝塞尔近似系数）
//     // 但这里我们用方向向量的垂直？不，直接用切线方向外推
//     // 更简单：把控制点设为 start 和 end 本身沿原方向再延伸一点（或直接用 p2 作为参考）

//     // 更稳健的做法：控制点 = start + u1 * cpLen, end + u2 * cpLen
//     // 但为了形成“内凹”的圆角，我们让控制点朝向 p2
//     // 实际上，我们可以用二次贝塞尔，控制点就是 p2 —— 效果也不错！

//     // 👉 这里我们使用 **二次贝塞尔曲线**，控制点为 p2，简单有效
//     ctx.moveTo(p1.x, p1.y);
//     ctx.lineTo(start.x, start.y);
//     ctx.quadraticCurveTo(p2.x, p2.y, end.x, end.y);
//     ctx.lineTo(p3.x, p3.y);

//     if (fill) {
//         ctx.fill();
//     }
//     if (stroke) {
//         ctx.stroke();
//     }
// }



/**
 * 在 Canvas 上绘制带圆角的折线（支持任意数量的点）
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{x: number, y: number}>} points - 点数组，每个点为 {x, y}
 * @param {Object} options
 * @param {number} [options.radius=10] - 圆角半径（最大不超过相邻线段长度）
 * @param {boolean} [options.stroke=true] - 是否描边
 * @param {boolean} [options.fill=false] - 是否填充
 * @param {boolean} [options.closePath=false] - 是否闭合路径（首尾相连）
 */
export function drawArcLine(ctx, points, options = {}) {
  if (!points || points.length < 2) {
    throw new Error('至少需要两个点');
  }

  const { radius = 10, stroke = true, fill = false, closePath = false } = options;
  const len = points.length;

  // 如果只有两个点，直接画直线
  if (len === 2) {
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
    return;
  }

  // 辅助函数：计算单位向量
  const unitVector = (a, b) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return { x: 0, y: 0 };
    return { x: dx / dist, y: dy / dist };
  };

  // 构建路径
  ctx.beginPath();

  // 第一个点：直接 moveTo
  ctx.moveTo(points[0].x, points[0].y);

  // 处理中间所有拐点（从索引 1 到 len - 2）
  for (let i = 1; i < len - 1; i++) {
    const pPrev = points[i - 1];
    const pCurr = points[i];
    const pNext = points[i + 1];

    // 计算入方向和出方向的单位向量
    const inDir = unitVector(pCurr, pPrev);   // 指向 pPrev（反向）
    const outDir = unitVector(pCurr, pNext);  // 指向 pNext

    // 计算两边的实际可用长度
    const distIn = Math.hypot(pCurr.x - pPrev.x, pCurr.y - pPrev.y);
    const distOut = Math.hypot(pNext.x - pCurr.x, pNext.y - pCurr.y);

    const rIn = Math.min(radius, distIn);
    const rOut = Math.min(radius, distOut);

    // 起点（上一段的终点）
    const start = {
      x: pCurr.x + inDir.x * rIn,
      y: pCurr.y + inDir.y * rIn,
    };

    // 终点（下一段的起点）
    const end = {
      x: pCurr.x + outDir.x * rOut,
      y: pCurr.y + outDir.y * rOut,
    };

    // 从上一个“end”（或初始点）到 start 是直线
    // 但注意：第一次循环时，当前路径位置是 points[0]
    // 所以我们需要先画到 start
    ctx.lineTo(start.x, start.y);

    // 用二次贝塞尔在 start → end 之间绕过 pCurr
    ctx.quadraticCurveTo(pCurr.x, pCurr.y, end.x, end.y);
  }

  // 最后一段：从最后一个拐点的 end 到最后一个点
  ctx.lineTo(points[len - 1].x, points[len - 1].y);

  // 可选：闭合路径（形成多边形）
  if (closePath) {
    // 闭合时，需要处理最后一个点到第一个点的圆角
    // 这里为了简单，直接 lineTo 首点（不加圆角）
    // 若需圆角闭合，逻辑更复杂（需额外处理首尾）
    ctx.closePath();
  }

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}