import { fabric } from "fabric";

function calculateLineEndPoint(angle, distance) {
    // 将角度转换为弧度（Fabric.js的坐标系：0度指向正右方，顺时针增加）
    const radians = (angle * Math.PI) / 180;

    // 计算x和y方向的增量（使用余弦和正弦函数）
    const dx = distance * Math.cos(radians);
    const dy = distance * Math.sin(radians);

    return [dx, dy];
}

// 定义 RadarLabel 类（继承 fabric.Object）
// class RadarLabel extends fabric.Object {
//     constructor(options = {}) {
//         super(options);

//         // 合并默认配置
//         this.options = Object.assign(
//             {
//                 radius: 8,
//                 lineLength: 60,
//                 text: "Label",
//                 textOffset: 15,
//                 fill: "#FF0000",
//                 stroke: "#333",
//                 fontSize: 14,
//                 angle: 0,
//                 labelText: "TEST001", //雷达标牌的内容
//                 labelTextAngle: 45, //雷达标牌的摆放角度 22.5 度 一个
//                 labelDistance: 20, //雷达标牌引线的长度
//                 speedSpeed: 300, //SPEED 应该是个矢量
//                 speedAngel: 90, //
//                 x: 0, //飞机位置x
//                 y: 0, //飞机位置y
//             },
//             options
//         );

//         // 初始化子对象
//         this._initComponents();

//         // 设置初始位置
//         this.set({
//             left: this.options.left || 0,
//             top: this.options.top || 0,
//             angle: this.options.angle,
//         });
//     }

//     // 初始化子组件
//     _initComponents() {
//         // 1. 圆点（中心基准点）
//         this.circle = new fabric.Circle({
//             left: this.options.x - this.options.radius / 2,
//             top: this.options.y - this.options.radius / 2,
//             radius: this.options.radius,
//             fill: this.options.fill,
//             evented: false, // 禁止单独交互
//             selectable: false,
//         });

//         const [dx, dy] = calculateLineEndPoint(this.options.labelTextAngle, this.options.labelDistance);

//         // 2. 直线（从圆点向上延伸）
//         this.line = new fabric.Line([this.options.x, this.options.y, dx, dy], {
//             stroke: this.options.stroke,
//             strokeWidth: 2,
//             selectable: false,
//             evented: false,
//         });

//         // 3. 文本（直线末端）
//         this.text = new fabric.Text(this.options.labelText, {
//             left: this.options.x,
//             top: this.options.y,
//             fontSize: this.options.fontSize,
//             selectable: false,
//             evented: false,
//             textBaseline: "alphabetic",
//         });
//     }

//     // 核心：渲染逻辑
//     _render(ctx) {
//         // 保存当前画布状态
//         ctx.save();

//         // 应用当前对象的变换（位置/旋转/缩放）
//         this.transform(ctx);

//         // 按顺序渲染子对象
//         this.line.render(ctx);
//         this.circle.render(ctx);
//         this.text.render(ctx);

//         // 恢复画布状态
//         ctx.restore();
//     }

//     // 动态更新文本（示例方法）
//     updateText(newText) {
//         this.text.set("text", newText);
//         this.dirty = true; // 标记需要重绘
//     }
// }

// 1. 定义 RadarLabel 类
const RadarLabel = fabric.util.createClass(fabric.Object, {
    initialize: function (options) {
        options = options || {};
        this.callSuper("initialize", options);

        // 默认配置
        const defaults = {
            radius: 30, // 圆点半径
            lineLength: 100, // 直线长度
            text: "Label", // 文本内容
            textOffset: 20, // 文本与线的间距
            fill: "#FF0000", // 圆点颜色
            stroke: "#333", // 直线颜色
            fontSize: 16, // 文本大小
        };

        // 合并用户配置
        Object.assign(defaults, options);
        this.set(defaults);

        // 创建子对象（不直接添加到画布）
        this._initObjects();
    },

    // 初始化子对象
    _initObjects: function () {
        // 1. 圆点（中心点）
        this.circle = new fabric.Circle({
            radius: this.radius,
            fill: this.fill,
            originX: "center",
            originY: "center",
            left: 0,
            top: 0,
            selectable: false,
        });

        // 2. 直线（从圆点向外延伸）
        this.line = new fabric.Line(
            [0, 0, 0, -this.lineLength], // [x1, y1, x2, y2]
            {
                stroke: this.stroke,
                strokeWidth: 2,
                originX: "center",
                originY: "center",
                left: 0,
                top: 0,
                selectable: false,
            }
        );

        // 3. 文本（位于直线末端）
        this.text = new fabric.Text(this.text, {
            fontSize: this.fontSize,
            originX: "center",
            originY: "center",
            left: 20,
            top: 50,
            selectable: false,
        });
    },

    // 渲染逻辑（关键！）
    _render: function (ctx) {
        // 先渲染子对象
        this.line.render(ctx);
        this.circle.render(ctx);
        this.text.render(ctx);
    },

    // 返回对象的包围盒（用于交互）
    _calcDimensions: function () {
        const width = Math.max(this.radius * 2, this.text.width);
        const height = this.lineLength + this.radius + this.textOffset + this.text.height;
        return { width, height };
    },
});

export default RadarLabel;
