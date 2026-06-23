import { create } from "zustand";
import { userService } from "../service/user.service";

export const useUserStore = create((set, get) => ({
    allDetailUsers: [],
    loading: false,

    selectedUser: null,
    setSelectedUser: (user) => set({ selectedUser: user }),

    selectedUserDutyStatistics: {},
    fetchSelectedUserDutyStatistics: async (userId, startDate, endDate) => {
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

    async fetchUserById(id) {
        try {
            const data = await userService.getById(id);
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    },

    async updateUser(id, userData) {
        try {
            const data = await userService.update(id, userData);
            return data;
        } catch (err) {
            console.log(err);
            return null;
        }
    },

    async updateTeam(data) {
        try {
            const result = await userService.updateTeam(data);
            await get().fetchAllDetailUsers();

            return result;
        } catch (err) {
            console.log(err);
            return null;
        }
    },
}));
