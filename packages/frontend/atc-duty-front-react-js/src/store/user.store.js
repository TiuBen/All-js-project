import { create } from "zustand";
import { userService } from "../service/user.service";
import { subscribeWithSelector } from "zustand/middleware";

export const useUserStore = create(
    subscribeWithSelector((set, get) => ({
        allDetailUsers: [],
        loading: false,

        selectedUser: null,
        setSelectedUser: (user) => set({ selectedUser: user }),

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
                const users = await userService.list();
                set((state) => {
                    const newSelectedUser =
                        state.selectedUser?.id === id ? users.find((u) => u.id === id) : state.selectedUser;

                    return {
                        allDetailUsers: users,
                        selectedUser: newSelectedUser,
                    };
                });

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
    }))
);
