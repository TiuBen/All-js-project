const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./test-v2.db");

function allAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}
function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

(async () => {
    const rows = await allAsync(`SELECT id, roleType, relatedDutyTableRowId FROM duty ORDER BY id`);

    for (const row of rows) {
        const { id, roleType, relatedDutyTableRowId } = row;

        // case 1: 见习
        if (roleType === "见习") {
            // const _r=relatedDutyTableRowId.match(/\d+/g).map(Number);
            // const related = await allAsync(`SELECT id FROM duty WHERE relatedDutyTableRowId = ?`, [id]);
            // if (related.length > 0) {
            //     const ids = related.map((r) => r.id);
            //     await runAsync(`UPDATE duty SET relatedDutyTableRowId = ? WHERE id = ?`, [JSON.stringify(ids), id]);
            //     console.log(`见习 duty ${id} → relatedDutyTableRowId = ${JSON.stringify(ids)}`);
            // }
        }

        // case 2: 非见习 + 有 relatedDutyTableRowId
        else if (relatedDutyTableRowId) {
            const ids = relatedDutyTableRowId.split(";").filter(Boolean);

            if (ids.length > 0) {
                const placeholders = ids.map(() => "?").join(",");
                const relatedRows = await allAsync(
                    `SELECT id, inTime, outTime FROM duty WHERE id IN (${placeholders})`,
                    ids
                );

                // 拆分出 inTime / outTime 数组
                const inTimes = relatedRows.map((r) => r.inTime);
                const outTimes = relatedRows.map((r) => r.outTime);
                await runAsync(`UPDATE duty SET relatedDutyTableRowId = ?,  roleStartTime = ?, roleEndTime = ? WHERE id = ?`, [
                    JSON.stringify(ids),
                    JSON.stringify(inTimes),
                    JSON.stringify(outTimes),
                    id,
                ]);
                console.log(`非见习 duty ${id} → roleTimes = ${JSON.stringify(relatedRows)}`);
            }
        }
    }

    console.log("逐行处理完成 ✅");
    db.close();
})();
