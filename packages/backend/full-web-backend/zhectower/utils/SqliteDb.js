const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dutyDatabasePath = path.join(__dirname, "test.db");
const db = new sqlite3.Database(dutyDatabasePath, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("lian jie ok");
});

const atcLicenseExamDatabasePath = path.join(__dirname, "gzyzz2024.db");
const AtcLicenseExam = new sqlite3.Database(atcLicenseExamDatabasePath, (err) => {
    if (err) {
        console.error(err);
    }
    console.log("AtcLicenseExam lian jie ok");
});

const faceImageDatabasePath = path.join(__dirname, "user-face.db");
const faceImageDb = new sqlite3.Database(faceImageDatabasePath, (err) => {
    if (err) {
        console.error("Error opening database faceImageDb:", err.message);
    } else {
        console.log("Connected faceImageDb to SQLite database.");
    }
});

const settingDatabasePath = path.join(__dirname, "user-face.db");
const settingDb = new sqlite3.Database(settingDatabasePath, (err) => {
    if (err) {
        console.error("Error opening database faceImageDb:", err.message);
    } else {
        console.log("Connected faceImageDb to SQLite database.");
    }
});

module.exports = { db, AtcLicenseExam, faceImageDb, settingDb };
