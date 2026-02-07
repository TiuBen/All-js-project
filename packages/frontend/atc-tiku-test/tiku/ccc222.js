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
    database: "atctiku2",
    keepAliveInitialDelay: 30000, // 3s
    enableKeepAlive: true,
});

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

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    const [num, qId, rawNum, txt, A, B, C, D, rightAns, comment] = line.split("#");
                    // console.log([num, qId, rawNum, txt, A, B, C, D, rightAns, comment]);
                    questions.push([num, qId, rawNum, txt, A, B, C, D, rightAns, comment]);
                }
                console.log(questions.length);
                const dbTableName = fileName.replace("、", "_");
                // 如果已经存在table 清空
                const delSQL = `DROP TABLE IF EXISTS atctiku2.${dbTableName}`;
                connection.query(delSQL, (err, result, fields) => {
                    if (err instanceof Error) {
                        console.error("DELETE" + err);
                        return;
                    }
                });

                const createTableSQL = ` CREATE TABLE IF NOT EXISTS atctiku2.${dbTableName} (
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

                for (let index = 0; index < questions.length; index++) {
                    const Q = questions[index];
                    const insertSQL = `INSERT INTO atctiku2.${dbTableName} (num,qId,rawNum,txt,A,B,C,D,rightAns) VALUE (?,?,?,?,?,?,?,?,?);`;
                    const qNum = Q[0] || "";
                    const qId = Q[1] || "";
                    const rawNum = Q[2] || "";
                    const txt = Q[3] || "";
                    const A = Q[4] || "";
                    const B = Q[5] || "";
                    const C = Q[6] || "";
                    const D = Q[7] || "";
                    const rightAns = Q[8] || "";

                    const VALUE = [qNum, qId, rawNum, txt, A, B, C, D, rightAns];

                    connection.execute(insertSQL, VALUE, (err, result, fields) => {
                        if (err instanceof Error) {
                            console.log(Q);
                            console.error(err);
                            return;
                        }
                    });
                }
            });
        });
    });
}

// pureTxtToDatabase();
const path = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/tiku/test";

// getFiles(path);

// process English Selection Test to database

function processEnglishSelectionTestToDatabase() {
    
    // const path = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/tiku/Files/第三部分 英语知识/英语单选.txt";
    const path="C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/test/tiku/Files/机场管制.txt"
    fs.readFile(path, "utf-8", (err, data) => {
        // 如果已经存在table 清空
        const delSQL = `DROP TABLE IF EXISTS atctiku2.jcgz`;
        connection.query(delSQL, (err, result, fields) => {
            if (err instanceof Error) {
                console.error("DELETE" + err);
                return;
            }
        });

        const createTableSQL = ` CREATE TABLE IF NOT EXISTS atctiku2.jcgz (
id INT AUTO_INCREMENT PRIMARY KEY,
num VARCHAR(255),
qId VARCHAR(255),
rawNum VARCHAR(255),
txt VARCHAR(500),
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

        if (err) {
            console.error("read file" + err);
            return;
        }


        const lines = data.split("\n");

        if (lines.length % 6 !== 0) {
            console.log(lines.length);
            console.log("something wrong");

            return;
        } else {
            console.log("count ok!");

            for (let index = 0; index *6 < lines.length; index++) {
                const firstLine = lines[index * 6];
                console.log(firstLine);
                const [, questionNumber] = firstLine.match(/第(\d+)题/);
                const [, questionId] = firstLine.match(/试题编号：(\d+)/);
                const q = lines[index * 6 + 1];
                const A = lines[index * 6 + 2];
                const B = lines[index * 6 + 3];
                const C = lines[index * 6 + 4];
                const D = lines[index * 6 + 5];

                const insertSQL = `INSERT INTO atctiku2.jcgz (num,qId,rawNum,txt,A,B,C,D,rightAns) VALUE (?,?,?,?,?,?,?,?,?);`;

                const VALUE = [questionNumber, questionId, firstLine, q, A, B, C, D, ""];

                connection.execute(insertSQL, VALUE, (err, result, fields) => {
                    if (err instanceof Error) {
                       console.log(firstLine);
                        console.error(err);
                        return;
                    }
                });
            }
        }
    });
}

processEnglishSelectionTestToDatabase();

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
