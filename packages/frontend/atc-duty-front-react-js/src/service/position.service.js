import { http } from "./http";

export const positionService = {
    async list() {
        const data = await http.get("/positions");
        return data;
    },

    async create(data) {
        const response = await http.post("/positions", data);
        return response;
    },

    async update(id, data) {
        const response = await http.put(`/positions/${id}`, data);
        return response;
    },
};
