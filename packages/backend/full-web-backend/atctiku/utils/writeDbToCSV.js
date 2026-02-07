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

function writeDbToCSV(section) {
    const selectAllSQL = `SELECT * FROM atctiku2.${section};`;
    try {
        connection.query(selectAllSQL, function (err, results, fields) {
            if (Array.isArray(results)) {
                let csvContent = "";
                results.forEach((rowArray) => {
                    let row = rowArray.join(",");
                    csvContent = csvContent + row + "\r\n";
                });
                fs.writeFile(
                    `C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/atctiku/public/output/${section}.csv`,
                    csvContent,
                    (err) => {
                        console.log(err);
                    }
                );
            } else {
                console.log("connection.query selectAllSQL wrong");
                console.log(err);
            }
        });
    } catch (error) {
        console.log(error);
    }
}

module.exports = { writeDbToCSV };

//             results.forEach((rowArray) => {
//                 let row = rowArray.join(",");
//                 csvContent = csvContent + row + "\r\n";
//             });
//             fs.writeFile(
//                 `C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/atctiku/public/output/${section}.csv`,
//                 csvContent
//             );
