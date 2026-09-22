import { create } from 'zustand'
import dayjs from 'dayjs'
import { checklistsApi } from '../api'
import { useAppStore } from './appStore'

/**
 * ============================================================
 * recordsStore —— 填写记录页专用 store
 * ------------------------------------------------------------
 * 管理：记录列表 / 加载态 / 错误 / 关键词 / 日历红绿数字标记 / 手动刷新。
 * 数据动作：
 *   fetchRecords     按 appStore 所选日期拉取记录（date 或 from/to）
 *   fetchDayMarkers  拉取全部记录 → 统计每个本地日期的 { count, hasAbnormal }
 *   deleteRecord     删除单条记录（后端同步解除 fips/manual_fips.checklist_uuid 关联）→ 刷新列表与日历标记
 *   refresh          手动刷新（refreshKey+1，页面 useEffect 监听后重新拉取）
 * ★ 日期口径 = **创建日（created_at）**：一张检查单归属"哪天填写的"，
 *   之后修改不会把它挪到别的日期下（与后端 listRecords 的过滤口径、表格展示一致）。
 * ============================================================
 */

/**
 * 统计一条记录的异常项数
 * 填写层状态：ok（正常）/ abnormal（异常）/ 其余或空 = 未填。
 * 两处都要看：主监控+辅助监控在 items，视频监管在 video_supervision。
 * @param {Object} record checklist_records 行
 * @returns {number} 异常项数量
 */
export function countAbnormal(record) {
  let n = 0
  ;[record?.items, record?.video_supervision].forEach((box) => {
    Object.values(box || {}).forEach((v) => {
      if (v && v.status === 'abnormal') n += 1
    })
  })
  return n
}

export const useRecordsStore = create((set, get) => ({
  // ---- 状态 ----
  records: [],
  loading: true,
  error: null,
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
    set({ loading: true, error: null })
    try {
      const d = await checklistsApi.listRecords(params)
      set({ records: d.items || [] })
    } catch (e) {
      console.error('加载填写记录失败:', e)
      set({ records: [], error: e.message || '加载失败' })
    } finally {
      set({ loading: false })
    }
  },

  // 拉取全部记录 → 按「创建时间」本地日期统计，供日历红/绿数字徽标
  fetchDayMarkers: async () => {
    try {
      const d = await checklistsApi.listRecords({})
      const markers = {}
      ;(d.items || []).forEach((r) => {
        // 日期取创建时间（口径与后端过滤、表格展示一致）
        const ts = r.created_at || r.updated_at
        if (!ts) return
        const dstr = dayjs(ts).format('YYYY-MM-DD')
        const cur = markers[dstr] || { count: 0, hasAbnormal: false }
        cur.count += 1
        if (countAbnormal(r) > 0) cur.hasAbnormal = true
        markers[dstr] = cur
      })
      set({ dayMarkers: markers })
    } catch (e) {
      console.error('加载日历标记失败:', e.message)
    }
  },

  // 删除单条填写记录（DELETE /checklists/records/:id，只删这一条）
  // 后端会重算 fips/manual_fips.checklist_uuid（该航班还有别的检查单就指向最新一份）。
  // ⚠️ 这里直接调 API 而不用 checklistStore.deleteRecord：checklistStore 已经 import 本
  //    store（提交后刷新列表），反向再 import 会绕成循环依赖。
  deleteRecord: async (id) => {
    try {
      await checklistsApi.deleteRecord(id)
      // 删除成功后刷新列表与日历标记（同步更新当前视图）
      await get().fetchRecords()
      await get().fetchDayMarkers()
    } catch (e) {
      console.error('删除填写记录失败:', e)
      throw e
    }
  },
}))
