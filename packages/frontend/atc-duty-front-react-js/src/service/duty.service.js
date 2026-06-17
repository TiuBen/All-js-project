import dayjs from "dayjs";
import { http } from "./http";

export const dutyService = {
    /**
     * 获取所有在岗记录（outTime = null）
     */
    async listOnDuty() {
        // const data = await http.get('/duty')
        const data = await http.get("/duty", {
            params: {
                outTime: "null",
            },
        });
        console.log("service duty listOnDuty:", data);
        return data; // 提取数据部分
    },

    /**
     * 离岗（写 outTime）
     */
    leaveDuty(dutyId) {
        return http.post(`/duty/${dutyId}/leave`);
    },

    async getDutyRecords(query) {
        const { year, month, userId } = query;
        const base = dayjs().year(year).month(month);

        const inTime = base.startOf("month").format("YYYY-MM-DD HH:mm:ss");
        const outTime = base.endOf("month").format("YYYY-MM-DD HH:mm:ss");
        let _query = { inTime, outTime, userId };
        console.log(_query);

        const data = await http.get(`/duty`, {
            params: _query,
        });
        console.log("getDutyRecords", _query);
        console.log("getDutyRecords", data);
        return data; // 提取数据部分
    },
};
