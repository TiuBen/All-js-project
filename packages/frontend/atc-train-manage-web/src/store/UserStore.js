// store/UserStore.js
import { create } from "zustand";
import userService from "../service/userService.js";

const UserStore = create((set, get) => ({
    users: [],
    groupedUsers: [],
    detailUsers: [],
    onDutyUsers: [],
    positions: [],
    positionsOnDuty: [],
    selectedPosition: null,
    selectedDutyRecord: null,
    selectedUser: null,
    selectedUserNightCount: {},
    userStatics: {},
    userStaticsByMonth: [],
    isLoading: true,
    error: null,

    // 初始化
    initStore: async () => {
        console.log("初始化 store");
        
        set({ isLoading: true, error: null });
        try {
            const { positionsRes, usersRes, groupedUsers, detailUsers, onDutyUsersRes } =
                await userService.initStoreData();

            set({
                positions: positionsRes,
                users: usersRes,
                groupedUsers,
                detailUsers,
                onDutyUsers: onDutyUsersRes,
                isLoading: false,
            });
        } catch (err) {
            set({ error: err.message, isLoading: false });
        }
    },

    setSelectedPosition: (position) => set({ selectedPosition: position }),
    setSelectedDutyRecord: (dutyRecord) => set({ selectedDutyRecord: dutyRecord }),

    // 更新 duty 记录
    putDutyRecord: async (dutyRecord) => {
        try {
            await userService.updateDutyRecord(dutyRecord, get().onDutyUsers);
            await get().fetchOnDutyUsers();
            get().setSelectedDutyRecord(null);
        } catch (err) {
            console.error("更新 duty 出错:", err);
        }
    },

    // 更新用户信息
    updateUser: async (userId, updatedData) => {
        try {
            const updatedUser = await userService.updateUser(userId, updatedData);
            set((state) => ({
                users: state.users.map((user) => (user.id === userId ? { ...user, ...updatedUser } : user)),
            }));
        } catch (err) {
            set({ error: err.message });
        }
    },

    // 获取当前在岗用户
    fetchOnDutyUsers: async () => {
        try {
            const data = await userService.fetchOnDutyUsers();
            set({ onDutyUsers: data });
        } catch (err) {
            set({ error: err.message });
        }
    },
}));

// 初始化时自动加载
UserStore.getState().initStore();

export default UserStore;
