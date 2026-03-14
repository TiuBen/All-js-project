// /store/onDutyStore.ts

import { create } from "zustand";
import { dutyService } from "@/service/duty.service";

export const useDutyStore = create((set, get) => ({
    dutyRecords: [], //  all duty records outTime ==null
    loading: false,

    async fetchOnDuty() {
        set({ loading: true });
        try {
            const data = await dutyService.listOnDuty();
            set({ list: data, loading: false });
        } catch (err) {
            console.log(err);

            set({ loading: false });
        }
    },

    query: {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        date: new Date().getDate(),
        userId: 0,
    },

    async getDutyRecords() {
        const { query } = get();
        try {
            const data = await dutyService.getDutyRecords(query);
            set({ dutyRecords: data, loading: false });
        } catch (err) {
            console.log(err);

            set({ loading: false });
        }
    },

    setQuery: async (patch) => {
        set((state) => ({
            query: { ...state.query, ...patch },
        }));

        await get().getDutyRecords();
    },

    async fetchDutyRecords() {
        set({ loading: true });
        try {
            const data = await dutyService.listOnDuty();
            set({ dutyRecords: data, loading: false });
        } catch (err) {
            console.log(err);

            set({ loading: false });
        }
    },

    selectedDutyRecord: null,
    setSelectedDutyRecord: (dutyRecord) => set({ selectedDutyRecord: dutyRecord }),

    async leaveDuty(dutyId) {
        set({ loading: true });
        try {
            await dutyService.leaveDuty(dutyId);

            // ✅ 本地直接移除，体验更好
            const next = get().list.filter((d) => d.id !== dutyId);
            set({ list: next, loading: false });
        } catch (err) {
            set({
                loading: false,
                error: err?.message ?? "离岗失败",
            });
        }
    },
}));
