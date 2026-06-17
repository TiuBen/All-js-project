// A basic radar label for a aircraft
// need these information
// callsign height speed altitude
import { fabric } from "fabric";

// class RadarLabel extends fabric.Object {
//     constructor({ callsign = "Unknown", height = 0, speed = 0, altitude = 0 }) {
//         // Initialize the properties of the radar label
//         this.callsign = callsign;
//         this.height = height;
//         this.speed = speed;
//         this.altitude = altitude;

//         // For canvas rendering, let's assume we have some coordinates (x, y)
//         this.x = 0;
//         this.y = 0;

//         // Store Fabric.js objects for later reference
//         this.label = null;
//         this.line = null;
//         this.dot = null;
//     }

//     // // Method to update the radar label properties
//     // update({ callsign, height, speed, altitude }) {
//     //     if (callsign) this.callsign = callsign;
//     //     if (height) this.height = height;
//     //     if (speed) this.speed = speed;
//     //     if (altitude) this.altitude = altitude;
//     // }

//     // // Method to set the position of the radar label
//     // setPosition(x, y) {
//     //     this.x = x;
//     //     this.y = y;
//     //     // Update the positions of all elements if they exist
//     //     if (this.label && this.line && this.dot) {
//     //         this.updateElementsPosition();
//     //     }
//     // }

//     // // Helper method to get the label text
//     // getLabelText() {
//     //     return `${this.callsign}\nHeight: ${this.height} ft\nSpeed: ${this.speed} knots\nAltitude: ${this.altitude} ft`;
//     // }

//     // // Helper method to update positions of all elements
//     // updateElementsPosition() {
//     //     const textWidth = this.label.getScaledWidth();
//     //     const textHeight = this.label.getScaledHeight();

//     //     // Position the label at (this.x, this.y)
//     //     this.label.set({
//     //         left: this.x,
//     //         top: this.y,
//     //     });

//     //     // Calculate the start point of the line (bottom-right corner of the text)
//     //     const lineStartX = this.x + textWidth;
//     //     const lineStartY = this.y + textHeight;

//     //     // Calculate the end point of the line (50px away from the start point)
//     //     const lineEndX = lineStartX + 50;
//     //     const lineEndY = lineStartY;

//     //     // Update the line's position
//     //     this.line.set({
//     //         x1: lineStartX,
//     //         y1: lineStartY,
//     //         x2: lineEndX,
//     //         y2: lineEndY,
//     //     });

//     //     // Update the dot's position (at the end of the line)
//     //     const dotRadius = 3;
//     //     this.dot.set({
//     //         left: lineEndX - dotRadius,
//     //         top: lineEndY - dotRadius,
//     //     });

//     //     // Refresh the canvas to show changes
//     //     this.label.canvas.renderAll();
//     // }

//     // Method to render the radar label, assuming a Fabric.js canvas
//     _render(ctx) {

//         this.label.render(ctx);
//         // // Create the text label
//         // this.label = new fabric.Text(labelText, {
//         //     left: this.x,
//         //     top: this.y,
//         //     fontSize: 18,
//         //     fill: "green",
//         //     fontFamily: "Arial",
//         //     textAlign: "left",
//         //     selectable: false,
//         // });

//         // const label = new fabric.Text(labelText, {
//         //     left: this.x,
//         //     top: this.y,
//         //     fontSize: 18,
//         //     fill: "Green",
//         //     fontFamily: "Arial",
//         //     textAlign: "left",
//         //     selectable: false, // The label is not selectable
//         // });

//         // // Calculate the initial positions for the line and dot
//         // const textWidth = this.label.getScaledWidth();
//         // const textHeight = this.label.getScaledHeight();

//         // const lineStartX = this.x + textWidth;
//         // const lineStartY = this.y + textHeight;
//         // const lineEndX = lineStartX + 50;
//         // const lineEndY = lineStartY;
//         // // Create the line
//         // this.line = new fabric.Line([lineStartX, lineStartY, lineEndX, lineEndY], {
//         //     stroke: "green",
//         //     strokeWidth: 1,
//         //     selectable: false,
//         // });

//         // // Create the dot (a small circle)
//         // const dotRadius = 3;
//         // this.dot = new fabric.Circle({
//         //     left: lineEndX - dotRadius,
//         //     top: lineEndY - dotRadius,
//         //     radius: dotRadius,
//         //     fill: "green",
//         //     selectable: false,
//         // });

//         // // Group the elements (optional, if you want them to move as a single unit)
//         // const group = new fabric.Group([this.label, this.line, this.dot], {
//         //     selectable: false,
//         // });

//         // // Add the group to the canvas
//         // canvas.add(group);

//         // // Store the group reference if needed
//         // this.group = group;
//     }
// }

// 定义 RadarLabel 类（继承 fabric.Object）
class RadarLabelClass extends fabric.Object {
    initialize(options = {}) {
        //   super(options);

        // 合并默认配置
        this.options = Object.assign(
            {
                radius: 8,
                lineLength: 60,
                text: "Label",
                textOffset: 0,
                fill: "#FF0000",
                stroke: "#333",
                fontSize: 24,
                angle: 0,
                width: 200,
                height: 100,
            },
            options
        );

        // 初始化子对象
        this._initObjects();

        // 设置初始位置
        //   this.set({
        //     left: this.options.left || 0,
        //     top: this.options.top || 0,
        //     angle: this.options.angle
        //   });
        this.callSuper('initialize', options);

    }

    // 初始化子组件
    _initObjects() {
        // 1. 圆点（中心基准点）
        this.circle = new fabric.Circle({
            radius: 60,
            fill: "green",
            originX: "left",
            originY: "top",
            left: 0,
            top: 0,
            selectable: false,
        });

        //   this.circle = new fabric.Circle({
        //     radius: this.radius,
        //     fill: this.fill,
        //     originX: "center",
        //     originY: "center",
        //     left: 0,
        //     top: 0,
        //     selectable: false,
        // });

        //   2. 直线（从圆点向上延伸）
        this.line = new fabric.Line([0, 0, 0, -this.options.lineLength], {
            stroke: this.options.stroke,
            strokeWidth: 16,
            originX: "left",
            originY: "top",
            left: 0,
            top: 0,
            selectable: false,
        });

        // 3. 文本（直线末端）
        this.text = new fabric.Text("this.options.text", {
            fontSize: this.options.fontSize,
            originX: "left",
            originY: "top",
            left: 0,
            top: 0,
            selectable: false,
        });
    }

    // 核心：渲染逻辑
    _render(ctx) {
        // 保存当前画布状态
        ctx.restore();

        // 应用当前对象的变换（位置/旋转/缩放）
        //   this.transform(ctx);

        // 按顺序渲染子对象
        this.circle.render(ctx);
        this.line.render(ctx);
        this.text.render(ctx);

        // 恢复画布状态
        ctx.restore();
    }

    // // 计算包围盒（影响选择和变换）
    // _calcDimensions() {
    //   return {
    //     width: Math.max(
    //       this.options.radius * 2,
    //       this.text.width
    //     ),
    //     height: this.options.lineLength +
    //             this.options.radius +
    //             this.options.textOffset +
    //             this.text.height
    //   };
    // }

    // // 动态更新文本（示例方法）
    // updateText(newText) {
    //   this.text.set('text', newText);
    //   this.dirty = true; // 标记需要重绘
    // }
}

export default RadarLabelClass;
