const XLSX = require("xlsx");
const NodeCache = require("node-cache");
const dayjs = require("dayjs");

// 缓存1小时
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120, maxKeys: 100 });

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
 * 安全获取工作表
 */
function getWorksheet(workbook, sheetName) {
    // 精确匹配
    if (workbook.SheetNames.includes(sheetName)) {
        return workbook.Sheets[sheetName];
    }

    // 忽略前后空格匹配
    const matchedName = workbook.SheetNames.find((name) => name.trim() === sheetName.trim());
    if (matchedName) {
        return workbook.Sheets[matchedName];
    }

    return null;
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
        // 查找工作表
        const worksheet = getWorksheet(workbook, username);
        if (!worksheet) {
            console.error(`❌ 找不到名为 "${username}" 的工作表`);
            console.error(`📋 可用的sheet名称:`, workbook.SheetNames);
            return [];
        }

        // 检查工作表引用范围
        if (!worksheet["!ref"]) {
            console.error(`❌ 工作表 "${username}" 为空`);
            return [];
        }

        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        // 检查行数是否足够
        if (range.e.r < 2) {
            console.error(`❌ 工作表 "${username}" 数据行数不足`);
            return [];
        }

        // 第二行作为表头
        const headers = [];
        const headerRow = 1; // 第2行
        for (let c = 0; c <= 7; c++) {
            const addr = XLSX.utils.encode_cell({ r: headerRow, c });
            const cell = worksheet[addr];
            headers.push((cell?.v ?? "").toString().trim());
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
