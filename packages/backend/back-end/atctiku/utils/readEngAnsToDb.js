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

function readEngAnsToDb(fileName) {
    console.log("readEngAnsToDb");
    console.log(fileName);
    try {
        const lines = [];
        fs.readFileSync(fileName, "utf8")
            .split("\n")
            .forEach((line) => {
                lines.push(line);
            });

        for (let index = 0; index < lines.length; index++) {
            const [qId, Ans] = lines[index].split(",");
            console.log(qId, Ans);
            const sql = 'UPDATE `atctiku2`.`英语单选` SET `rightAns` = ? WHERE `qId` = ?';
            const values = [Ans, qId];
            connection.execute(sql, values, (err, results, fields) => {
                if (err instanceof Error) {
                    console.log(err);
                }

                console.log(results);
                console.log(fields);
            });
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = { readEngAnsToDb };
