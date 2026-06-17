// 绘制带箭头的线
export function drawArrowLine(x1, y1, x2, y2,ctx) {
    // 绘制主线
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 计算箭头角度
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowLength = 15;
    
    // 绘制箭头
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - arrowLength * Math.cos(angle - Math.PI / 6),
        y2 - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - arrowLength * Math.cos(angle + Math.PI / 6),
        y2 - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.9)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 显示距离
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const textX = (x1 + x2) / 2;
    const textY = (y1 + y2) / 2;
    
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(`${Math.round(distance)}px`, textX + 10, textY + 5);
}


