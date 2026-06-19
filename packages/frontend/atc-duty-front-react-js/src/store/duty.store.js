// /store/onDutyStore.ts

import { create } from "zustand";
import { dutyService } from "@/service/duty.service";
import dayjs from "dayjs";

export const useDutyStore = create((set, get) => ({
    dutyRecords: [],
    loading: false,

    async fetchOnDuty() {
        set({ loading: true });
        try {
            const data = await dutyService.listOnDuty();
            set({ dutyRecords: data, loading: false });
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
            const next = get().dutyRecords.filter((d) => d.id !== dutyId);
            set({ dutyRecords: next, loading: false });
        } catch (err) {
            set({ loading: false, error: err?.message ?? "离岗失败" });
        }
    },

    positionStatistics: [],
    fetchPositionStatistics: async (startDate, endDate) => {
        try {
            const data = await dutyService.getDutyRecords({
                year: dayjs(startDate).year(),
                month: dayjs(startDate).month(),
            });

            const positionMap = {};

            data.forEach((record) => {
                const pos = record.position;
                if (!pos) return;

                if (!positionMap[pos]) {
                    positionMap[pos] = {
                        position: pos,
                        mainTotalHours: 0,
                        mainCount: 0,
                        subTotalHours: 0,
                        subCount: 0,
                    };
                }

                const inTime = dayjs(record.inTime);
                const outTime = record.outTime ? dayjs(record.outTime) : dayjs();
                const hours = outTime.diff(inTime, "hour", true);

                const isMain = record.roleType !== "副班";
                if (isMain) {
                    positionMap[pos].mainTotalHours += hours;
                    positionMap[pos].mainCount += 1;
                } else {
                    positionMap[pos].subTotalHours += hours;
                    positionMap[pos].subCount += 1;
                }
            });

            const result = Object.values(positionMap).map((item) => ({
                ...item,
                mainAvgHours: item.mainCount > 0 ? item.mainTotalHours / item.mainCount : 0,
                subAvgHours: item.subCount > 0 ? item.subTotalHours / item.subCount : 0,
            }));

            set({ positionStatistics: result });
        } catch (err) {
            console.log(err);
        }
    },
}));
