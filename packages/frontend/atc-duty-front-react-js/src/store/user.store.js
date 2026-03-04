// /store/onDutyStore.ts

import { create } from "zustand";
import { userService } from "../service/user.service";

export const userStore = create((set, get) => ({
    allDetailUsers: [], //  all duty records outTime ==null
    loading: false,

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
