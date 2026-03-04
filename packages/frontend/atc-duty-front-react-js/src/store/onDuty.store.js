// /store/onDutyStore.ts

import { create } from "zustand";
import { onDutyService } from "../service/onDuty.service";

export const onDutyStore = create((set, get) => ({
    list: [], //  all duty records outTime ==null
    loading: false,

    async fetchOnDuty() {
        set({ loading: true });
        try {
            const data = await onDutyService.listOnDuty();
            set({ list: data, loading: false });
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
            await onDutyService.leaveDuty(dutyId);

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
