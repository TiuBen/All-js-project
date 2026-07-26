import { http } from "./http";

export const dutyService = {
    async listOnDuty() {
        const data = await http.get("/duty", {
            params: { outTime: "null" },
        });
        return data;
    },

    leaveDuty(dutyId) {
        return http.post(`/duty/${dutyId}/leave`);
    },

    async getDutyRecords(query) {
        // const { year, month, username,outTime } = query;
        // const base = dayjs().year(year).month(month);
        // const inTime = base.startOf("month").format("YYYY-MM-DD HH:mm:ss");
        // outTime =outTime?? base.endOf("month").format("YYYY-MM-DD HH:mm:ss");
        // const data = await http.get("/duty", { params: { inTime, outTime, username } });
        // return data;

        // const { year, month, username, outTime } = query;
        // const base = dayjs().year(year).month(month);
        // // 只使用 query 中存在的字段
        // const params = {};
        // if (year !== undefined) params.year = year;
        // if (month !== undefined) params.month = month;
        // if (username !== undefined) params.username = username;
        // if (outTime !== undefined) params.outTime = outTime;

        // // 但 inTime 和 outTime 需要特殊处理
        // if (year !== undefined && month !== undefined) {
        //     params.inTime = base.startOf("month").format("YYYY-MM-DD HH:mm:ss");
        //     params.outTime = outTime ?? base.endOf("month").format("YYYY-MM-DD HH:mm:ss");
        // }

        // console.log({ params: { ...query } });
        const data = await http.get("/duty", { params: { ...query } });
        return data;
    },

    async getDutyRecordsByUser(username, startDate, endDate) {
        const data = await http.get("/duty", {
            params: {
                username,
                inTime: `${startDate} 00:00:00`,
                outTime: `${endDate} 00:00:01`,
            },
        });
        return data;
    },

    async updateDuty(id, data) {
        const response = await http.put(`/duty/${id}`, data);
        return response;
    },

    async deleteDuty(id) {
        const response = await http.delete(`/duty/${id}`);
        return response;
    },

    async createDuty(data) {
        const response = await http.post("/duty", data);
        return response;
    },

    async getHrDutySummary(query) {
        const data = await http.get("/duty/hr-duty/list", { params: query });
        console.log("service getHrDutySummary :", data);
        return data;
    },
    async saveHrDutySummary(data) {
        const result = await http.post("/duty/hr-duty", data);
        console.log("service saveHrDutySummary :", result);

        return result;
    },
};
