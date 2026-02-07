const { db } = require("./SqliteDb");

const fs = require("fs");
const path = require("path");

db.run(`CREATE TABLE IF NOT EXISTS photo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      base64 BLOB  NOT NULL
    )`);

const saveImagesToDatabase = (folderPath) => {
    console.log("Saving images to database...");

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return console.error("Could not list the directory.", err);
        }

        files.forEach((file,index) => {
            console.log(index);
            const filePath = path.join(folderPath, file);
            console.log(filePath);
            // Check if the file is an image (you can modify this as needed)
            if (/\.(jpg|jpeg|png)$/i.test(file)) {
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        console.error(`Error reading file ${file}:`, err);
                        return;
                    }
                    // Convert to base64
                    const base64Image = data.toString("base64");
                    console.log(base64Image);

                    Insert into the database
                    db.run(`INSERT INTO photo (name, base64) VALUES (?, ?)`, [file, data], (err) => {
                        if (err) {
                            console.error(`Error inserting ${file} into database:`, err);
                        } else {
                            console.log(`Saved ${file} to database.`);
                        }
                    });
                });
            }
        });
    });
};
const folderPath = "C:/Users/HJW-AMD-PRP/Documents/GitHub/FullCompanyWeb/back-end/zhectower/public/日常照片";

saveImagesToDatabase(folderPath);

// process.on("exit", () => {
//     db.close((err) => {
//         if (err) {
//             console.error(err.message);
//         }
//         console.log("Closed the database connection.");
//     });
// });
