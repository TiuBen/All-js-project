import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 主界面 TAB —— 记住用户上次选择的 TAB（localStorage 持久化）
export const useTabsStore = create(
  persist(
    (set) => ({
      activeTab: 'flights', // flights | checklist | records
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: 'flight-dispatch:tabs',
    },
  ),
)
