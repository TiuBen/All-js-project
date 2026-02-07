const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Define folder path where images are stored
const folderPath = "D:/GitHub/full-web-backend/zhectower/public"; // Change this to your image folder path

// Create or open SQLite database
const db = new sqlite3.Database("D:/GitHub/full-web-backend/zhectower/user-face.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create table for storing images
db.run(
    `CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    base64 TEXT
)`,
    (err) => {
        if (err) console.error("Error creating table:", err.message);
    }
);

// Function to convert image to Base64
const imageToBase64 = (filePath) => {
    try {
        const imageBuffer = fs.readFileSync(filePath);
        const base64 = imageBuffer.toString("base64");

        // 获取文件扩展名
        const ext = path.extname(filePath).toLowerCase().substring(1);
        const mimeType = `image/${ext === "jpg" ? "jpeg" : ext}`; // 处理 jpg -> jpeg

        return `data:${mimeType};base64,${base64}`;
    } catch (err) {
        console.error("Error reading file:", filePath, err.message);
        return null;
    }
};

// Function to save image data to the database
const saveImageToDB = (filename, base64) => {
    if (!base64) return;
    const filenameWithoutExt = path.parse(filename).name; // Remove file extension
    db.run(`INSERT INTO images (username, base64) VALUES (?, ?) `, [filenameWithoutExt, base64], (err) => {
        if (err) {
            console.error("Error inserting data:", err.message);
        } else {
            console.log(`Saved ${filename} to database.`);
        }
    });

    // db.run(
    //     `UPDATE images
    //      SET filename = ?, base64 = ?
    //      WHERE username = ?`,
    //     [filenameWithoutExt, base64, filenameWithoutExt],
    //     (err) => {
    //         if (err) {
    //             console.error('Error updating data:', err.message);
    //         } else {
    //             console.log(`Updated image for user ${filenameWithoutExt}`);
    //         }
    //     }
    // );
};

// Read all images in the folder
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error("Error reading directory:", err.message);
        return;
    }

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        if (fs.statSync(filePath).isFile() && /\.(png|jpg|jpeg|gif)$/i.test(file)) {
            const base64 = imageToBase64(filePath);
            saveImageToDB(file, base64);
        }
    });
});

// Close the database connection after a delay to ensure all inserts complete
setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error("Error closing database:", err.message);
        } else {
            console.log("Database connection closed.");
        }
    });
}, 5000);
