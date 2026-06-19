import { http } from "./http";

export const userService = {
    async list() {
        const data = await http.get("/users");
        return data;
    },

    async update(id, data) {
        const response = await http.put(`/users/${id}`, data);
        return response;
    },

    async getDutyStatistics(userId, startDate, endDate) {
        const data = await http.get(`/users/${userId}/dutyStatistics`, {
            params: {
                startDate,
                startTime: "00:00:00",
                endDate,
                endTime: "00:00:01",
            },
        });
        return data;
    },
};
