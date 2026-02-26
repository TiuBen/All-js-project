import { http } from "./http";

export const positionService = {
    async list() {
        const data = await http.get("/positions");
        console.log("service positions:", data);

        return data;
    },

    update(id, data) {
        return http.put(`/positions/${id}`, data);
    },
};
