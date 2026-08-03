// /store/onDutyStore.ts

import { create } from "zustand";
import { dutyService } from "@/service/duty.service";
import { fileService } from "@/service/file.service";
import dayjs from "dayjs";
import { subscribeWithSelector } from "zustand/middleware";
import { useUserStore } from "./user.store";
import { useAppStore } from "./app.store";

export const useDutyStore = create(
    subscribeWithSelector((set, get) => ({
        dutyRecords: [],
        isDutyRecordsLoading: false,
        async getDutyRecords() {
            console.log("getDutyRecords +++++++++++++++++++++++++++++++");

            const { selectedYear, selectedMonth } = useAppStore.getState();
            const { selectedUser } = useUserStore.getState();
            // 防止 selectedUser 为空时发起无效请求
            if (!selectedUser) return;
            const dd = {
                inTime: `${dayjs()
                    .year(selectedYear)
                    .month(selectedMonth)
                    .startOf("month")
                    .format("YYYY-MM-DD")} 00:00:00`,
                outTime: `${dayjs()
                    .year(selectedYear)
                    .month(selectedMonth + 1)
                    .startOf("month")
                    .format("YYYY-MM-DD")}  00:00:01`,
                username: selectedUser.username,
            };

            set({
                dutyRecords: [],
                isDutyRecordsLoading: true,
            });
            console.log("fetchDutyRecords", dd);

            try {
                const data = await dutyService.getDutyRecords(dd);
                set({ dutyRecords: data, isDutyRecordsLoading: false });
            } catch (err) {
                console.log(err);
                set({ isDutyRecordsLoading: false, dutyRecords: [] });
            }
        },

        onDutyRecords: [],
        async getOnDutyRecords() {
            try {
                const data = await dutyService.getDutyRecords({ outTime: "null" });
                set({ onDutyRecords: data, loading: false });
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

        // Excel相关
        excelDutyRecords: [],
        sumExcelDutyRecords: [],
        isExcelDutyRecordsLoading: false,
        excelError: null,
        excelErrorType: null,
        async getSelectedYearMonthUserExcelRows() {
            console.log("getSelectedYearMonthUserExcelRows +++++++++++++++++++++++++++++++");

            // 防止 selectedUser 为空时发起无效请求
            const { selectedUser } = useUserStore.getState();
            const { selectedYear, selectedMonth } = useAppStore.getState();

            if (!selectedYear || !selectedMonth || !selectedUser) {
                set({
                    excelDutyRecords: [],
                    excelError: null,
                    excelErrorType: null,
                });
                return;
            }

            set({
                isExcelDutyRecordsLoading: true,
                excelError: null,
                excelErrorType: null,
            });

            // try {
            //     const data = await fileService.getSelectedYearMonthUserExcelRows(
            //         selectedYear,
            //         selectedMonth,
            //         selectedUser.username
            //     );
            //     set({
            //         excelDutyRecords: data.detailRow,
            //         sumExcelDutyRecords: data.sumRow,
            //         isExcelDutyRecordsLoading: false,
            //     });
            // } catch (err) {
            //     console.log(err);
            //     set({ isExcelDutyRecordsLoading: false, excelDutyRecords: [], sumExcelDutyRecords: [] });
            // }

            try {
                const data = await fileService.getSelectedYearMonthUserExcelRows(
                    selectedYear,
                    selectedMonth,
                    selectedUser.username
                );

                if (data.success) {
                    set({
                        excelDutyRecords: data?.data?.detailRow || [],
                        sumExcelDutyRecords: data?.data?.sumRow || [],
                        isExcelDutyRecordsLoading: false,
                        excelError: null,
                        excelErrorType: null,
                    });
                } else {
                    set({
                        excelDutyRecords: [],
                        sumExcelDutyRecords: [],

                        isExcelDutyRecordsLoading: false,
                        excelError: data?.message || "获取数据失败",
                        excelErrorType: data?.errorType || "UNKNOWN_ERROR",
                    });
                }
            } catch (error) {
                console.error("获取Excel数据失败:", error);
                const errorMessage = error.response?.data?.message || "网络请求失败";
                const errorType = error.response?.data?.errorType || "NETWORK_ERROR";

                set({
                    excelDutyRecords: [],
                    sumExcelDutyRecords: [],

                    isExcelDutyRecordsLoading: false,
                    excelError: errorMessage,
                    excelErrorType: errorType,
                });
            }
        },

        // 清除Excel错误
        clearExcelError: () => {
            set({ excelError: null, excelErrorType: null });
        },

        // 刷新Excel数据
        refreshExcelData: async () => {
            await get().getSelectedYearMonthUserExcelRows();
        },

        // HR duty 相关
        selectedUserHrDutySummary: {},
        isSelectedUserHrDutySummaryLoading: true,
        async getHrDutySummary(isAll = false) {
            console.log("store getHrDutySummary");
            set({ isSelectedUserHrDutySummaryLoading: true });
            try {
                const { selectedYear, selectedMonth } = useAppStore.getState();
                const { selectedUser } = useUserStore.getState();

                if (!selectedYear || selectedMonth == null) {
                    set({
                        selectedUserHrDutySummary: [],
                        isSelectedUserHrDutySummaryLoading: false,
                    });
                    return;
                }

                const q = {
                    year: selectedYear,
                    month: selectedMonth,
                };

                if (isAll === false && selectedUser) {
                    q.userId = selectedUser.id;
                    q.username = selectedUser.username;
                }

                console.log("Request params:", q);

                const rawData = await dutyService.getHrDutySummary(q);
                console.log("Raw data:", rawData);
                const formattedData = {};
                rawData.forEach((item) => {
                    const uid = item.userId;
                    const date = item.duty_date;

                    // 1. 如果该用户还没有在对象中，初始化一个空对象
                    if (!formattedData[uid]) {
                        formattedData[uid] = {};
                    }

                    // 2. 将该日期的数据存入对应用户的对象中
                    // 只保留你需要的 value 和 value_text
                    formattedData[uid][date] = {
                        id: item.id, // ✅ 加上这一行，保留数据库主键

                        value: item.value,
                        value_text: item.value_text,
                    };
                });
                console.log("formattedData", formattedData);

                set({
                    selectedUserHrDutySummary: formattedData,
                    isSelectedUserHrDutySummaryLoading: false,
                });
            } catch (err) {
                console.log(err);
                set({
                    selectedUserHrDutySummary: {},
                    isSelectedUserHrDutySummaryLoading: false,
                });
            }
        },

        async saveHrDutySummary(data, method = "POST") {
            try {
                if (method === "POST") {
                    await dutyService.saveHrDutySummary(data);
                } else if (method === "PUT") {
                    await dutyService.updateHrDutySummary(data);
                }

                await get().getHrDutySummary();
            } catch (err) {
                console.log(err);
                return null;
            }
        },
    }))
);

// let timer = null;

useUserStore.subscribe(
    (state) => state.selectedUser,
    () => {
        useDutyStore.getState().getDutyRecords();
    }
);

useAppStore.subscribe(
    (state) => state.selectedMonth,
    () => {
        useDutyStore.getState().getDutyRecords();
    }
);
useAppStore.subscribe(
    (state) => state.selectedYear,
    () => {
        useDutyStore.getState().getDutyRecords();
    }
);
