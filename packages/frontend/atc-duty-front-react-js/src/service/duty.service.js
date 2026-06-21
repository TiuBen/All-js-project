import dayjs from "dayjs";
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
        const { year, month, userId } = query;
        const base = dayjs().year(year).month(month);
        const inTime = base.startOf("month").format("YYYY-MM-DD HH:mm:ss");
        const outTime = base.endOf("month").format("YYYY-MM-DD HH:mm:ss");
        const data = await http.get("/duty", { params: { inTime, outTime, userId } });
        return data;
    },

    async getDutyRecordsByUser(userId, startDate, endDate) {
        const data = await http.get("/duty", {
            params: {
                userId,
                startDate,
                startTime: "00:00:00",
                endDate,
                endTime: "00:00:01",
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
};
