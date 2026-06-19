// /store/onDutyStore.ts

import { create } from "zustand";
import { userService } from "../service/user.service";

export const useUserStore = create((set, get) => ({
    allDetailUsers: [],
    loading: false,

    selectedUser: null,
    setSelectedUser: (user) => set({ selectedUser: user }),

    dutyStatistics: {},
    fetchDutyStatistics: async (userId, startDate, endDate) => {
        try {
            const data = await userService.getDutyStatistics(userId, startDate, endDate);
            set({ dutyStatistics: data });
        } catch (err) {
            console.log(err);
        }
    },

    async fetchAllDetailUsers() {
        set({ loading: true });
        try {
            const data = await userService.list();
            set({ allDetailUsers: data, loading: false });
        } catch (err) {
            console.log(err);
            set({ loading: false });
        }
    },
}));
