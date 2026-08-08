/**
 * ============================================================
 * 检查单草稿箱 Store
 * ------------------------------------------------------------
 * 数据持久化到 localStorage，最多保存 5 个未完成的检查单草稿。
 *
 * 草稿结构：
 * {
 *   flightId: 'fips-123',
 *   flightNo: 'CSS7167',
 *   templateId: 'cargo-checklist',
 *   header: {...},
 *   items: {...},
 *   videoSupervision: {...},
 *   status: 'draft',
 *   updatedAt: '2026-08-07T22:00:00Z'
 * }
 *
 * 上传成功后调用 removeDraft(id) 自动从列表移除。
 * ============================================================
 */
import { create } from 'zustand'

const STORAGE_KEY = 'flight_dispatch_drafts'
const MAX_DRAFTS = 5

function loadFromStorage() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(list) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (err) {
    console.warn('[draftStore] 保存失败：', err)
  }
}

export const useDraftStore = create((set, get) => ({
  drafts: loadFromStorage(),

  /**
   * 添加/更新一个草稿（按 flightId 唯一），超额时移除最旧的非空草稿
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
    saveToStorage(next)
    set({ drafts: next })
  },

  /** 按 flightId 移除草稿 */
  removeDraft: (flightId) => {
    const next = get().drafts.filter((d) => d.flightId !== flightId)
    saveToStorage(next)
    set({ drafts: next })
  },

  /** 清空所有草稿 */
  clearAll: () => {
    saveToStorage([])
    set({ drafts: [] })
  },

  /** 按 flightId 取一个草稿 */
  getDraft: (flightId) => get().drafts.find((d) => d.flightId === flightId),
}))