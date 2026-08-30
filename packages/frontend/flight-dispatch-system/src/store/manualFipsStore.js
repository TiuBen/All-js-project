import { create } from 'zustand'
import dayjs from 'dayjs'
import { manualFipsApi } from '../api'

/**
 * ============================================================
 * manual_fips 航班 Store
 * ------------------------------------------------------------
 * 管理手动添加航班（manual-fips 表）的列表数据：
 *   - flights：全量列表（后端返回行 + 附加 createdDate 本地创建日期）
 *   - fetchFlights：拉取全量（按创建日期过滤由页面侧完成）
 *   - addFlight / updateFlight / removeFlight：写操作后自动刷新列表
 * ============================================================
 */
export const useManualFipsStore = create((set, get) => ({
  flights: [],
  loading: false,
  error: null,

  /** 拉取全部手动航班；为每行附加 createdDate（本地东8区创建日期，用于日期筛选） */
  fetchFlights: async () => {
    set({ loading: true, error: null })
    try {
      const d = await manualFipsApi.list()
      const items = (d.items || []).map((r) => ({
        ...r,
        createdDate: r.created_at ? dayjs(r.created_at).format('YYYY-MM-DD') : '',
      }))
      set({ flights: items, loading: false, error: null })
      return items
    } catch (err) {
      set({ loading: false, error: err.message || '加载失败' })
      throw err
    }
  },

  /** 按本地创建日期过滤（date 精确 / from~to 范围） */
  filterByDate: (params = {}) => {
    const { date, from, to } = params
    return get().flights.filter((f) => {
      if (!f.createdDate) return true // 无日期的手动航班始终展示
      if (date) return f.createdDate === date
      if (from && to) return f.createdDate >= from && f.createdDate <= to
      if (from) return f.createdDate >= from
      if (to) return f.createdDate <= to
      return true
    })
  },

  /** 新增航班后刷新 */
  addFlight: async (data) => {
    await manualFipsApi.create(data)
    await get().fetchFlights()
  },

  /** 修改航班后刷新 */
  updateFlight: async (id, data) => {
    await manualFipsApi.update(id, data)
    await get().fetchFlights()
  },

  /** 删除航班后刷新 */
  removeFlight: async (id) => {
    await manualFipsApi.remove(id)
    await get().fetchFlights()
  },

  /** 生鲜标记后刷新 */
  refresh: async () => {
    await get().fetchFlights()
  },
}))
