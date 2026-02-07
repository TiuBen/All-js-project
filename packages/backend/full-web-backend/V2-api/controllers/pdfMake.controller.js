const {PDFfolderPath,test_1_PDF_file} =require('../config/CONST');

const puppeteer = require("puppeteer");



exports.getPdf = async (req, res, next) => {
    console.log("获取名片-pdf");

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(WebIP+"/test", {
        waitUntil: "networkidle2",
    });
    const element = await page.$eval(".card-container",ele=>{return ele.innerHTML});

    await page.setContent(element);
    await page.pdf({ path: test_1_PDF_file, width: '90mm',height:"54mm" });// 所有的测试PDF都是一个文件 旧文件会被覆盖

    await browser.close();
    // console.log(element);
};
