// services/userService.js
import dayjs from "dayjs";
import { API_URL } from "../utils/const/Const.js";

// 用户相关 API 封装
const userService = {
    // 初始化数据
    async initStoreData() {
        const [positionsRes, usersRes, groupedUsersRes, onDutyUsersRes] = await Promise.all([
            fetch(`${API_URL.positions}?display=true`).then((r) => r.json()),
            fetch(API_URL.users + `?fields=${encodeURIComponent("id,team,username,rank")}`).then((r) => r.json()),
            fetch(`${API_URL.users}?fields=${encodeURIComponent("id,username,team,position")}&groupBy=team`).then((r) =>
                r.json()
            ),
            fetch(`${API_URL.duty}?outTime=null`).then((r) => r.json()),
        ]);

        const groupedUsers = groupedUsersRes;
        const detailUsers = groupedUsersRes
            .flat()
            .map(({ id, username, team, position }) => ({ id, username, position }));

        return { positionsRes, usersRes, groupedUsers, detailUsers, onDutyUsersRes };
    },

    // 更新单个用户
    async updateUser(userId, updatedData) {
        const response = await fetch(`${API_URL.users}/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });
        if (!response.ok) throw new Error("更新用户失败");
        return await response.json();
    },

    // 获取当前值班用户
    async fetchOnDutyUsers() {
        const res = await fetch(`${API_URL.duty}?outTime=null`);
        return await res.json();
    },

    // 更新 duty 记录
    async updateDutyRecord(dutyRecord, onDutyUsers) {
        const _temp = structuredClone(dutyRecord);

        if (_temp.roleType === null) {
            // 仅自己
            return Promise.all([
                fetch(`${API_URL.duty}/${_temp.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ outTime: dayjs().format("YYYY-MM-DD HH:mm:ss") }),
                }).then((r) => r.json()),
            ]);
        }

        // 带教员 / 见习逻辑
        let studentData, studentDataID, teacherData, teacherDataID;

        if (_temp.roleType === "见习" && _temp.relatedDutyTableRowId) {
            studentData = {
                outTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                roleEndTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            };
            studentDataID = _temp.id;

            teacherDataID = _temp.relatedDutyTableRowId;
            let _teacher = onDutyUsers.find((item) => item.id === teacherDataID);
            let _rd = Array.isArray(_teacher.roleEndTime)
                ? [..._teacher.roleEndTime, dayjs().format("YYYY-MM-DD HH:mm:ss")]
                : [dayjs().format("YYYY-MM-DD HH:mm:ss")];

            teacherData = { roleType: null, roleEndTime: _rd };
        } else if (_temp.roleType === "教员") {
            studentData = {
                outTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                roleEndTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            };
            studentDataID = _temp.relatedDutyTableRowId.slice(-1)[0];

            let _rd = Array.isArray(_temp.roleEndTime)
                ? [..._temp.roleEndTime, dayjs().format("YYYY-MM-DD HH:mm:ss")]
                : [dayjs().format("YYYY-MM-DD HH:mm:ss")];

            teacherData = {
                roleType: null,
                roleEndTime: _rd,
                outTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            };
            teacherDataID = _temp.id;
        }

        const requests = [
            { id: studentDataID, data: studentData },
            { id: teacherDataID, data: teacherData },
        ].map(({ id, data }) =>
            fetch(`${API_URL.duty}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            }).then((r) => r.json())
        );

        return Promise.all(requests);
    },
};

export default userService;
