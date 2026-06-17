const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dutyDbPath = path.join(__dirname, "../src/test.db");
const DutyDb = new sqlite3.Database(dutyDbPath, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log("考勤数据库连接正常");
});

// 插入前先检查 duty 表里是否已经存在同一个 username 且 outTime IS NULL 的记录，如果存在，就阻止插入。

DutyDb.run(`
CREATE TRIGGER IF NOT EXISTS prevent_insert_if_unfinished
BEFORE INSERT ON duty
FOR EACH ROW
WHEN EXISTS (
    SELECT 1
    FROM duty
    WHERE username = NEW.username
      AND outTime IS NULL
)
BEGIN
    SELECT RAISE(ABORT, '该用户已有未结束的 duty 记录，禁止插入');
END;
`);

// DutyDb.run(`
// CREATE TRIGGER IF NOT EXISTS update_related_duty_outTime
// AFTER UPDATE OF outTime ON duty
// FOR EACH ROW
// WHEN NEW.relatedDutyRowId IS NOT NULL
// BEGIN
//     -- 获取最后一个relatedDutyRowId
//     WITH split(id, str, pos) AS (
//         SELECT 
//             1, 
//             NEW.relatedDutyRowId || ';', 
//             instr(NEW.relatedDutyRowId || ';', ';')
//         UNION ALL
//         SELECT 
//             id + 1,
//             substr(str, pos + 1),
//             instr(substr(str, pos + 1), ';')
//         FROM split
//         WHERE pos > 0
//     )
//     -- 更新最后一个相关记录的outTime
//     UPDATE duty
//     SET outTime = strftime('%Y-%m-%d %H:%M:%S', 'now')
//     WHERE id = (
//         SELECT substr(str, 1, pos - 1)
//         FROM split
//         WHERE id = (SELECT max(id) FROM split WHERE pos > 0)
//     );
// END;
// `);

DutyDb.run(`
DROP TRIGGER IF EXISTS  update_related_duty_outTime;
`)

const userDbPath = path.join(__dirname, "../src/user-face.db");

const UserDb = new sqlite3.Database(userDbPath, (err) => {
    if (err) {
        console.error("Error opening database UserDb:", err.message);
    } else {
        console.log("用户信息数据库连接正常");
    }
});

module.exports = { DutyDb, UserDb };
