import { create } from 'zustand'
import { ecyilangApi } from '../api'
import { READONLY_HINT } from '../config/dataSource'

/**
 * ============================================================
 * ecyilang 航班计划 Store（只读）
 * ------------------------------------------------------------
 * 数据源：后端 ecyilang 表（接口抓包快照）。
 * 后端已把每组的「离港 d_ / 进港 a_」两侧拆成两条航班行，
 * 字段与 manualFipsStore 对齐，因此 FipsPage 可以无差别换源。
 *
 * 与 manualFipsStore 的差异：
 *   - 只读：addFlight / updateFlight / removeFlight 一律抛错
 *   - 日期过滤用后端给的 createdDate（= 计划批次日期）
 * ============================================================
 */
const readonlyError = () => new Error(READONLY_HINT || '当前数据源为只读')

export const useEcyilangStore = create((set, get) => ({
  flights: [],
  loading: false,
  error: null,

  /** 拉取航班计划；可按批次日期(date / from / to)过滤，不传取全量 */
  fetchFlights: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const d = await ecyilangApi.listFlights(params)
      const items = (d.items || []).map((r) => ({
        ...r,
        // createdDate 是 /fips 页 filterByDate 用的字段；后端已按批次日期给出，这里兜底
        createdDate: r.createdDate || r.flightDate || '',
      }))
      set({ flights: items, loading: false, error: null })
      return items
    } catch (err) {
      set({ loading: false, error: err.message || '加载失败' })
      throw err
    }
  },

  /** 按计划批次日期过滤（与 manualFipsStore.filterByDate 行为一致） */
  filterByDate: (params = {}) => {
    const { date, from, to } = params
    return get().flights.filter((f) => {
      if (!f.createdDate) return true
      if (date) return f.createdDate === date
      if (from && to) return f.createdDate >= from && f.createdDate <= to
      if (from) return f.createdDate >= from
      if (to) return f.createdDate <= to
      return true
    })
  },

  /* ---------- 只读数据源：写操作直接拒绝 ---------- */

  addFlight: async () => {
    throw readonlyError()
  },
  updateFlight: async () => {
    throw readonlyError()
  },
  removeFlight: async () => {
    throw readonlyError()
  },

  /** 刷新（只读源只有读） */
  refresh: async () => {
    await get().fetchFlights()
  },
}))
