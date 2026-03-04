import { http } from "./http";

export const userService = {
    async list() {
        const data = await http.get("/users");
        console.log("service user:", data);
        return data;
    },

    async update(id, data) {
        const response = await http.put(`/users/${id}`, data);
        return response;
    },
};
