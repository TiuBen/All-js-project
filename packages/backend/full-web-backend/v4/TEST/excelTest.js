const { getRowsByUsername } = require("../utils/excel/readExcelFileByYearMonthAndSelectUserRow");

const testFilePath =
    "D:/GitHub/All-js-project/packages/backend/full-web-backend/v4/public/ExcelDutyFiles/管制员执勤小时2026年2月.xlsm";

function test() {
    try {
        const rows = getRowsByUsername(testFilePath, "沈宁");
        console.log(`找到 ${rows.length} 条记录`);
        console.log("数据:", rows);
    } catch (error) {
        console.error("测试失败:", error);
    }
}

test();
