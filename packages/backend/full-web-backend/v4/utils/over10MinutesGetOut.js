function over10MinutesGetOut(db) {
    // const sql = `SELECT * FROM duty WHERE outTime = null`;

    // db.all(sql, (err, rows) => {
    //     if (err) {
    //         console.error("Error fetching data:", err);
    //         return;
    //     }
    //     if (rows.length > 0) {
    //         // 有没有结束的duty
    //         const groups = {};
    //         rows.forEach((row) => {
    //             const key = `${item.position}-${item.dutyType ?? "null"}`;
    //             if (!groups[key]) groups[key] = [];
    //             groups[key].push(item);
    //         });

    //         // 遍历每个分组
    //         for (const key in groups) {
    //             const group = groups[key];
    //             if (group.length === 2) {
    //                 // 按 ID 升序
    //                 const sorted = group.sort((a, b) => a.id - b.id);
    //                 const smaller = sorted[0];
    //                 const bigger = sorted[1];

    //                 // bigger.inTime 距离现在超过 10 分钟
    //                 const diffMs = Date.now() - new Date(bigger.inTime).getTime();
    //                 if (diffMs >= 30 * 1000) {
    //                     // await  updateOutTime(smaller);
    //                 }
    //             }
    //         }
    //     }
    // });
}


