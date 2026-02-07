// 先逐行读取,
// 读取到题目序号
// 读取到题目内容
// 各种答案

const fs = require("fs");
const mysql = require("mysql2");
// 创建连接
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "root1234",
    database: "atctiku",
    keepAliveInitialDelay: 30000, // 3s
    enableKeepAlive: true,
});

const connectionPool = mysql.createPool({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "root1234",
    database: "atctiku",
    keepAliveInitialDelay: 3000, // 3s
    enableKeepAlive: true,
});

// const question = {
//     questionNumber: -1, // Question number
//     questionText: "What is the capital of France?", // Question text
//     options: ["London", "Paris", "Berlin", "Rome"], // Array of options
//     correctAnswer: "Paris", // Correct answer
// };

// function pureTxtToJsonTxt() {
//     const path = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/第1部分.txt";

//     fs.readFile(path, "utf8", function (err, data) {
//         if (err) {
//             console.error(err);
//             return;
//         }

//         const questions = [];
//         // 按行分割文本内容
//         const lines = data.split("\n");

//         // 存储题目对象的数组

//         // 临时变量，用于存储当前题目信息
//         let currentQuestion = {};

//         // 遍历每一行数据
//         for (let i = 0; i < lines.length; i++) {
//             const line = lines[i].trim();

//             // 如果是题目编号行
//             if (line.startsWith("第") && line.includes("试题编号")) {
//                 questions.push(currentQuestion);
//                 console.log(line);

//                 // // 如果已经有题目信息，则将其存入数组中
//                 // if (Object.keys(currentQuestion).length !== 0) {
//                 //     questions.push(currentQuestion);
//                 // }

//                 // 提取题目编号和试题编号
//                 const [, questionNumber] = line.match(/第(\d+)题/);
//                 const [, questionId] = line.match(/试题编号：(\d+)/);

//                 console.log(questionNumber, questionId);
//                 // 设置当前题目信息
//                 currentQuestion = {
//                     questionNumber: questionNumber,
//                     questionId: questionId,
//                     rawNum: line,
//                 };
//             } else {
//                 // 如果不是题目编号行，则根据内容添加属性到当前题目对象中
//                 if (
//                     line.startsWith("A") ||
//                     line.startsWith("B") ||
//                     line.startsWith("C") ||
//                     line.startsWith("D") ||
//                     line.startsWith("T") ||
//                     line.startsWith("F")
//                 ) {
//                     if (!currentQuestion.options) {
//                         currentQuestion.options = [];
//                     }
//                     currentQuestion.options.push(line);
//                 } else {
//                     currentQuestion.questionText = line;
//                 }
//             }
//         }

//         // 将最后一个题目信息存入数组中

//         const jsonData = JSON.stringify(questions);
//         fs.writeFile("C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/ccc.json", jsonData, function (err) {
//             if (err) {
//                 console.log(err);
//             }
//         });
//     });
// }
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL database:", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

