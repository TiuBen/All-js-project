import { http } from "./http";

export const fileService = {
    async getSelectedYearMonthUserExcelRows(selectedYear, selectedMonth, selectedUser) {
        const data = await http.get("/file/duty-rows", {
            params: {
                year: selectedYear,
                month: selectedMonth,
                username: selectedUser,
            },
        });
        return data;
    },
};
