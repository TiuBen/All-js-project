// 先逐行读取,
// 读取到题目序号
// 读取到题目内容
// 各种答案

const fs = require("fs");


const allQuestionAnswers = {};

async function getAnswers(filePath) {
    console.log("fileName:" + filePath);
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            }
            console.log("BEGIN PROCESS!!!");
            const lines = data.split("\r\n");
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                // const qAns = { qId: line.split(",")[0], ans: line.split(",")[1] };
                allQuestionAnswers[line.split(",")[0]] = line.split(",")[1];
                // console.log(qAns);
                // allQuestionAnswers.push(qAns);
            }
            console.log("allQuestionAnswers[2]");
            console.log(allQuestionAnswers["10101004"]);

            resolve(allQuestionAnswers);
        });
    });
}

const ans1path = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/tiku/answer/基础+专业.csv";

module.exports = { getAnswers, ans1path };
