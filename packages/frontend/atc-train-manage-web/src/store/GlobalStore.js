import { create } from "zustand";

const GlobalStore = create((set) => ({
  isLoading: false, // 全局加载状态
  setLoading: (isLoading) => set({ isLoading }), // 设置全局加载状态

  //
  selectedUser: null,
  selectedPosition:null,
  selectedDutyRecord:null,

  positions:[],
  initStore: async () => {
    const { positions } = await userService.initStoreData();
    set({ positions });
  },


}));


export default GlobalStore;

