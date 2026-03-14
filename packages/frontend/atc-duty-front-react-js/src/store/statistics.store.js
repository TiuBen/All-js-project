import { create } from "zustand";
import { statisticsService } from "../service/statistics.service";

export const useStatisticsStore = create((set, get) => ({
    statistics: {}, //  all duty records outTime ==null
    loading: false,

    query: {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        date: new Date().getDate(),
        userId: 0,
        positionId: 0,
        statisticsType: "",
    },
    setQuery: async (patch) => {
        set((state) => ({
            query: { ...state.query, ...patch },
        }));

        await get().fetchStatistics();
    },

    async fetchStatistics() {
        const { query } = get();
        try {
            const data = await statisticsService.getStatistics(query);
            set({ statistics: data, loading: false });
        } catch (err) {
            console.log(err);

            set({ loading: false });
        }
    },
}));
