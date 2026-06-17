// 一个雷达标牌要有的内容 除了文字部分 
// 标牌是否被选中,标牌摆放的位置,标牌线段的长短,



class SnRadarLabel {
    constructor(
        x,
        y,
        labelText,
        labelOptions = { textFont: "24px Arial ", fillStyle: "#222200" },
        speedValue = 400,
        speedDirection = 45,
        speedOptions = { lineWidth: 3, lineCap: "butt", strokeStyle: "red " },
        handlerLineLength = 150,
        handlerLineAngle = 22.5*0,
        handleLineOptions = { lineWidth: 3, lineCap: "butt", strokeStyle: "green " },
        circleOptions = { radius: 6, lineWidth: 4, strokeStyle: "red " },
        ctx,
        ctxOptions,
        isDirty,
        
    ) {
        this.x = x;
        this.y = y;
        //
        this.labelText = labelText;
        this.labelOptions = labelOptions;
        //
        this.speedValue = speedValue;
        this.speedDirection = speedDirection;
        this.speedOptions = speedOptions;
        //
        this.handlerLineLength = handlerLineLength;
        this.handlerLineAngle = handlerLineAngle;
        this.handleLineOptions = handleLineOptions;
        //
        this.circleOptions = circleOptions;
        //
        this.ctx = ctx;
        this.ctxOptions = ctxOptions;
    }

    render(ctx) {
        const [handlerLineStartX, handlerLineStartY,TextStartX,TextStartY] = this._getLabelStartDrawPosition(ctx);
        //render the label text
        // ctx.save();
        ctx.font = this.labelOptions.textFont;
        ctx.fillStyle = this.labelOptions.fillStyle;
        ctx.fillText(this.labelText, TextStartX, TextStartY);
        // ctx.restore();
       

        //render the handleLine
        // ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(handlerLineStartX, handlerLineStartY);
        ctx.lineWidth = this.handleLineOptions.lineWidth;
        ctx.strokeStyle = this.handleLineOptions.strokeStyle;
        ctx.lineCap = "butt";
        ctx.stroke();
        // ctx.restore();
         // render the speed vector
         this._renderSpeedVector(ctx);

        //render the circle part
        // ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.circleOptions.radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = this.circleOptions.strokeStyle;
        ctx.lineWidth = this.circleOptions.lineWidth;
        ctx.stroke();
        // ctx.restore();
    }
    // label-text start draw position
    _getLabelStartDrawPosition(ctx) {
        // 转换角度为弧度
        const angleInRadians = ((this.handlerLineAngle - 90) * Math.PI) / 180;

        const x2 = this.x + Math.cos(angleInRadians) * (this.circleOptions.radius + this.handlerLineLength);
        const y2 = this.y + Math.sin(angleInRadians) * (this.circleOptions.radius + this.handlerLineLength);
        const metrics = ctx.measureText(this.labelText);
        const textWidth = metrics.width;
        const fontSize = parseInt(this.labelOptions.textFont); // 从 font 属性中提取字号
        const textHeight = fontSize ; // 1.2 是行

        const angleN = parseInt(this.handlerLineAngle / 22.5);
        let x3, y3;
        switch (angleN) {
            // 文本框左下角
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
                x3 = x2;
                // y3 = y2 - textHeight;
                y3 = y2;
                break;
            // 文本框左上角
            case 5:
            case 6:
            case 7:
            case 8:
                x3 = x2;
                // y3 = y2 + textHeight;
                y3 = y2 + textHeight;
                break;
            // 文本框左上角
            case 9:
            case 10:
            case 11:
                x3 = x2 - textWidth;
                y3 = y2 + textHeight;
                break;
            // 文本框左上角
            case 12:
            case 13:
            case 14:
            case 15:
                x3 = x2 - textWidth;
                y3 = y2 ;
                break;
            default:
                x3 = x2;
                y3 = y2;
        }
        return [x2,y2,x3, y3];
    }

    _renderSpeedVector(ctx) {
        // ctx.save();

        // 转换角度为弧度
        const angleInRadians = ((this.speedDirection - 90) * Math.PI) / 180;

        // 计算速度矢量终点
        const speedLength = this.speedValue / 10; // 缩放因子，使矢量长度合理
        const endX = this.x + Math.cos(angleInRadians) * speedLength;
        const endY = this.y + Math.sin(angleInRadians) * speedLength;

        // 绘制速度线
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.lineWidth = this.speedOptions.lineWidth;
        ctx.strokeStyle = this.speedOptions.strokeStyle;
        ctx.lineCap = this.speedOptions.lineCap;
        ctx.stroke();

        // // 绘制箭头
        // const arrowSize = 8;
        // const angle1 = angleInRadians + Math.PI * 0.75; // 135度
        // const angle2 = angleInRadians + Math.PI * 1.25; // 225度

        // ctx.beginPath();
        // ctx.moveTo(endX, endY);
        // ctx.lineTo(endX + Math.cos(angle1) * arrowSize, endY + Math.sin(angle1) * arrowSize);
        // ctx.moveTo(endX, endY);
        // ctx.lineTo(endX + Math.cos(angle2) * arrowSize, endY + Math.sin(angle2) * arrowSize);
        // ctx.stroke();

        // 可选：添加速度值标签
        // ctx.font = "12px Arial";
        // ctx.fillStyle = this.speedOptions.strokeStyle;
        // ctx.fillText(
        //     `${this.speedValue}`,
        //     endX + Math.cos(angleInRadians) * 15,
        //     endY + Math.sin(angleInRadians) * 15
        // );

        // ctx.restore();
    }
}

export default SnRadarLabel;
