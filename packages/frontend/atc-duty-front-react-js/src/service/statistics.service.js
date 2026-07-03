import { http } from "./http";

export const statisticsService = {
    async getStatistics(query) {
        const data = await http.get("/statistics", { params: query });
        console.log("service statistics:", data);

        return data;
    },

    async getNightCount(query) {
        console.log(query);
        const data = await http.get("/statistics/night-count", { params: query });
        console.log("service statistics getNightCount:", data);

        return data;
    },
};
