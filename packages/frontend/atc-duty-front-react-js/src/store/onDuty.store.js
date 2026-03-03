// /store/onDutyStore.ts

import { create } from "zustand";
import { onDutyService } from "../service/onDuty.service";

export const useOnDutyStore = create((set, get) => ({
    list: [], //  all duty records outTime ==null
    loading: false,

    async fetch() {
        set({ loading: true });
        try {
            const data = await onDutyService.listOnDuty();
            set({ list: data, loading: false });
        } catch (err) {
            set({ loading: false });
        }
    },

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
