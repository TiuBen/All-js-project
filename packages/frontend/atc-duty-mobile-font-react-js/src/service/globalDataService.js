import { API_URL } from "../utils/const/Const.js";

const globalDataService = {
    async fetchPositions() {
        const res = await   fetch(`${API_URL.positions}?display=true`);
        return await res.json();
    },


}