function getFiles(dirPath) {
    console.log(dirPath);
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        files.forEach((file) => {
            const filePath = dirPath + "/" + file;
            const fileName = file.split(".")[0].trim();
            console.log("fileName:===" + fileName);
            fs.readFile(filePath, "utf8", (err, data) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log("BEGIN PROCESS!!!");
                const lines = data.split("\n");
                const questions = [];
                // 遍历每一行数据
                let currentQuestion = {};
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();

                    // 如果是题目编号行
                    if (line.startsWith("第") && line.includes("试题编号")) {
                        // 提取题目编号和试题编号
                        const [questionNumber, questionId] = line.match(/\d+/g);
                        // const [, questionId] = line.match(/试题编号(\d+)/);

                        // 设置当前题目信息
                        currentQuestion = {
                            questionNumber: questionNumber,
                            questionId: questionId,
                            rawNum: line,
                            options: [],
                            comment:""
                        };
                        questions.push(currentQuestion);
                    } else {
                        // 如果不是题目编号行，则根据内容添加属性到当前题目对象中
                        if (
                            line.startsWith("A") ||
                            line.startsWith("B") ||
                            line.startsWith("C") ||
                            line.startsWith("D") ||
                            line.startsWith("T") ||
                            line.startsWith("F")
                        ) {
                            currentQuestion.options.push(line);
                        } else {
                            currentQuestion.questionText = line;
                        }
                    }
                }
                // console.log(questions);
                const createTableSQL = ` CREATE TABLE IF NOT EXISTS atctiku.${fileName} (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    num VARCHAR(255),
                    qId VARCHAR(255),
                    rawNum VARCHAR(255),
                    txt VARCHAR(255),
                    A VARCHAR(255),
                    B VARCHAR(255),
                    C VARCHAR(255),
                    D VARCHAR(255),
                    rightAns VARCHAR(255),
                    comment VARCHAR(255)
                );`;
                console.log("questions.length:" + questions.length);
                connection.query(createTableSQL, (err, result, fields) => {
                    if (err instanceof Error) {
                        console.error("createTableSQL" + err);
                        return;
                    }
                });

                // 如果已经存在table 清空
                const delSQL = `DELETE FROM atctiku.${fileName}`;
                connection.query(delSQL, (err, result, fields) => {
                    if (err instanceof Error) {
                        console.error("DELETE" + err);
                        return;
                    }
                });

                for (let index = 0; index < questions.length; index++) {
                    const Q = questions[index];
                    const insertSQL = `INSERT INTO atctiku.${fileName} (num,qId,rawNum,txt,A,B,C,D) VALUE (?,?,?,?,?,?,?,?);`;
                    const qNum = Q.questionNumber || "";
                    const qId = Q.questionId || "";
                    const rawNum = Q.rawNum || "";
                    const txt = Q.questionText || "";
                    const A = Q.options.length > 0 ? Q.options[0] : ``;
                    const B = Q.options.length > 1 ? Q.options[1] : ``;
                    const C = Q.options.length > 2 ? Q.options[2] : ``;
                    const D = Q.options.length > 3 ? Q.options[3] : ``;

                    const VALUE = [qNum, qId, rawNum, txt, A, B, C, D];

                    connection.execute(insertSQL, VALUE, (err, result, fields) => {
                        if (err instanceof Error) {
                            console.log(Q);
                            console.error(err);
                            return;
                        }
                    });

                    // const insertSQL = `INSERT INTO atctiku.${fileName} (num,qId,rawNum,txt,A,B,C,D) VALUE ("${Q.questionNumber}","${Q.questionId}","${Q.rawNum}","${Q.questionText}","${Q.options.length > 0 ? Q.options[0] : ``}","${Q.options.length > 1 ? Q.options[1] : ``}","${Q.options.length > 2 ? Q.options[2] : ``}","${Q.options.length > 3 ? Q.options[3] : ``}");`;

                    // connection.query(insertSQL, (err, result, fields) => {
                    //     if (err instanceof Error) {
                    //         console.error(err);
                    //         return;
                    //     }
                    // });
                }
            });
        });
    });
}

