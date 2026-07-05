import { create } from "zustand";
import { positionService } from "../service/position.service";
import dayjs from "dayjs";
import { subscribeWithSelector } from "zustand/middleware";

export const useAppStore = create(
    subscribeWithSelector((set, get) => ({
        isLeftBarOpen: true,
        toggleLeftBar: () =>
            set((state) => ({
                isLeftBarOpen: !state.isLeftBarOpen,
            })),

        positions: [],
        positionsLoading: true,
        async fetchPositions() {
            set({ positionsLoading: true });
            try {
                const data = await positionService.list();
                set({ positions: data, positionsLoading: false });
            } catch {
                set({ positionsLoading: false });
            }
        },

        async createPosition(positionData) {
            try {
                const data = await positionService.create(positionData);
                return data;
            } catch (err) {
                console.log(err);
                return null;
            }
        },

        async updatePosition(id, positionData) {
            try {
                const data = await positionService.update(id, positionData);
                return data;
            } catch (err) {
                console.log(err);
                return null;
            }
        },

        detailUsers: [],

        // selectedYear: dayjs().year(),
        // setSelectedYear: (year) => set({ selectedYear: year }),
        // selectedMonth: dayjs().month(),
        // setSelectedMonth: (month) => set({ selectedMonth: month }),

        selectedYear: dayjs().year(),
        setSelectedYear: (year) => {
            const prevYear = get().selectedYear;
            console.log(`📅 [Year] ${prevYear} → ${year}`);
            set({ selectedYear: year });
        },

        selectedMonth: dayjs().month(),
        setSelectedMonth: (month) => {
            const prevMonth = get().selectedMonth;
            console.log(`📅 [Month] ${prevMonth + 1}月 → ${month + 1}月`);
            set({ selectedMonth: month });
        },
    }))
);
