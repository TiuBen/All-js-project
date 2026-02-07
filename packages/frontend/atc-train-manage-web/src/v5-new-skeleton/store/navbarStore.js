import { create } from 'zustand';

const useNavbarStore = create((set) => ({
  isOpen: false, // 侧边栏的开关状态
  toggleNavbar: () => set((state) => ({ isOpen: !state.isOpen })), // 切换侧边栏状态
  closeNavbar: () => set({ isOpen: false }), // 关闭侧边栏
}));

export default useNavbarStore;