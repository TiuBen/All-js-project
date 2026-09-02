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

DutyDb.run(`
    CREATE TRIGGER IF NOT EXISTS log_all_duty_updates
    AFTER UPDATE ON duty
    FOR EACH ROW
    BEGIN
        INSERT INTO duty_audit_log (
            duty_row_id, 
            username, 
            action_type, 
            old_data, 
            new_data
        )
        VALUES (
            NEW.id, 
            NEW.username, 
            'UPDATE', 
            json_object(
                'id', OLD.id,
                'userId', OLD.userId,
                'username', OLD.username,
                'position', OLD.position,
                'dutyType', OLD.dutyType,
                'inTime', OLD.inTime,
                'outTime', OLD.outTime,
                'roleType', OLD.roleType,
                'relatedDutyTableRowId', OLD.relatedDutyTableRowId,
                'roleStartTime', OLD.roleStartTime,
                'roleEndTime', OLD.roleEndTime,
                'roleTimes', OLD.roleTimes,
                'status', OLD.status,
                'relatedPrepareTableId', OLD.relatedPrepareTableId
            ),
            json_object(
                'id', NEW.id,
                'userId', NEW.userId,
                'username', NEW.username,
                'position', NEW.position,
                'dutyType', NEW.dutyType,
                'inTime', NEW.inTime,
                'outTime', NEW.outTime,
                'roleType', NEW.roleType,
                'relatedDutyTableRowId', NEW.relatedDutyTableRowId,
                'roleStartTime', NEW.roleStartTime,
                'roleEndTime', NEW.roleEndTime,
                'roleTimes', NEW.roleTimes,
                'status', NEW.status,
                'relatedPrepareTableId', NEW.relatedPrepareTableId
            )
        );
    END;
    `);

DutyDb.run(`
        CREATE TRIGGER IF NOT EXISTS log_all_duty_deletes
        AFTER DELETE ON duty
        FOR EACH ROW
        BEGIN
            INSERT INTO duty_audit_log (
                duty_row_id, 
                username, 
                action_type, 
                old_data, 
                new_data
            )
            VALUES (
                OLD.id, 
                OLD.username, 
                'DELETE', 
                json_object(
                    'id', OLD.id,
                    'userId', OLD.userId,
                    'username', OLD.username,
                    'position', OLD.position,
                    'dutyType', OLD.dutyType,
                    'inTime', OLD.inTime,
                    'outTime', OLD.outTime,
                    'roleType', OLD.roleType,
                    'relatedDutyTableRowId', OLD.relatedDutyTableRowId,
                    'roleStartTime', OLD.roleStartTime,
                    'roleEndTime', OLD.roleEndTime,
                    'roleTimes', OLD.roleTimes,
                    'status', OLD.status,
                    'relatedPrepareTableId', OLD.relatedPrepareTableId
                ),
                NULL
            );
        END;
        `);

DutyDb.run(`
    CREATE TABLE IF NOT EXISTS duty_audit_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    duty_row_id INTEGER NOT NULL,
    username TEXT,
    action_type TEXT NOT NULL,
    old_data TEXT,
    new_data TEXT,
    changed_at DATETIME DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
    );
`);

DutyDb.exec(`
    CREATE TABLE IF NOT EXISTS hr_duty_summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        username TEXT DEFAULT NULL,
        duty_date TEXT NOT NULL,
        value TEXT DEFAULT NULL,
        value_text TEXT,
        UNIQUE(userId, duty_date)
    );
    `);

// DutyDb.run(`
// DROP TRIGGER IF EXISTS  log_all_duty_updates;
// `);

const userDbPath = path.join(__dirname, "../src/user-face.db");

const UserDb = new sqlite3.Database(userDbPath, (err) => {
    if (err) {
        console.error("Error opening database UserDb:", err.message);
    } else {
        console.log("用户信息数据库连接正常");
    }
});

module.exports = { DutyDb, UserDb };
