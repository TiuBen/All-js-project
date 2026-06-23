// /store/onDutyStore.ts

import { create } from "zustand";
import { dutyService } from "@/service/duty.service";
import dayjs from "dayjs";
import { subscribeWithSelector } from "zustand/middleware";

export const useDutyStore = create(
    subscribeWithSelector((set, get) => ({
        dutyRecords: [],
        loading: false,

        async getDutyRecords(query) {
            // const { query } = get();
            console.log(query);
            set({
                dutyRecords: [],
                loading: true,
            });
            try {
                const data = await dutyService.getDutyRecords(query);
                set({ dutyRecords: data, loading: false });
            } catch (err) {
                console.log(err);
                set({ loading: false, dutyRecords: [] });
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

        async updateDuty(id, data) {
            try {
                const result = await dutyService.updateDuty(id, data);
                return result;
            } catch (err) {
                console.log(err);
                return null;
            }
        },

        async deleteDuty(id) {
            try {
                const result = await dutyService.deleteDuty(id);
                return result;
            } catch (err) {
                console.log(err);
                return null;
            }
        },

        async createDuty(data) {
            try {
                const result = await dutyService.createDuty(data);
                return result;
            } catch (err) {
                console.log(err);
                return null;
            }
        },

        // positionStatistics: [],
        // fetchPositionStatistics: async (startDate, endDate) => {
        //     try {
        //         const data = await dutyService.getDutyRecords({
        //             year: dayjs(startDate).year(),
        //             month: dayjs(startDate).month(),
        //         });

        //         const positionMap = {};

        //         data.forEach((record) => {
        //             const pos = record.position;
        //             if (!pos) return;

        //             if (!positionMap[pos]) {
        //                 positionMap[pos] = {
        //                     position: pos,
        //                     mainTotalHours: 0,
        //                     mainCount: 0,
        //                     subTotalHours: 0,
        //                     subCount: 0,
        //                 };
        //             }

        //             const inTime = dayjs(record.inTime);
        //             const outTime = record.outTime ? dayjs(record.outTime) : dayjs();
        //             const hours = outTime.diff(inTime, "hour", true);

        //             const isMain = record.roleType !== "副班";
        //             if (isMain) {
        //                 positionMap[pos].mainTotalHours += hours;
        //                 positionMap[pos].mainCount += 1;
        //             } else {
        //                 positionMap[pos].subTotalHours += hours;
        //                 positionMap[pos].subCount += 1;
        //             }
        //         });

        //         const result = Object.values(positionMap).map((item) => ({
        //             ...item,
        //             mainAvgHours: item.mainCount > 0 ? item.mainTotalHours / item.mainCount : 0,
        //             subAvgHours: item.subCount > 0 ? item.subTotalHours / item.subCount : 0,
        //         }));

        //         set({ positionStatistics: result });
        //     } catch (err) {
        //         console.log(err);
        //     }
        // },
    }))
);

let timer = null;

useDutyStore.subscribe(
    (state) => state.query,
    () => {
        clearTimeout(timer);

        timer = setTimeout(() => {
            useDutyStore.getState().getDutyRecords();
        }, 200);
    }
);
