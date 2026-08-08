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

// 日期选择 —— 单选或范围，也持久化
// 本地日期字符串（避免 toISOString 时区偏移导致日期差一天）
function localDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const useDateStore = create(
  persist(
    (set) => ({
      mode: 'single', // single | range
      selectedDate: localDateStr(),
      rangeFrom: null,
      rangeTo: null,
      setMode: (mode) => set({ mode }),
      setSelectedDate: (d) => set({ selectedDate: d }),
      setRange: (from, to) => set({ rangeFrom: from, rangeTo: to }),
    }),
    {
      name: 'flight-dispatch:dates',
    },
  ),
)
