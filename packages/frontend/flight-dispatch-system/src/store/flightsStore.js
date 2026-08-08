import { create } from 'zustand'
import { flightsApi, checklistsApi } from '../api'

export const useFlightsStore = create((set) => ({
  flights: [],
  loading: false,
  error: null,
  total: 0,
  dataDate: null, // 后端实际返回数据的日期（fips 表）

  // 加载航班列表（数据源：fips 表）
  // 传 date 查该天（无数据后端自动回退最近天）；不传取最近一天
  fetchFlights: async ({ date, from, to } = {}) => {
    set({ loading: true, error: null })
    try {
      const data = await flightsApi.list({ date, from, to })
      set({ flights: data.items, total: data.total, dataDate: data.date, loading: false })
    } catch (err) {
      set({ loading: false, error: err.message })
    }
  },
}))

// 检查单模板缓存
export const useTemplatesStore = create((set) => ({
  templates: [],
  loading: false,
  loadTemplates: async () => {
    set({ loading: true })
    try {
      const data = await checklistsApi.listTemplates()
      set({ templates: data.items, loading: false })
    } catch (err) {
      set({ loading: false })
      console.warn('load templates failed:', err.message)
    }
  },
}))
