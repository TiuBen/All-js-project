import { create } from "zustand";
import { statisticsService } from "../service/statistics.service";
import { useAppStore } from "./app.store";
import { useUserStore } from "./user.store";

export const useStatisticsStore = create((set, get) => ({
    statistics: {}, //  all duty records outTime ==null
    loading: false,

    nightCount: {},
    isNightCountLoading: false,
    fetchNightCount: async () => {
        const { selectedYear, selectedMonth } = useAppStore.getState();
        try {
            set({
                nightCount: {},
                isNightCountLoading: true,
            });
            const data = await statisticsService.getNightCount({ year: selectedYear, month: selectedMonth + 1 });

            set({
                nightCount: data,
                isNightCountLoading: false,
            });
        } catch (err) {
            console.log(err);
            set({ loading: false });
        }
    },

    // 某人 某年 某月的 考勤 统计
    userDutyDurationStatistics: {},
    isUserDutyDurationStatistics: false,
    fetchUserDutyDurationStatistics: async () => {
        const { selectedYear, selectedMonth } = useAppStore.getState();
        const { selectedUser } = useUserStore.getState();

        try {
            set({
                isUserDutyDurationStatistics: true,
            });
            const data = await statisticsService.getStatistics({
                userId: selectedUser.id,
                year: selectedYear,
                month: selectedMonth,
            });

            set({
                userDutyDurationStatistics: data,
                isUserDutyDurationStatistics: false,
            });
        } catch (error) {
            console.log(error);
            set({
                isUserDutyDurationStatistics: false,
            });
        }
    },

    positionSummary: {},
    isPositionSummaryLoading: false,
    fetchPositionSummary: async () => {
        const { selectedYear, selectedMonth } = useAppStore.getState();

        set({
            positionSummary: {},
            isPositionSummaryLoading: true,
        });
        try {
            const data = await statisticsService.getPositionSummary({ year: selectedYear, month: selectedMonth });
            set({
                positionSummary: data,
                isPositionSummaryLoading: false,
            });
        } catch (err) {
            console.log(err);
            set({
                isPositionSummaryLoading: false,
            });
        }
    },

    checkResult: {},
    isCheckResultLoading: false,
    fetchCheckResult: async () => {
        const { selectedYear, selectedMonth } = useAppStore.getState();

        set({
            checkResult: {},
            isCheckResultLoading: true,
        });
        try {
            const data = await statisticsService.getCheckDuration({ year: selectedYear, month: selectedMonth });
            set({
                checkResult: data,
                isCheckResultLoading: false,
            });
        } catch (err) {
            console.log(err);
            set({
                isCheckResultLoading: false,
            });
        }
    },
}));
