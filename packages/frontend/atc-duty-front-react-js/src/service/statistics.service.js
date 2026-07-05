import { http } from "./http";

export const statisticsService = {
    async getStatistics(query) {
        console.log(query);

        const data = await http.get("/statistics/duty-duration", { params: query });
        console.log("service statistics duty-duration:", data);

        return data;
    },

    async getNightCount(query) {
        console.log(query);
        const data = await http.get("/statistics/night-count", { params: query });
        console.log("service statistics getNightCount:", data);

        return data;
    },

    async getPositionSummary(query) {
        console.log(query);
        const data = await http.get("/statistics/position-summary", { params: query });
        console.log("service statistics  position summary:", data);

        return data;
    },

    async getCheckDuration(query) {
        console.log(query);
        const data = await http.get("/statistics/check-duration", { params: query });
        console.log("service statistics  check-duration:", data);

        return data;
    },
};
