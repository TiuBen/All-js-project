/**
 * ============================================================
 * appStore —— 应用级全局状态（跨页面共享、持久化到 localStorage）
 * ------------------------------------------------------------
 * 目前只存两类：
 *   1. 当前用户 currentUser（后续用于检查单检查人默认值 / 记录按人筛选）
 *   2. 所选日期（单选/范围，日历控件共享，航班列表页与填写记录页共用）
 *
 * ★ useDateFilterParams 也放这里：它是「读 appStore 出筛选参数」的纯派生 hook，
 *   放组件文件里会让 react-refresh 报「同一文件既导出组件又导出函数」。
 * ============================================================
 */

import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

/**
 * 读当前日期筛选参数（供各页面调用）
 *   单选模式 → { date: 'YYYY-MM-DD' }
 *   范围模式 → { from, to }（可能为 null）
 *
 * ★ 用 useMemo 稳定返回对象的引用：页面普遍把它的返回值放进 useMemo /
 *   useEffect 依赖里，每次新对象会让下游 memo 全部失效（列表每帧重算）。
 * @returns {{date?:string, from?:string|null, to?:string|null}}
 */
export function useDateFilterParams() {
  const mode = useAppStore((s) => s.mode)
  const selectedDate = useAppStore((s) => s.selectedDate)
  const rangeFrom = useAppStore((s) => s.rangeFrom)
  const rangeTo = useAppStore((s) => s.rangeTo)
  return useMemo(
    () => (mode === 'single' ? { date: selectedDate } : { from: rangeFrom, to: rangeTo }),
    [mode, selectedDate, rangeFrom, rangeTo],
  )
}
