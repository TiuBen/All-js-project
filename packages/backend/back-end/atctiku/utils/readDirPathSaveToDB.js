const fs = require("fs");
const mysql = require("mysql2");
const path = require("path");
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "root1234",
    database: "atctiku2",
    keepAliveInitialDelay: 30000, // 3s
    enableKeepAlive: true,
    rowsAsArray: true,
});
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL database:", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

function createTable(fileName) {
    const delSQL = `DROP TABLE IF EXISTS atctiku.${fileName}`;
    connection.query(delSQL, (err, result, fields) => {
        if (err instanceof Error) {
            console.error("DELETE" + err);
            return;
        }
    });
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

    connection.query(createTableSQL, (err, result, fields) => {
        if (err instanceof Error) {
            console.error("createTableSQL" + err);
            return;
        }
    });
}

function saveLinesToDb(lines = [],fileName) {
    if (lines.length !== 0) {
        const questions = [];
        let currentQuestion = {};
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // 如果是题目编号行
            if (line.startsWith("第") && line.includes("试题编号")) {
                // 提取题目编号和试题编号
                const [questionNumber, questionId] = line.match(/\d+/g);

                // 设置当前题目信息
                currentQuestion = {
                    questionNumber: questionNumber,
                    questionId: questionId,
                    rawNum: line,
                    options: [],
                    comment: "",
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

        console.log("questions.length:" + questions.length);

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
        }
    } else {
        console.log("saveLinesToDb something wrong!");
    }
}

function getFiles(dirPath) {
    console.log(dirPath);
    try {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                console.error(err);
                return;
            }
            files.forEach((file, index) => {
                let _path = path.join(dirPath, file);
                //     console.log(_path);
                if (fs.statSync(_path).isDirectory()) {
                    console.log(file + "isDirectory");
                    getFiles(_path);
                } else {
                    console.log(index + ":" + file);

                    const fileName = file.split(".")[0].trim();
                    createTable(fileName);

                    // #MARK

                    fs.readFile(_path, "utf8", (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        console.log("BEGIN PROCESS!!!");
                        const lines = data.split("\n");
                        saveLinesToDb(lines,fileName)
                    });
                    // #MARK
                }
            });

            // files.forEach((file) => {
            //     const filePath = dirPath + "/" + file;
            //     const fileName = file.split(".")[0].trim();
            //     console.log("fileName:===" + fileName);
            //     fs.readFile(filePath, "utf8", (err, data) => {
            //         if (err) {
            //             console.error(err);
            //             return;
            //         }
            //         console.log("BEGIN PROCESS!!!");
            //         const lines = data.split("\n");
            //         const questions = [];
            //         // 遍历每一行数据
            //         let currentQuestion = {};
            //         for (let i = 0; i < lines.length; i++) {
            //             const line = lines[i].trim();

            //             // 如果是题目编号行
            //             if (line.startsWith("第") && line.includes("试题编号")) {
            //                 // 提取题目编号和试题编号
            //                 const [questionNumber, questionId] = line.match(/\d+/g);
            //                 // const [, questionId] = line.match(/试题编号(\d+)/);

            //                 // 设置当前题目信息
            //                 currentQuestion = {
            //                     questionNumber: questionNumber,
            //                     questionId: questionId,
            //                     rawNum: line,
            //                     options: [],
            //                     comment: "",
            //                 };
            //                 questions.push(currentQuestion);
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
            //                     currentQuestion.options.push(line);
            //                 } else {
            //                     currentQuestion.questionText = line;
            //                 }
            //             }
            //         }
            //         // console.log(questions);
            //         const createTableSQL = ` CREATE TABLE IF NOT EXISTS atctiku.${fileName} (
            //                     id INT AUTO_INCREMENT PRIMARY KEY,
            //                     num VARCHAR(255),
            //                     qId VARCHAR(255),
            //                     rawNum VARCHAR(255),
            //                     txt VARCHAR(255),
            //                     A VARCHAR(255),
            //                     B VARCHAR(255),
            //                     C VARCHAR(255),
            //                     D VARCHAR(255),
            //                     rightAns VARCHAR(255),
            //                     comment VARCHAR(255)
            //                 );`;
            //         console.log("questions.length:" + questions.length);
            //         connection.query(createTableSQL, (err, result, fields) => {
            //             if (err instanceof Error) {
            //                 console.error("createTableSQL" + err);
            //                 return;
            //             }
            //         });

            //         // 如果已经存在table 清空
            //         const delSQL = `DELETE FROM atctiku.${fileName}`;
            //         connection.query(delSQL, (err, result, fields) => {
            //             if (err instanceof Error) {
            //                 console.error("DELETE" + err);
            //                 return;
            //             }
            //         });

            //         for (let index = 0; index < questions.length; index++) {
            //             const Q = questions[index];
            //             const insertSQL = `INSERT INTO atctiku.${fileName} (num,qId,rawNum,txt,A,B,C,D) VALUE (?,?,?,?,?,?,?,?);`;
            //             const qNum = Q.questionNumber || "";
            //             const qId = Q.questionId || "";
            //             const rawNum = Q.rawNum || "";
            //             const txt = Q.questionText || "";
            //             const A = Q.options.length > 0 ? Q.options[0] : ``;
            //             const B = Q.options.length > 1 ? Q.options[1] : ``;
            //             const C = Q.options.length > 2 ? Q.options[2] : ``;
            //             const D = Q.options.length > 3 ? Q.options[3] : ``;

            //             const VALUE = [qNum, qId, rawNum, txt, A, B, C, D];

            //             connection.execute(insertSQL, VALUE, (err, result, fields) => {
            //                 if (err instanceof Error) {
            //                     console.log(Q);
            //                     console.error(err);
            //                     return;
            //                 }
            //             });

            //             // const insertSQL = `INSERT INTO atctiku.${fileName} (num,qId,rawNum,txt,A,B,C,D) VALUE ("${Q.questionNumber}","${Q.questionId}","${Q.rawNum}","${Q.questionText}","${Q.options.length > 0 ? Q.options[0] : ``}","${Q.options.length > 1 ? Q.options[1] : ``}","${Q.options.length > 2 ? Q.options[2] : ``}","${Q.options.length > 3 ? Q.options[3] : ``}");`;

            //             // connection.query(insertSQL, (err, result, fields) => {
            //             //     if (err instanceof Error) {
            //             //         console.error(err);
            //             //         return;
            //             //     }
            //             // });
            //         }
            //     });
            // });
        });
    } catch (error) {
        console.log(error);
    }
}

function readDirPathSaveToDB(dir) {
    console.log("readDirPathSaveToDB");
    getFiles(dir);
}

module.exports = { readDirPathSaveToDB };
