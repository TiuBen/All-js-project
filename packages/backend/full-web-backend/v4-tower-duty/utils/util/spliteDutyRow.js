const dayjs = require("dayjs");
function splitDutyByRole(record) {
    const { position, roleType, inTime, outTime, roleStartTime, roleEndTime } = record;

    const dutyStart = dayjs(inTime);
    const dutyEnd = dayjs(outTime);

    // 基础校验
    if (!dutyStart.isValid() || !dutyEnd.isValid()) {
        return { error: "invalid duty time" };
    }

    if (!dutyStart.isBefore(dutyEnd)) {
        return { error: "inTime must be before outTime" };
    }

    // 没有角色时间，直接返回整段
    if (!roleStartTime && !roleEndTime && position === "领班") {
        return [
            {
                start: inTime,
                end: outTime,
                type: position + " " + roleType,
            },
        ];
    }

    // 角色时间必须成对出现
    if (!roleStartTime || !roleEndTime) {
        return { error: "roleStartTime and roleEndTime must both exist" };
        if (Array.isArray(roleStartTime) && Array.isArray(roleEndTime)) {
            if (roleStartTime.length !== roleEndTime.length) {
                return { error: "roleStartTime and roleEndTime must have same length" };
            }
            let seg = [];
            // 有成对的角色时间
            for (let i = 0; i < roleStartTime.length; i++) {
                const roleStart = dayjs(roleStartTime[i]);
                const roleEnd = dayjs(roleEndTime[i]);

                if (!roleStart.isValid() || !roleEnd.isValid()) {
                    return { error: "invalid role time" };
                }

                if (!roleStart.isBefore(roleEnd)) {
                    return { error: " roleStartTime must be before roleEndTime" };
                }
                if (roleStart.isBefore(dutyStart) || roleEnd.isAfter(dutyEnd)) {
                    return { error: "role time out of duty range" };
                }
                seg.push({
                    start: roleStartTime[i],
                    end: roleEndTime[i],
                    type: "role",
                });
            }
        } else if (roleStartTime && roleEndTime) {
            return [
                {
                    start: roleStartTime,
                    end: roleEndTime,
                    type: "role",
                },
            ];
        }
    }

    const roleStart = dayjs(roleStartTime);
    const roleEnd = dayjs(roleEndTime);

    if (!roleStart.isValid() || !roleEnd.isValid()) {
        return { error: "invalid role time" };
    }

    if (!roleStart.isBefore(roleEnd)) {
        return { error: "roleStartTime must be before roleEndTime" };
    }

    if (roleStart.isBefore(dutyStart) || roleEnd.isAfter(dutyEnd)) {
        return { error: "role time out of duty range" };
    }

    const result = [];

    // 前半段 normal
    if (dutyStart.isBefore(roleStart)) {
        result.push({
            start: dutyStart.format("YYYY-MM-DD HH:mm:ss"),
            end: roleStart.format("YYYY-MM-DD HH:mm:ss"),
            type: "normal",
        });
    }

    // role
    result.push({
        start: roleStart.format("YYYY-MM-DD HH:mm:ss"),
        end: roleEnd.format("YYYY-MM-DD HH:mm:ss"),
        type: "role",
    });

    // 后半段 normal
    if (roleEnd.isBefore(dutyEnd)) {
        result.push({
            start: roleEnd.format("YYYY-MM-DD HH:mm:ss"),
            end: dutyEnd.format("YYYY-MM-DD HH:mm:ss"),
            type: "normal",
        });
    }

    return result;
}
