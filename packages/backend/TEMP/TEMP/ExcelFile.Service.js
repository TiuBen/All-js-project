const fs= require( "fs");
import { v4 as uuidv4 } from "uuid";

const dayjs = require("dayjs");
const Excel = require("exceljs");
const path = require("path");

// 存任务状态
const tasks = {}; // { taskId: { status, filePath } }

// 模拟生成 Excel
function generateExcel(filePath) {
  return new Promise((resolve) => {
    setTimeout(() => {
      fs.writeFileSync(filePath, "这里是Excel文件内容，可以换成exceljs生成");
      resolve();
    }, 5000); // 假装要5秒
  });
}

export async function createExcelTask(fileName) {
  const filePath = path.join(process.cwd(), "tmp", fileName);

  // 文件已存在 → 直接返回已完成状态
  if (fs.existsSync(filePath)) {
    return { status: "done", filePath };
  }

  // 创建新任务
  const taskId = uuidv4();
  tasks[taskId] = { status: "pending", filePath };

  // 异步生成文件
  generateExcel(filePath).then(() => {
    tasks[taskId].status = "done";
  });

  return { status: "pending", taskId };
}

export function getExcelTaskStatus(taskId) {
  const task = tasks[taskId];
  if (!task) return null;
  return task;
}
