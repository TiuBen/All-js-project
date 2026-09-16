import { create } from 'zustand'
import { checklistsApi } from '../api'
import { useDraftStore, MAX_DRAFTS } from './draftStore'
import { resolveVideoFocus, ALL_VIDEO_CHECK_IDS } from '../pages/ChecklistPage/videoFocus'

// ============================================================
// 草稿自动落盘（浏览器本地无感保存）
// ------------------------------------------------------------
// 关键点：**草稿写入放在 store 里，不放在页面组件里**。
//   - 每个"会改动检查单内容"的 action 末尾调用 scheduleDraftPersist()
//   - 800ms 防抖后组装快照，写进 draftStore（localStorage）
//   - 页面组件因此**完全不需要订阅 items / header / videoItems 来做草稿**，
//     也就不会因为"编辑某一项"而整体重渲染。
// ============================================================
const DRAFT_DEBOUNCE_MS = 800

let draftTimer = null
/** 上次落盘的内容签名：内容没变就不重复写 localStorage（也避免无谓的 drafts 列表刷新） */
let lastDraftSig = null

/** 检查单内容快照（字段口径与草稿结构一致） */
function draftSnapshotOf(s) {
  return {
    header: s.header,
    items: s.items,
    videoSupervision: s.videoItems,
    inspector: s.inspector,
  }
}

/** 取消未到点的防抖（切换航班 / 提交 / 卸载时用） */
function cancelDraftPersist() {
  clearTimeout(draftTimer)
  draftTimer = null
}

/** 立即把当前编辑态写入本地草稿箱（防抖到期 / 页面隐藏 / 卸载时调用） */
function persistDraftNow() {
  const s = useChecklistStore.getState()
  const settle = () => {
    if (s.draftPending) useChecklistStore.setState({ draftPending: false })
  }
  // 未选航班 / 已提交（或锁定）→ 不产生草稿
  if (!s.flight?.id || !s.draftPersistEnabled) return settle()
  // 仅在实际填写了内容（status/time/note 任一有值）时才写入，避免"打开页面就产生空草稿"
  const hasContent = Object.values(s.items).some((v) => v && (v.status || v.time || v.note))
  if (!hasContent) return settle()
  // 草稿箱已满（5 个）且当前航班不在箱内时，不再自动写入，避免静默挤掉最早的草稿
  const box = useDraftStore.getState().drafts
  const alreadyInBox = box.some((d) => d.flightId === s.flight.id)
  if (box.length >= MAX_DRAFTS && !alreadyInBox) return settle()

  const snapshot = {
    flightId: s.flight.id,
    flightNo: s.flight.flightNo,
    // 记录当前使用的模板 id（顺航检查单 / 货运始发航班 / 客运始发航班 …），恢复草稿时按它加载对应模板
    templateId: s.template?.id || (s.flight.category === "客运航班" ? "客运始发航班" : "货运过站航班"),
    ...draftSnapshotOf(s),
    status: 'draft',
  }
  // 签名只比内容（键顺序在同一次运行内稳定），内容一致则跳过写入
  const { header, items, videoSupervision, inspector } = snapshot
  const sig = JSON.stringify([header, items, videoSupervision, inspector])
  if (sig === lastDraftSig) return settle()

  lastDraftSig = sig
  useDraftStore.getState().upsertDraft(snapshot)
  useChecklistStore.setState({
    draftPending: false,
    draftSavedAt: new Date().toISOString(),
  })
}

/** 安排一次防抖落盘（所有改动内容的 action 末尾调用） */
function scheduleDraftPersist() {
  const s = useChecklistStore.getState()
  if (!s.flight?.id || !s.draftPersistEnabled) return
  // 仅在状态切换时 set，避免每次按键都触发订阅方重渲染
  if (!s.draftPending) useChecklistStore.setState({ draftPending: true })
  clearTimeout(draftTimer)
  draftTimer = setTimeout(persistDraftNow, DRAFT_DEBOUNCE_MS)
}

