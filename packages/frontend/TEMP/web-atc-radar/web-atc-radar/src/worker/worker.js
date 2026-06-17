import SnRadarLabel from "../SnRadarLabel.class";


let testSn= new SnRadarLabel(200,200,"TExt测试2222");



// 随机移动函数
function moveTextRandomly() {
 

   testSn.x=testSn.x+1;
   testSn.y=testSn.y+1;


    // 发送更新后的数据给主线程
    self.postMessage({
        command: "dataUpdated",
        // data: textArray,
        data: testSn,
    });
}

// 每 100ms 移动一次（可调整频率）
setInterval(moveTextRandomly, 500);


// 监听主线程发来的消息
// self.onmessage = function(e) {
//     const { command, data } = e.data;

//     if (command === "dataUpdated") {
       
//         self.postMessage({
//             command: "dataUpdated",
//             data: updatedArray,
//         });
//     }
// };

// let textArray = [
//     { id: 1, text: "FLT001", x: 50, y: 50, speed: 2 },
//     { id: 2, text: "FLT002", x: 100, y: 100, speed: 3 },
//     { id: 3, text: "FLT003", x: 150, y: 150, speed: 1.5 },
// ];

   // textArray = textArray.map(item => {
    //     // 随机调整 x, y（示例：按速度移动，并在边界反弹）
    //     // let newX = item.x + (Math.random() * 2 - 1) * item.speed;
    //     // let newY = item.y + (Math.random() * 2 - 1) * item.speed;
    //     let newX = item.x + 1;
    //     let newY = item.y +1;

    //     // 边界检查（假设画布大小 800x600）
    //     if (newX < 0) newX = 0;
    //     if (newX > 800) newX = 800;
    //     if (newY < 0) newY = 0;
    //     if (newY > 600) newY = 600;

    //     return {
    //         ...item,
    //         x: newX,
    //         y: newY,
    //     };
    // });