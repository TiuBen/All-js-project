import { create, createReportList } from "./modules/canvas.js";
import { randomPoints } from "./modules/randomPoints.js";
import { Circle } from "./modules/circle.js";
import { name, draw, reportArea, reportPerimeter } from "./modules/square.js";
import randomSquare from "./modules/square.js";
let myCanvas = create("myCanvas", document.body, 480, 320);
let reportList = createReportList(myCanvas.id);

let square1 = draw(myCanvas.ctx, 50, 50, 100, "blue");
reportArea(square1.length, reportList);
reportPerimeter(square1.length, reportList);

// Use the default
let square2 = randomSquare(myCanvas.ctx);

const mainCanvas = document.getElementById("canvas");
const ctx = mainCanvas.getContext("2d");

setInterval(function () {
    ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    randomPoints(20).forEach((point) => {
        //   draw(myCanvas.ctx, 5, point.x, point.y, "red");
        let c = new Circle();
        c.draw(ctx, point.x, point.y, 5);
    });
}, 1000);

console.log(randomPoints(10));
