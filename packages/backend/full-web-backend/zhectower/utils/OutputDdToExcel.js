const XLSX = require("xlsx");

function AddArrayToSheet(array) {
    const worksheet = {};
    // 往指定单元格写入数据
    worksheet["A1"] = { t: "s", v: "Hello" }; // 在 A1 单元格写入字符串 'Hello'
    worksheet["B2"] = { t: "n", v: 123 };

    // 定义工作表的范围（不设置的话 Excel 会无法识别整个表）
    worksheet["!ref"] = "A1:B2";

    return worksheet;
}
function AddSheetToWorkbook(workbook, worksheet, name) {
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
}
const folderPath = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/zhectower/public";

function OutputDdToExcel(data) {
    const workbook = XLSX.utils.book_new();

    AddSheetToWorkbook(workbook, AddArrayToSheet([]), "Sheet1");
    AddSheetToWorkbook(workbook, AddArrayToSheet([]), "Sheet2");

    XLSX.writeFile(workbook, "output.xlsx");
}

const { GetWhoIsOnDuty } = require("../controller/duty.controller");
const { error } = require("console");



module.exports = { OutputDdToExcel };
