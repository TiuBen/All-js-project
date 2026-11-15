// v6-e-train/utils/dbHelper.js - sqlite3 回调 API 的 Promise 封装
// service 层只和这三个函数打交道，不再直接写 new Promise

// 执行写操作（INSERT / UPDATE / DELETE），返回 { lastID, changes }
function run(sql, params = []) {
    const db = require("../config/db");
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

// 查询单行
function get(sql, params = []) {
    const db = require("../config/db");
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
}

// 查询多行
function all(sql, params = []) {
    const db = require("../config/db");
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}

// 串行执行一段建库脚本
function exec(sql) {
    const db = require("../config/db");
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => (err ? reject(err) : resolve()));
    });
}

// 本地时间格式化（不用 toISOString，避免时区导致差一天）
function now() {
    const d = new Date();
    const p = (n) => (n < 10 ? "0" + n : "" + n);
    return (
        `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
        `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
    );
}

module.exports = { run, get, all, exec, now };
