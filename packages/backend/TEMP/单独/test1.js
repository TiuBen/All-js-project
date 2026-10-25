function splitDutyRow(rows) {
    const newDutyRow = [];
    rows.forEach((row) => {
        const { inTime, outTime, roleStartTime, roleEndTime, relatedDutyTableRowId, ...rest } = row;

        if (!Array.isArray(roleStartTime) || roleStartTime.length === 0) {
            // 没有关联，直接返回原对象
            newDutyRow.push(structuredClone(row));
        } else {
            let prev = inTime;
            for (let i = 0; i < roleStartTime.length; i++) {
                const x = structuredClone(row);
                x.inTime = prev;
                x.outTime = roleStartTime[i];
                newDutyRow.push(x);
                prev = roleStartTime[i];

                const j = structuredClone(row);
                j.inTime = prev;
                j.outTime = roleEndTime[i];
                j.roleType = "教员";
                newDutyRow.push(j);

                prev = roleEndTime[i];
            }
            const last = structuredClone(row);
            last.inTime = prev;
            last.outTime = outTime;
            newDutyRow.push(last);
        }
    });

    return newDutyRow;
}

const dutyRow = [
    {
        id: 10658,
        userId: 4,
        username: "董志华",
        position: "西塔台",
        dutyType: "主班",
        inTime: "2025-09-01 07:08:05",
        outTime: "2025-09-01 11:05:30",
        roleType: null,
        relatedDutyTableRowId: ["10659", "10661"],
        roleStartTime: ["2025-09-01 07:08:30", "2025-09-01 08:35:44"],
        roleEndTime: ["2025-09-01 08:21:59", "2025-09-01 11:05:30"],
        roleTimes: null,
        status: null,
        relatedPrepareTableId: null,
    },
];


(function () { 
        console.log(splitDutyRow(dutyRow));
})();