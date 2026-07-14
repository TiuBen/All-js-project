const XLSX = require("xlsx");
const NodeCache = require("node-cache");
const dayjs = require("dayjs");

// 缓存1小时
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

function getCellValue(cell, type = "text", dateStr = null) {
    if (!cell) return "";

    // 优先取显示值
    let value = cell.w ?? cell.v;

    if (type === "date") {
        if (cell.v instanceof Date) {
            return dayjs(cell.v).format("YYYY-MM-DD");
        }
        return value;
    }

    if (type === "time") {
        if (cell.v instanceof Date) {
            const time = dayjs(cell.v).format("HH:mm:ss");
            return `${dateStr} ${time}`;
        }

        if (typeof cell.w === "string") {
            return `${dateStr} ${cell.w}`;
        }

        return "";
    }

    // 数字、字符串
    return cell.w ?? cell.v ?? "";
}
/**
 * 流式读取Excel - 获取单个用户数据
 */
function getRowsByUsername(filePath, username) {
    const cacheKey = `${filePath}:${username}`;
    const cached = cache.get(cacheKey);
    if (cached) {
        console.log(`从缓存获取 ${username} 的数据`);
        return cached;
    }

    try {
        // .xlsm 文件需要特殊处理
        const workbook = XLSX.readFile(filePath, {
            cellStyles: false,
            cellDates: true,
            sheetRows: 0,
            bookVBA: false,
            type: "file",
        });

        // 打印所有sheet名称，用于调试
        console.log("所有sheet名称:", workbook.SheetNames);

        // 检查sheet是否存在（去掉前后空格）
        const sheetName = workbook.SheetNames.find((name) => name.trim() === username.trim());

        if (!sheetName) {
            console.error(`找不到名为 "${username}" 的工作表`);
            console.error("可用的sheet名称:", workbook.SheetNames);
            return [];
        }

        const worksheet = workbook.Sheets[sheetName];

        // 检查worksheet是否有效
        if (!worksheet) {
            console.error(`工作表 "${sheetName}" 无效`);
            return [];
        }
        // A-H
        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        const headers = [];
        // 第二行作为表头
        for (let c = 0; c <= 7; c++) {
            const addr = XLSX.utils.encode_cell({ r: 1, c });
            headers.push((worksheet[addr]?.v ?? "").toString().trim());
        }

        const rows = [];

        // 第三行开始
        for (let r = 2; r <= range.e.r; r++) {
            const dateCell = worksheet[XLSX.utils.encode_cell({ r, c: 0 })];

            if (!dateCell || dateCell.v === undefined || dateCell.v === "") {
                break;
            }

            const row = {};

            const date = getCellValue(dateCell, "date");

            row[headers[0]] = date;
            row[headers[1]] = getCellValue(worksheet[XLSX.utils.encode_cell({ r, c: 1 })]);
            row[headers[2]] = getCellValue(worksheet[XLSX.utils.encode_cell({ r, c: 2 })], "time", date);
            row[headers[3]] = getCellValue(worksheet[XLSX.utils.encode_cell({ r, c: 3 })]);
            row[headers[4]] = getCellValue(worksheet[XLSX.utils.encode_cell({ r, c: 4 })], "time", date);
            row[headers[5]] = Number(getCellValue(worksheet[XLSX.utils.encode_cell({ r, c: 5 })]));
            row[headers[6]] = Number(getCellValue(worksheet[XLSX.utils.encode_cell({ r, c: 6 })]));
            row[headers[7]] = Number(getCellValue(worksheet[XLSX.utils.encode_cell({ r, c: 7 })]));

            rows.push(row);
        }
        cache.set(cacheKey, rows);

        return rows;
    } catch (error) {
        console.error("读取Excel文件时出错:", error);
        throw error;
    }
}

// 导出所有函数
module.exports = {
    getRowsByUsername,
};
