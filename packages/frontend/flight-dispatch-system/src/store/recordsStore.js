import { create } from 'zustand'
import dayjs from 'dayjs'
import { checklistsApi } from '../api'
import { useAppStore } from './appStore'

/**
 * ============================================================
 * recordsStore —— 填写记录页专用 store
 * ------------------------------------------------------------
 * 管理：记录列表 / 加载态 / 关键词 / 日历红绿数字标记 / 手动刷新。
 * 数据动作：
 *   fetchRecords     按 appStore 所选日期拉取记录（date 或 from/to）
 *   fetchDayMarkers  拉取全部记录 → 统计每个本地日期的 { count, hasAbnormal }
 *   refresh          手动刷新（refreshKey+1，页面 useEffect 监听后重新拉取）
 * ============================================================
 */
export const useRecordsStore = create((set) => ({
  // ---- 状态 ----
  records: [],
  loading: true,
  keyword: '',
  dayMarkers: {}, // { 'YYYY-MM-DD': { count, hasAbnormal } }
  refreshKey: 0,

  // ---- 动作 ----
  setKeyword: (kw) => set({ keyword: kw }),
  refresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),

  // 按所选日期拉取记录（日期来源：appStore，单选传 date，范围传 from/to）
  fetchRecords: async () => {
    const { mode, selectedDate, rangeFrom, rangeTo } = useAppStore.getState()
    const params = mode === 'single' ? { date: selectedDate } : { from: rangeFrom, to: rangeTo }
    set({ loading: true })
    try {
      const d = await checklistsApi.listRecords(params)
      set({ records: d.items || [] })
    } catch (e) {
      console.error('加载填写记录失败:', e)
      set({ records: [] })
    } finally {
      set({ loading: false })
    }
  },

  // 拉取全部记录 → 按「检查时间」本地日期统计，供日历红/绿数字徽标
  fetchDayMarkers: async () => {
    try {
      const d = await checklistsApi.listRecords({})
      const markers = {}
      ;(d.items || []).forEach((r) => {
        // 日期取检查/创建时间（本地东8区格式），而非 flight_date（手动航班可能为空）
        const ts = r.checked_at || r.created_at
        if (!ts) return
        const dstr = dayjs(ts).format('YYYY-MM-DD')
        const cur = markers[dstr] || { count: 0, hasAbnormal: false }
        cur.count += 1
        // 检查该记录 items 中是否存在 status === 'abnormal' 的项
        const items = r.items || {}
        if (Object.values(items).some((v) => v && v.status === 'abnormal')) cur.hasAbnormal = true
        markers[dstr] = cur
      })
      set({ dayMarkers: markers })
    } catch (e) {
      console.error('加载日历标记失败:', e.message)
    }
  },
}))
