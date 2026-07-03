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

        // await Promise.all([get().fetchStatistics(), get().fetchNightCount()]);
        await get().fetchNightCount();
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

    allUserNightCount: {},
    fetchNightCount: async () => {
        const { query } = get();

        try {
            set({
                allUserNightCount: {},
                loading: true,
            });
            const data = await statisticsService.getNightCount({ year: query.year, month: query.month + 1 });

            set({
                allUserNightCount: data,
                loading: false,
            });
        } catch (err) {
            console.log(err);
            set({ loading: false });
        }
    },
}));
