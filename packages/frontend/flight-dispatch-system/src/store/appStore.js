import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * ============================================================
 * appStore —— 应用级全局状态（跨页面共享、持久化到 localStorage）
 * ------------------------------------------------------------
 * 目前只存两类：
 *   1. 当前用户 currentUser（后续用于检查单检查人默认值 / 记录按人筛选）
 *   2. 所选日期（单选/范围，日历控件共享，航班列表页与填写记录页共用）
 * ============================================================
 */

// 本地日期字符串（避免 toISOString 时区偏移导致日期差一天）
function localDateStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const useAppStore = create(
  persist(
    (set) => ({
      // ---- 当前用户 ----
      currentUser: '', // 暂无登录体系，先持久化空值；接入后由登录/选择写入
      setCurrentUser: (name) => set({ currentUser: name }),

      // ---- 所选日期（单选或范围） ----
      mode: 'single', // single | range
      selectedDate: localDateStr(),
      rangeFrom: null,
      rangeTo: null,
      setMode: (mode) => set({ mode }),
      setSelectedDate: (d) => set({ selectedDate: d }),
      setRange: (from, to) => set({ rangeFrom: from, rangeTo: to }),
    }),
    {
      name: 'flight-dispatch:app',
    },
  ),
)
