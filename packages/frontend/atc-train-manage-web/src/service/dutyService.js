import { API_URL } from "../utils/const/Const.js";

const dutyService = {
    async fetchDuties(page, limit = 10) {
        const url = `${API_URL.duty}?page=${page}&limit=${limit}`;
        const res = await fetch(url);
        return await res.json();
    },
};

export default dutyService;