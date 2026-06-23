import { http } from "./http";

export const userService = {
    async list() {
        const data = await http.get("/users");
        return data;
    },

    async getById(id) {
        const data = await http.get(`/users/${id}`);
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

    //只能用来更新排序
    async updateTeam(data) {
        const results = await Promise.all(
            data.map((item) =>
                http.put(`/users/${item.id}`, {
                    team: item.team,
                    rank: item.rank,
                })
            )
        );
        console.log(results);
        return results;
    },
};
