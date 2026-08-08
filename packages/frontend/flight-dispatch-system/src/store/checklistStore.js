import { create } from 'zustand'
import { checklistsApi } from '../api'

// 检查单填写状态
// header: 顶部信息（日期、航班号、机型、落地时间、机位、检查人...）
// items: 逐项填写内容 keyed by nodeId
// videoSupervision: 视频监管填写内容 keyed by index
export const useChecklistStore = create((set, get) => ({
  template: null,        // 检查单模板（JSON）
  templateLoading: false,
  record: null,          // 已保存的填写记录（从后端加载）
  recordId: null,
  flight: null,          // 当前航班信息
  header: {},
  items: {},             // { "main-{seq}": { status, time, note }, "aux-{row}": {...} }
  videoItems: {},        // { "video-{groupId}-{idx}": { status, note } }
  inspector: '',
  currentStep: null,     // 当前高亮的步骤（流程图用）
  saveStatus: 'idle',    // idle | saving | saved | error

  loadTemplate: async (templateId) => {
    set({ templateLoading: true })
    try {
      const tpl = await checklistsApi.getTemplate(templateId)
      set({ template: tpl, templateLoading: false })
    } catch (err) {
      set({ templateLoading: false })
      throw err
    }
  },

  setFlight: (flight) => set({ flight, header: { flightNo: flight?.flightNo || '', aircraftType: flight?.aircraftType || '' } }),

  setHeaderField: (key, value) => set((s) => ({ header: { ...s.header, [key]: value } })),
  setInspector: (inspector) => set({ inspector }),

  // 保存单条填写（主/辅助/视频项通用）
  setItemValue: (key, field, value) =>
    set((s) => ({
      items: { ...s.items, [key]: { ...(s.items[key] || {}), [field]: value } },
    })),

  setVideoValue: (key, field, value) =>
    set((s) => ({
      videoItems: { ...s.videoItems, [key]: { ...(s.videoItems[key] || {}), [field]: value } },
    })),

  setCurrentStep: (step) => set({ currentStep: step }),

  // 从后端记录恢复填写状态
  hydrateFromRecord: (record) => {
    if (!record) return
    set({
      recordId: record.id,
      header: record.header || {},
      items: record.items || {},
      videoItems: record.video_supervision || {},
      inspector: record.inspector || '',
    })
  },

  reset: () =>
    set({
      template: null,
      record: null,
      recordId: null,
      flight: null,
      header: {},
      items: {},
      videoItems: {},
      inspector: '',
      currentStep: null,
      saveStatus: 'idle',
    }),

  // 提交/保存到后端（PG）
  save: async (opts = {}) => {
    const s = get()
    if (!s.flight || !s.template) return
    const { status = 'draft' } = opts
    set({ saveStatus: 'saving' })
    try {
      const templateId = s.template.id || (s.template.category === '客运航班' ? 'passenger-checklist' : 'cargo-checklist')
      const nowIso = new Date().toISOString()
      const payload = {
        flightId: s.flight.id,
        flightNo: s.flight.flightNo,
        aircraftType: s.flight.aircraftType,
        flightType: s.flight.flightType,
        checklistCategory: s.template.category,
        checklistTemplateId: templateId,
        checklistTitle: s.template.title || s.template.category,
        flightDate: s.flight.flightDate || null,
        header: s.header,
        items: s.items,
        videoSupervision: s.videoItems,
        inspector: s.inspector,
        status,
        checkedAt: nowIso,
      }
      let record
      if (s.recordId) {
        record = await checklistsApi.updateRecord(s.recordId, {
          header: s.header,
          items: s.items,
          videoSupervision: s.videoItems,
          inspector: s.inspector,
          status,
          checkedAt: nowIso,
        })
      } else {
        record = await checklistsApi.createRecord(payload)
        set({ recordId: record.id })
      }
      set({ saveStatus: 'saved' })
      return record
    } catch (err) {
      set({ saveStatus: 'error' })
      throw err
    }
  },
}))