export const useChecklistStore = create((set, get) => {
  /**
   * 视频监管逐项 setter：为每个 vCheckId 生成一个独立方法
   *   set_vCheckId1('status', 'ok') / set_vCheckId2('note', 'xxx') ...
   * 每个 setter 只写自己那一项（其余项保持原对象引用），
   * 配合组件端按 id 订阅（useVideoCheckItem）→ 改一项只重渲染那一行，
   * 不会让整个视频监管面板（单份最多 44 项）整体重渲染。
   * 三份清单合并后共生成 124 个 setter（客运 1~38 / 货运 39~82 / 顺航 83~124）。
   */
  const videoCheckSetters = Object.fromEntries(
    ALL_VIDEO_CHECK_IDS.map((id) => [
      `set_${id}`,
      (field, value) => {
        set((s) => ({
          videoItems: { ...s.videoItems, [id]: { ...(s.videoItems[id] || {}), [field]: value } },
        }))
        scheduleDraftPersist()
      },
    ])
  )

  return {
    template: null,        // 检查单模板（JSON，主监控/辅助节点）
    videoFocus: null,      // 视频监管重点数据（前端静态模块按 category 本地解析，不走接口）
    templateLoading: false,
    record: null,          // 已保存的填写记录（从后端加载）
    recordId: null,
    flight: null,          // 当前航班信息
    header: {},
    items: {},             // { "main-{seq}": { status, time, note }, "aux-{row}": {...} }
    videoItems: {},        // { "vCheckId1": { status, note }, ... }  按 vCheckId 定位
    inspector: '',
    currentStep: null,     // 当前高亮的步骤（流程图用）
    saveStatus: 'idle',    // idle | saving | saved | error

    // ===== 本地草稿状态（供工具栏展示，不参与业务判断） =====
    draftPersistEnabled: true, // 已提交/锁定 → 关掉，不再产生草稿
    draftPending: false,       // 有改动待落盘
    draftSavedAt: null,        // 最近一次落盘时间（ISO）

    // 视频监管逐项 setter（set_vCheckId1、set_vCheckId2 ...）
    ...videoCheckSetters,

    loadTemplate: async (templateId) => {
      set({ templateLoading: true })
      try {
        const tpl = await checklistsApi.getTemplate(templateId)
        // videoFocus 已内联到前端（pages/ChecklistPage/videoFocus），此处忽略接口返回的同名字段
        const { videoFocus: _ignored, ...templateBody } = tpl
        set({
          template: templateBody,
          // 本地解析：客运 → 客运版；货运 → 货运版；顺航 → 顺航版（顺航为独立一份）
          videoFocus: resolveVideoFocus(templateBody.category),
          templateLoading: false,
        })
      } catch (err) {
        set({ templateLoading: false })
        throw err
      }
    },

    setFlight: (flight) => set({ flight, header: { flightNo: flight?.flightNo || '', aircraftType: flight?.aircraftType || '' } }),

    // 改动头部字段 → 触发草稿防抖（落地时间会驱动公式重算，属于有效内容）
    setHeaderField: (key, value) => {
      set((s) => ({ header: { ...s.header, [key]: value } }))
      scheduleDraftPersist()
    },
    setInspector: (inspector) => {
      set({ inspector })
      scheduleDraftPersist()
    },

    // 保存单条填写（主/辅助/视频项通用）—— 只替换目标 key，其余项保持原引用，保证 memo 生效
    setItemValue: (key, field, value) => {
      set((s) => ({
        items: { ...s.items, [key]: { ...(s.items[key] || {}), [field]: value } },
      }))
      scheduleDraftPersist()
    },

    // 批量覆盖 items（时间公式自动计算用：一次性写入多节点时间）
    setItems: (items) => {
      set({ items })
      scheduleDraftPersist()
    },

    // 视频监管项写入（key = vCheckId）；单项场景优先用 set_vCheckIdN
    setVideoValue: (key, field, value) => {
      set((s) => ({
        videoItems: { ...s.videoItems, [key]: { ...(s.videoItems[key] || {}), [field]: value } },
      }))
      scheduleDraftPersist()
    },

    setCurrentStep: (step) => set({ currentStep: step }),

    // ===== 草稿控制 =====
    /** 已提交/锁定 → 关闭草稿写入 */
    setDraftPersistEnabled: (enabled) => set({ draftPersistEnabled: !!enabled }),
    /** 立即落盘（页面隐藏 / 卸载兜底），不改变写入规则 */
    flushDraft: () => {
      cancelDraftPersist()
      persistDraftNow()
    },
    /** 重置"上次落盘签名"（提交后重新编辑时，首笔改动要能再次落盘） */
    resetDraftTracking: () => {
      lastDraftSig = null
    },

    // 从本地草稿恢复填写状态（草稿箱选择进入）
    // 注意 draft.videoSupervision → store 里的 videoItems（命名与后端记录字段一致）
    hydrateFromDraft: (draft) =>
      set({
        header: draft?.header || {},
        items: draft?.items || {},
        videoItems: draft?.videoSupervision || {},
        inspector: draft?.inspector || '',
      }),

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

    reset: () => {
      cancelDraftPersist()
      lastDraftSig = null
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
        draftPersistEnabled: true,
        draftPending: false,
        draftSavedAt: null,
      })
    },

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
  }
})

/**
 * 订阅单项视频监管填写数据（key = vCheckId）
 * selector 只取自己那一项 → 其他项变化时返回同一引用，组件不重渲染
 * @param {string} id 如 "vCheckId2"
 */
export const useVideoCheckItem = (id) => useChecklistStore((s) => s.videoItems[id])

/**
 * 取单项的 setter（store 里的 set_vCheckIdN），引用稳定
 * @param {string} id 如 "vCheckId2"
 * @returns {Function} (field, value) => void
 */
export const useVideoCheckSetter = (id) => useChecklistStore((s) => s[`set_${id}`])
