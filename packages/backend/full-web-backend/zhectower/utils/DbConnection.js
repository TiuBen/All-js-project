const mysql = require("mysql2/promise");
const path = require("path");


// const pool =  mysql.createPool({
//     host: "localhost",
//     user: "root",
//     port: 3306,
//     password: "root1234",
//     database: "zhectower",
//     keepAliveInitialDelay: 30000, // 3s
//     enableKeepAlive: true,
//     rowsAsArray: false,
// });


const pool =  mysql.createPool({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "root1234",
    database: "atctiku2",
    keepAliveInitialDelay: 30000, // 3s
    enableKeepAlive: true,
    rowsAsArray: false,
});



// const connection = await pool.getConnection();
// connection.connect((err) => {
//     if (err) {
//         console.error("Error connecting to MySQL database:", err);
//         return;
//     }
//     console.log("Connected to MySQL database!");
// });


module.exports={pool};