function pureTxtToDatabase() {
    // 连接数据库

    const path = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/tiku/files";

    const txtFiles = [];
    fs.readdirSync(path).forEach((file) => {
        console.log("read:" + file);
        txtFiles.push(file);
    });

    txtFiles.forEach(async (fileName) => {
        console.log("fileName :" + fileName);
        const fileShortName = fileName.split(".")[0];

        const createTableSQL = ` CREATE TABLE IF NOT EXISTS atctiku.${fileShortName} (
            id INT AUTO_INCREMENT PRIMARY KEY,
            num VARCHAR(255),
            qId VARCHAR(255),
            rawNum VARCHAR(255),
            txt VARCHAR(255),
            A VARCHAR(255),
            B VARCHAR(255),
            C VARCHAR(255),
            D VARCHAR(255),
            rightAns VARCHAR(255)
        );`;

        connection.query(createTableSQL, (err, result, fields) => {
            if (err instanceof Error) {
                console.error(err);
                return;
            }
        });

        const filePath = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/tiku/files/" + fileName;

        // const questions = [];
        fs.readFileSync(filePath, "utf8", function (err, data) {
            if (err) {
                console.log("Error reading file: ", filePath);
                console.error(err);
                return;
            }

            const questions = [];
            // 按行分割文本内容
            const lines = data.split("\n");

            // 存储题目对象的数组

            // 临时变量，用于存储当前题目信息
            let currentQuestion = {};

            // 遍历每一行数据
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // 如果是题目编号行
                if (line.startsWith("第") && line.includes("试题编号")) {
                    questions.push(currentQuestion);
                    // console.log(line);

                    // 提取题目编号和试题编号
                    const [, questionNumber] = line.match(/第(\d+)题/);
                    const [, questionId] = line.match(/试题编号：(\d+)/);

                    // 设置当前题目信息
                    currentQuestion = {
                        questionNumber: questionNumber,
                        questionId: questionId,
                        rawNum: line,
                        options: [],
                    };
                } else {
                    // 如果不是题目编号行，则根据内容添加属性到当前题目对象中
                    if (
                        line.startsWith("A") ||
                        line.startsWith("B") ||
                        line.startsWith("C") ||
                        line.startsWith("D") ||
                        line.startsWith("T") ||
                        line.startsWith("F")
                    ) {
                        // if (!currentQuestion.options) {
                        //     currentQuestion.options = [];
                        // }
                        currentQuestion.options.push(line);
                    } else {
                        currentQuestion.questionText = line;
                    }
                }
            }
        });

        console.log(questions);
        //     // for (let index = 1; index < questions.length; index++) {
        //     //     const Q = questions[index];
        //     //     // console.log(Q);
        //     //     const insertSQL = `INSERT INTO atctiku.test4 (num,qId,rawNum,txt,A,B,C,D) VALUE ("${
        //     //         Q.questionNumber
        //     //     }","${Q.questionId}","${Q.rawNum}","${Q.questionText}","${Q.options.length > 0 ? Q.options[0] : ""}","${
        //     //         Q.options.length > 1 ? Q.options[1] : ""
        //     //     }","${Q.options.length > 2 ? Q.options[2] : ""}","${Q.options.length > 3 ? Q.options[3] : ""}");`;
        //     //     // console.log(insertSQL);

        //     //     connection.query(insertSQL, (err, result, fields) => {
        //     //         if (err instanceof Error) {
        //     //             console.error(err);
        //     //             return;
        //     //         }
        //     //     });
        //     // }

        //         const Q = questions[2];
        //         // console.log(Q);
        //         const insertSQL = `INSERT INTO atctiku.test4 (num,qId,rawNum,txt,A,B,C,D) VALUE ("${
        //             Q.questionNumber
        //         }","${Q.questionId}","${Q.rawNum}","${Q.questionText}","${Q.options.length > 0 ? Q.options[0] : ""}","${
        //             Q.options.length > 1 ? Q.options[1] : ""
        //         }","${Q.options.length > 2 ? Q.options[2] : ""}","${Q.options.length > 3 ? Q.options[3] : ""}");`;
        //         // console.log(insertSQL);

        //         connection.query(insertSQL, (err, result, fields) => {
        //             if (err instanceof Error) {
        //                 console.error(err);
        //                 return;
        //             }
        //         });

        // });

        // [1,23,455].forEach((item) => {
        //     console.log(item);
        //     connection.query( ` INSERT INTO atctiku.test4 (num,qId,rawNum,txt,A,B,C,D) VALUE (
        //         "73",
        //         "10104005",
        //         "第73题  试题编号：10104005",
        //         "空气剧烈的垂直运动称()»",
        //         "A.乱流",
        //         "B.对流",
        //         "C.风",
        //         "D.湍流")`, (err, result, fields) => {
        //         if (err instanceof Error) {
        //             console.error(err);
        //             return;
        //         }
        //         console.log(result);
        //     });
        // });
    });

    // 关闭连接
    // connection.end();
}

// pureTxtToDatabase();
const path = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/tiku/Files/第二部分 专业基础知识";

getFiles(path);

// async function readDirectory() {
//     try {
//       const files = await fs.promises.readdir(path);
//       console.log('Files in the directory:', files);
//       return files;
//     } catch (error) {
//       console.error('Error reading directory:', error);
//     }
//   }

// console.log(readDirectory());  //readDirectory();

// connection.end();
