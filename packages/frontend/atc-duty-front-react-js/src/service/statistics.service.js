import { http } from "./http";

export const statisticsService = {
    async getStatistics(query) {
        const data = await http.get("/statistics", { query });
        console.log("service statistics:", data);

        return data;
    },
};
