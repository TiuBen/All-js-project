/**
 * ============================================================
 * 检查单草稿箱 Store（浏览器本地持久化）
 * ------------------------------------------------------------
 * 草稿只存在浏览器 localStorage（key: flight_dispatch_drafts），最多 5 条未完成草稿。
 * 页面上没有"保存草稿"按钮：写入时机由 checklistStore 在**修改单项/头部字段时**
 * 触发防抖落盘（见 checklistStore.scheduleDraftPersist），本 store 只负责
 * "列表怎么存、怎么取、怎么删"，不含任何跨标签页同步逻辑。
 *
 * 数据流：
 *   编辑某项 → checklistStore 的 action 调 scheduleDraftPersist()
 *            → 800ms 防抖后 persistDraftNow() 组装快照
 *            → useDraftStore.upsertDraft(快照) → 写 localStorage + 更新 drafts
 *
 * 草稿结构：
 * {
 *   flightId, flightNo, templateId,
 *   header, items, videoSupervision, inspector,
 *   status: 'draft', updatedAt
 * }
 * ============================================================
 */
import { create } from 'zustand'

export const DRAFTS_STORAGE_KEY = 'flight_dispatch_drafts'
export const MAX_DRAFTS = 5

function parseDrafts(raw) {
  try {
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

/** 从 localStorage 读取草稿列表（store 初始化用） */
function readDrafts() {
  if (typeof window === 'undefined') return []
  return parseDrafts(window.localStorage.getItem(DRAFTS_STORAGE_KEY))
}

function writeDrafts(list) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.warn('[draftStore] 写入本地草稿失败：', err)
  }
}

export const useDraftStore = create((set, get) => ({
  drafts: readDrafts(),

  /**
   * 添加/更新一个草稿（按 flightId 唯一），超额时截断最旧的
   * @param {Object} draft 草稿对象
   */
  upsertDraft: (draft) => {
    if (!draft || !draft.flightId) return
    const list = get().drafts
    const idx = list.findIndex((d) => d.flightId === draft.flightId)
    let next
    if (idx >= 0) {
      next = [...list]
      next[idx] = { ...next[idx], ...draft, updatedAt: new Date().toISOString() }
    } else {
      next = [{ ...draft, updatedAt: new Date().toISOString() }, ...list]
      if (next.length > MAX_DRAFTS) next = next.slice(0, MAX_DRAFTS)
    }
    writeDrafts(next)
    set({ drafts: next })
  },

  /** 按 flightId 移除草稿 */
  removeDraft: (flightId) => {
    const next = get().drafts.filter((d) => d.flightId !== flightId)
    writeDrafts(next)
    set({ drafts: next })
  },

  /** 清空所有草稿 */
  clearAll: () => {
    writeDrafts([])
    set({ drafts: [] })
  },

  /** 按 flightId 取一个草稿 */
  getDraft: (flightId) => get().drafts.find((d) => d.flightId === flightId),
}))
