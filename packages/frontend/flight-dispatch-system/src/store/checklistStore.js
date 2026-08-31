import { create } from 'zustand'
import { checklistsApi } from '../api'

// 检查单填写状态
// header: 顶部信息（日期、航班号、机型、落地时间、机位、检查人...）
// items: 逐项填写内容 keyed by nodeId
// videoSupervision: 视频监管填写内容 keyed by index
export const useChecklistStore = create((set, get) => ({
  template: null,        // 检查单模板（JSON，主监控/辅助节点）
  videoFocus: null,      // 视频监管重点模板（独立 JSON，groups[] 结构，按模板 category 自动附加）
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
      // 后端 getTemplateById 附加了 videoFocus（按 category 映射的视频监管重点文件）；从 template 剥离单独存
      const { videoFocus, ...templateBody } = tpl
      set({ template: templateBody, videoFocus: videoFocus || null, templateLoading: false })
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

  // 批量覆盖 items（时间公式自动计算用：一次性写入多节点时间）
  setItems: (items) => set({ items }),

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
      videoFocus: null,
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
      // header 注入模板元信息（模仿 new-test2 顶层结构：记录自描述用哪个模板/版本）
      // 模板由 checklist_category + header.template.checklistName 决定，不再存 checklist_template_id
      const headerWithTemplate = {
        ...s.header,
        template: {
          uuid: s.template.uuid || null,
          category: s.template.category || null,
          checklistName: s.template.checklistName || null,
          schemaVersion: s.template.schemaVersion || null,
        },
      }
      const payload = {
        flightId: s.flight.id,
        flightNo: s.flight.flightNo,
        aircraftType: s.flight.aircraftType,
        checklistCategory: s.template.category, // 与下拉菜单对齐的模板名（如 货运始发航班）
        flightDate: s.flight.flightDate || null,
        header: headerWithTemplate,
        items: s.items,
        videoSupervision: s.videoItems,
        inspector: s.inspector,
        status,
      }
      let record
      if (s.recordId) {
        record = await checklistsApi.updateRecord(s.recordId, {
          header: headerWithTemplate,
          items: s.items,
          videoSupervision: s.videoItems,
          inspector: s.inspector,
          status,
          // 与 createRecord 对齐：切换模板类型后提交，后端也能把新的检查单分类落库
          // （后端 updateRecord 对可选字段 COALESCE，未传时保持原值）
          checklistCategory: s.template.category,
          flightNo: s.flight.flightNo,
          aircraftType: s.flight.aircraftType,
          flightDate: s.flight.flightDate || null,
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
