import { create } from 'zustand'
import { checklistsApi, manualFipsApi } from '../api'
import { useDraftStore } from './draftStore'
import { useRecordsStore } from './recordsStore'
// 来源航班表（manual_fips）：记录 → 航班行的反查走它（列表已缓存时零请求）
import { useManualFipsStore } from './manualFipsStore'
// 模板静态数据（编译期打包，零网络）：loadTemplate 直接查表，不再有聚合入口文件
import passengerInitFlight from '../pages/ChecklistPage/ChecklistEditor/Template/TemplateJson/passengerInitFlight'
import passengerBypassFlight from '../pages/ChecklistPage/ChecklistEditor/Template/TemplateJson/passengerBypassFlight'
import cargoInitFlight from '../pages/ChecklistPage/ChecklistEditor/Template/TemplateJson/cargoInitFlight'
import cargoBypassFlight from '../pages/ChecklistPage/ChecklistEditor/Template/TemplateJson/cargoBypassFlight'
// 顺航：后端无节点保障 JSON，手工维护的占位模板（schema 为空），不进生成脚本
import shunhangFlight from '../pages/ChecklistPage/ChecklistEditor/Template/TemplateJson/shunhangFlight'
// 填写数据（items/videoItems/inspector）不在本 store —— 见 checklistDraft.js（内存 + IndexedDB）
import {
  setContext as setDraftContext,
  hardReset as hardResetDraft,
  getSnapshot as getDraftSnapshot,
  hydrateFromRecord,
  openDraft,
  flushDraft,
  resetTracking as resetDraftTracking,
  removeIdbDraftsByFlight,
} from './checklistDraft'

// ============================================================
// checklistStore —— 检查单页全局状态（只存"全局响应式"该存的东西）
// ------------------------------------------------------------
// 状态分三大部分（与 UI 的归属一致，均为细粒度 selector 消费）：
//   一、工具栏相关：航班信息 · 当前模板 · 列显隐(panels) · 流程图(viewMode) · 小地图(map)
//   二、节点相关：选中节点（高亮/辅助栏/流程图共用）——填写数据在 checklistDraft
//   三、后端交互相关：记录元数据 · 保存状态/失败提示 · submit
// 另：文件顶部是模块级资产 —— 类型配色。
// ⚠️ 填写数据（items/videoItems/inspector）不进本 store：组件经 checklistDraft
//    的 useMainItem / useAuxItem / useVideoCheckItem 逐项订阅，非受控 + 草稿落盘。
// ============================================================

// ############################################################
// 模块级资产：检查单类型配色（原 Components/ToolBar/Components/TYPE_COLORS.js，并入 store）
// ------------------------------------------------------------
// 放这里的理由：用配色的组件（InfoDisplay / TemplateChooseDropdown / ChecklistPage）
// 反正都要 import useChecklistStore，配色跟着 store 一份 import 拿全，不再多一个文件。
// ★ 键 = 模板文件名 = category = dropdown label = 落库 `checklist_category`
//   （类型名本身就是"模板 id"，四处一致，绝不改键名）
// ★ 键序 = 类型下拉菜单顺序（顺航 · 货运始发 · 货运过站 · 客运始发 · 客运过站）
//   TemplateChooseDropdown 的 TYPE_ORDER 自维护顺序，改这里时需与它同步。
// ⚠️ 禁止 Tailwind 动态拼接类名（JIT 扫不到会静默失效）→ 一律 inline style + withAlpha。
// ############################################################

/** 检查单类型 → hex 主色 */
export const TYPE_COLORS = {
    顺航检查单: "#059669", // 翠绿
    货运始发航班: "#0891B2", // 深青
    货运过站航班: "#7C3AED", // 紫
    客运始发航班: "#D946EF", // 洋红
    客运过站航班: "#6B2608", // 深棕
};

/** 类型名 → 主色 */
export const typeColorOf = (label) => TYPE_COLORS[label];

/**
 * 类型规范顺序（= TYPE_COLORS 键序 = 下拉菜单顺序）
 * URL 的 ?checkTemplate= 参数用它的 **1 起始下标**：1=顺航检查单 … 5=客运过站航班
 */
export const TYPE_ORDER = Object.keys(TYPE_COLORS);

/** checkTemplate 参数值（'1'~'5'）→ 类型名；非法返回 null */
export const typeOfCheckTemplate = (v) => {
    const i = Number(v) - 1;
    return Number.isInteger(i) && i >= 0 && i < TYPE_ORDER.length ? TYPE_ORDER[i] : null;
};

/** 类型名 → checkTemplate 参数值（'1'~'5'）；非已知类型返回 null */
export const checkTemplateOfType = (label) => {
    const i = TYPE_ORDER.indexOf(label);
    return i >= 0 ? String(i + 1) : null;
};

/**
 * hex 主色 → 指定透明度的 rgba
 * 用于从单一主色派生浅底 / 浅边框（inline style 渲染，绕开 Tailwind 动态类名限制）
 * @param {string} hex 形如 #6B2608 或 #abc
 * @param {number} alpha 0~1
 * @returns {string} rgba(...) 字符串；非法输入原样返回
 */
export const withAlpha = (hex, alpha = 1) => {
    const h = String(hex || "").replace("#", "").trim();
    const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
    if (full.length !== 6) return hex;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return hex;
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

// ############################################################
// 模块级资产：模板查表（原 TemplateJson/index.js，并入 store）
// ------------------------------------------------------------
// 放这里的理由：模板 id = 配色键 = 下拉 label = 落库 checklist_category，
// 与 TYPE_COLORS 天然同源；loadTemplate 与 ChecklistPage 的 category 校验都查这张表。
// （面板组 Template/*.jsx 不查表 —— 它们静态 import 自己那份数据，一一穷举）
// ############################################################

/** 模板表：id → 模板对象（对象上补 id 字段，原件里没有，供组件取用） */
const TEMPLATES = Object.fromEntries(
    [
        ["客运始发航班", passengerInitFlight],
        ["客运过站航班", passengerBypassFlight],
        ["货运始发航班", cargoInitFlight],
        ["货运过站航班", cargoBypassFlight],
        ["顺航检查单", shunhangFlight],
    ].map(([id, tpl]) => [id, { ...tpl, id }])
);

/** 兜底模板 id：未匹配任何规则时的默认检查单（货运过站航班） */
export const FALLBACK_TEMPLATE_ID = "货运过站航班";

/** 按 id 取检查单模板（同步、零网络）；无匹配返回 null */
export const getTemplateById = (id) => TEMPLATES[String(id || "")] || null;

/** 已提交记录的可修改时限（小时）：超过该时限 → 锁定只读，禁止再修改/提交 */
const LOCK_HOURS = 24

/** 是否已锁定（已提交且距今超 24h）—— 纯函数，store 内部与组件选择器共用 */
export const isLockedBy = (recordStatus, checkedAt) =>
  recordStatus === 'submitted' &&
  !!checkedAt &&
  Date.now() - new Date(checkedAt).getTime() > LOCK_HOURS * 3600 * 1000

// ============================================================
// 记录 ⇄ 航班 的装配（查看页 /checklists/:checkedId 用）
// ============================================================

/** 取字符串里的 YYYY-MM-DD（取不到返回空串；'10:30' 这类纯时间不会误判成日期） */
const datePartOf = (v) => String(v || '').match(/^\d{4}-\d{2}-\d{2}/)?.[0] || ''

/**
 * 由记录反查来源航班行（manual_fips）
 * flight_id 历史上有两种写法（'manual-5' / '5'）→ 一律取尾部数字匹配。
 * 优先用内存里已缓存的航班列表（从航班列表点进来时零请求），没有再发一次查询；
 * 后端不可用也返回 null —— 查看页用记录自带字段兜底，绝不因反查失败打不开。
 */
async function findSourceFlight(record) {
  const numId = Number(String(record?.flight_id ?? '').match(/(\d+)$/)?.[1])
  if (!numId) return null
  const pick = (list) => (list || []).find((f) => Number(f.id) === numId) || null
  const cached = pick(useManualFipsStore.getState().flights)
  if (cached) return cached
  try {
    return pick((await manualFipsApi.list())?.items)
  } catch {
    return null
  }
}

/**
 * 记录（+来源航班行）→ 统一的 flight 对象
 * 查看器 / 工具栏 / 信息区共用同一套字段（origin / destination / flightDate 等别名在此归一）。
 */
function flightOfRecord(record, row) {
  return {
    ...(row || {}), // 来源航班整行（含 uuid 与 16 个字段）；反查失败时退化为记录自带字段
    id: row?.id ?? record.flight_id,
    uuid: row?.uuid || null, // 草稿键：与"从航班列表进入"保持一致
    queryId: record.flight_id, // 记录侧原始 flight_id，供回跳编辑路由使用
    flightNo: record.flight_no || row?.flight_no || '',
    aircraftType: record.aircraft_type || row?.aircraft_type || '',
    flightDate:
      record.flight_date ||
      datePartOf(row?.in_out_time) ||
      datePartOf(row?.sobt) ||
      datePartOf(record.created_at),
    origin: row?.origin_station || '',
    destination: row?.dest_station || '',
  }
}

/**
 * 按航班键反查来源航班行（manual_fips）
 * 航班键 = uuid（现用）；同时兼容旧的 'manual-2' / '5' 写法 → 取尾部数字按 id 匹配。
 * 优先用内存里缓存的航班列表（从航班列表点进来时零请求），没有再查一次；查不到返回 null。
 */
async function findFlightByKey(flightKey) {
  if (!flightKey) return null
  const key = String(flightKey)
  const numId = Number(key.match(/(\d+)$/)?.[1])
  const pick = (list) =>
    (list || []).find((f) => f.uuid === key) ||
    (list || []).find((f) => String(f.id) === key) ||
    (list || []).find((f) => numId && Number(f.id) === numId) ||
    null
  const cached = pick(useManualFipsStore.getState().flights)
  if (cached) return cached
  try {
    return pick((await manualFipsApi.list())?.items)
  } catch {
    return null
  }
}

/** 航班行 → 统一 flight 对象（展示用驼峰别名；身份仍取 uuid） */
function normalizeFlightRow(row, flightKey) {
  return {
    ...(row || {}),
    id: row?.id ?? flightKey,
    uuid: row?.uuid || flightKey,
    flightNo: row?.flight_no || '',
    aircraftType: row?.aircraft_type || '',
    flightDate: datePartOf(row?.in_out_time) || datePartOf(row?.sobt) || '',
    origin: row?.origin_station || '',
    destination: row?.dest_station || '',
  }
}

// ============================================================
// store 本体
// ============================================================
export const useChecklistStore = create((set, get) => {
  // 三列的固定顺序（与面板组 columns 的 key 一致；panels 为内存态，不持久化）
  const PANEL_KEYS = ['main', 'aux', 'video']

  // ============================================================
  // 提交（新建 / 更新）的公共部件 —— 两个动作只在"调哪个 API"上不同
  // ============================================================

  /**
   * 提交前置校验：航班/模板就位、未被 24h 锁定
   * @returns {{s: Object, d: Object}|null} 通过时返回 {当前状态, 草案快照}；不通过返回 null（saveError 已写入）
   */
  const prepareSubmit = () => {
    const s = get()
    if (!s.flight || !s.template) return null
    if (isLockedBy(s.recordStatus, s.checkedAt)) {
      set({ saveError: `该检查单已提交超过 ${LOCK_HOURS} 小时，不可再修改` })
      return null
    }
    return { s, d: getDraftSnapshot() }
  }

  /**
   * 组装提交载荷（新建 / 更新共用）
   * header 注入模板元信息（记录自描述：这份单子用的是哪个模板/版本）；
   * 其余字段口径与后端 service 一致（更新时后端对未传字段 COALESCE 保持原值）。
   */
  const buildPayload = (s, d, status) => ({
    flightId: s.flight.id,
    flightNo: s.flight.flightNo,
    aircraftType: s.flight.aircraftType,
    checklistCategory: s.template.category, // 与下拉菜单对齐的模板名（如 货运始发航班）
    flightDate: s.flight.flightDate || null,
    header: {
      ...s.header,
      template: {
        uuid: s.template.uuid || null,
        category: s.template.category || null,
        checklistName: s.template.checklistName || null,
        schemaVersion: s.template.schemaVersion || null,
      },
    },
    items: d.items,
    videoSupervision: d.videoItems,
    inspector: d.inspector,
    status,
  })

  /**
   * 落库成功后的统一收尾（新建 / 更新共用）
   *   1) 记录元数据（工具栏徽章 + 24h 锁定基准）
   *   2) 记录页刷新（新增一条 / 分类或状态变了）
   *   3) 清该航班草稿（草稿箱 + IndexedDB）+ 重置落盘签名
   */
  const afterSaved = (record, status, s) => {
    set({
      saveStatus: 'saved',
      checkedAt: record.updated_at || record.created_at || new Date().toISOString(),
      recordStatus: record.status || status,
      loadedRecord: record,
      saveError: null,
    })
    useRecordsStore.getState().refresh()
    const flightKey = s.flight?.uuid || s.flight?.id
    if (flightKey) {
      useDraftStore.getState().removeDraftsByFlight(flightKey)
      removeIdbDraftsByFlight(flightKey)
    }
    resetDraftTracking()
  }

  return {
    // ============================================================
    // 一、工具栏相关
    // ============================================================

    // ---- 1) 航班信息（flightInfo）----
    flight: null,          // 当前航班信息
    header: {},            // 航班号 / 机型 等头部字段（随航班写入；公式引擎读 landingTimeLocal）

    /** 写入航班信息（进入检查单页 / 流程图页时调用），header 同步生成 */
    setFlight: (flight) => set({ flight, header: { flightNo: flight?.flightNo || '', aircraftType: flight?.aircraftType || '' } }),

    // ---- 2) 当前模板（selectedTemplate：类型下拉 / 面板组分流的数据源）----
    template: null,        // 检查单模板（JSON，主监控/辅助节点）

    /**
     * 加载检查单模板 —— **纯本地、零网络**
     * 模板已按 category 穷举静态化（TemplateJson，编译期打包），直接查表即可；
     * 切换检查单类型不再有请求往返与 loading 空窗。
     *
     * ★ **默认类型由本 action 保证**：未命中（含传空）→ 落到 `FALLBACK_TEMPLATE_ID`（货运过站航班），
     *   所以 `template` 永不为空、组件侧不必再写 `|| 兜底`。
     * @param {string} templateId 模板 id（= 类型名 = checklist_category；可为空）
     * @returns {Promise<Object>} 模板对象
     */
    loadTemplate: async (templateId) => {
      const tpl = getTemplateById(templateId) || getTemplateById(FALLBACK_TEMPLATE_ID)
      // 视频监管数据不再进 store：由各检查单面板组（Template/*.jsx）静态 import 自己那一份
      set({ template: tpl })
      return tpl
    },

    /**
     * 打开某航班的检查单会话 —— **编辑器路由 /checklists/flight/:flightId 的唯一装载入口**
     * ------------------------------------------------------------
     * 为什么必须由 URL 驱动装载：编辑器是 store 驱动的（零 props），
     * 只换 URL 而不重装 store，页面就会继续显示**上一个航班**的数据，
     * 而且填写层还留着上一个航班的 items（草稿会落到错误的键上）。
     *
     * 装载顺序（一次到位）：
     *   1) 已是同一航班**且当前不在修改态** → 不重装（从航班列表点进来时 store 已装好，
     *      不重复请求/不冲草稿）；若同时指定了另一种检查单类型（草稿箱选了某一份草稿）
     *      → 转 switchChecklistType
     *      ⚠️ 修改态（recordId 非空）必须往下走：本入口是"新建/续草稿"语义，
     *         不清掉 recordId 的话提交会变成改旧记录（用户点"新建"却改了旧单子）
     *   2) reset()      清上一个航班的会话（含填写层内存）
     *   3) 反查航班行 → setFlight（uuid 身份 + 展示用驼峰别名）
     *   4) openDraft(航班键, 类型)  草稿按「航班键 × 类型」精确取；未指定类型则取最近一份
     *   5) loadTemplate(入参类型 > 草稿里的类型 > 兜底) + setDraftContext（草稿键归属）
     *
     * @param {string} flightKey 航班键（URL 参数，= manual_fips.uuid）
     * @param {string} [templateId] 指定检查单类型（不传则沿用草稿里的类型）
     * @returns {Promise<Object|null>} 装载后的航班对象
     */
    openFlight: async (flightKey, templateId) => {
      if (!flightKey) return null
      const s = get()
      const isSame =
        !!s.flight && String(s.flight.uuid || s.flight.id) === String(flightKey)

      // 同一航班 + 非修改态：只是"换一份草稿"（草稿箱选了另一种检查单类型）→ 交给 switchChecklistType
      if (isSame && !s.recordId) {
        if (templateId && templateId !== s.template?.id) await get().switchChecklistType(templateId)
        return s.flight
      }

      // 换航班，或从"修改某条记录"切回新建态 → 一律重装（reset 会清掉 recordId，
      // 之后的提交才会走 POST 新建，而不是改掉那条旧记录）
      get().reset()
      const flight = normalizeFlightRow(await findFlightByKey(flightKey), flightKey)
      set({ flight, header: { flightNo: flight.flightNo, aircraftType: flight.aircraftType } })

      const rec = await openDraft(flightKey, templateId)
      const tpl = await get().loadTemplate(templateId || rec?.templateId)
      setDraftContext({ flightId: flightKey, flightNo: flight.flightNo, templateId: tpl.id })
      return flight
    },

    /**
     * 打开某条已落库记录进入**修改模式** —— 编辑器路由 `?record=<id>` 的装载入口
     * ------------------------------------------------------------
     * 与 openFlight（新建 / 续草稿）严格分成两条路，谁都不越界：
     *   - 本入口：记录 id 就是身份 → loadRecord 装配 航班 + 模板 + 记录元数据，
     *     并把落库内容灌进填写层；装好后 recordId 非空 → 提交走 updateRecord（PUT）
     *   - openFlight：永不带 recordId → 提交走 createRecord（POST 新建一条）
     * 记录 id 放在 URL 上，刷新 / 直链 / 从填写记录页点"修改"进来都是同一条路。
     * @param {string|number} recordId checklist_records.id（URL 参数）
     * @param {string} [fallbackFlightKey] 记录取不到时的退路（URL 上的航班键）→ 退回新建态
     * @returns {Promise<Object|null>} 装载后的航班对象
     */
    openRecordForEdit: async (recordId, fallbackFlightKey) => {
      const id = Number(recordId)
      if (!id) return null
      const s = get()
      // 已经在同一条记录上（重渲染 / 前进后退）→ 不重装，避免冲掉刚改的内容
      if (String(s.recordId) === String(id) && s.flight) return s.flight
      get().reset()
      const rec = await get().loadRecord(id)
      if (!rec && fallbackFlightKey) {
        // 记录不存在 / 已被别处删除（如填写记录页删掉了）→ 退回新建态，
        // 否则页面会卡在"正在加载检查单"上，用户看不出发生了什么。
        await get().openFlight(fallbackFlightKey)
        set({ saveError: '该检查单记录不存在或已被删除，已切换为新建' })
      }
      return get().flight
    },

    /**
     * 切换检查单类型（下拉菜单选中）
     * ------------------------------------------------------------
     * 草稿键 = 航班键::类型 → **每种类型各有自己的一份草稿**，所以这里的语义是"换一份草稿"：
     *   1) flushDraft()      先把当前类型的草稿落盘（切换不丢已填内容）
     *   2) openDraft(航班键, 新类型)  有该类型草稿就恢复，没有就是空表
     *   3) loadTemplate()    换模板（放在填数据之后，避免"新模板 + 旧数据"的中间态）
     * 记录元数据一并清空（换了检查单，之前那条记录不再对应当前内容）——
     * ★ 含 recordId：换类型 = 另一张单子（不同模板的 items 结构都不同，合并会写坏数据），
     *   所以即使原本在修改某条记录，切类型后也变成"新建"；那条旧记录保持原样不动。
     * @param {string} tplId 模板 id（= 下拉项 label = checklist_category）
     */
    switchChecklistType: async (tplId) => {
      const s = get()
      if (!s.flight) return
      const flightKey = s.flight.uuid || s.flight.id
      flushDraft() // 当前类型的填写先落盘（复合键：各类型各留一份，互不覆盖）
      set({
        selectedCheckNode: null,
        recordId: null,
        recordStatus: null,
        checkedAt: null,
        loadedRecord: null,
      })
      await openDraft(flightKey, tplId)
      await get().loadTemplate(tplId)
      setDraftContext({ flightId: flightKey, flightNo: s.flight.flightNo, templateId: tplId })
    },

    // ---- 3) 列显隐（panels）----
    panels: ['main', 'aux', 'video'],        // 可见列（main/aux/video 的子集，至少一列）

    /**
     * 切换某一列的显示（main / aux / video）
     * 至少保留一列：仅剩一列时再点它无效。
     * 结果按 PANEL_KEYS 顺序归一，顺序天然稳定。
     */
    togglePanel: (key) => {
      if (!PANEL_KEYS.includes(key)) return
      const cur = get().panels
      const has = cur.includes(key)
      if (has && cur.length <= 1) return // 不允许把最后一列也关掉
      const next = PANEL_KEYS.filter((k) => (k === key ? !has : cur.includes(k)))
      set({ panels: next })
    },

    // ---- 4) 流程图（flow：视图模式 form | flow）----
    viewMode: 'form',

    /** 视图模式：form（检查项）| flow（流程图全屏）；支持传函数 `v => next` */
    setViewMode: (next) => {
      const cur = get().viewMode
      const value = typeof next === 'function' ? next(cur) : next
      if (value === cur) return
      set({ viewMode: value })
    },
    toggleViewMode: () => get().setViewMode((v) => (v === 'flow' ? 'form' : 'flow')),

    // ---- 5) 小地图（map：右下角小地图开关）----
    thumbVisible: false,

    setThumbVisible: (next) => {
      const cur = get().thumbVisible
      const value = !!next
      if (value === cur) return
      set({ thumbVisible: value })
    },
    toggleThumbVisible: () => get().setThumbVisible(!get().thumbVisible),

    // ============================================================
    // 二、节点相关（选中节点：卡片高亮 / 辅助栏 / 流程图共用；
    //     填写数据 items/videoItems/inspector 在 checklistDraft，不在本 store）
    // ============================================================
    // 当前选中的检查节点 id（原 currentStep）：卡片点击写入（setSelectedCheckNode），
    // 不再由编辑器以 props 层层下发
    selectedCheckNode: null,

    /** 选中某个检查节点：卡片点击 / 流程图点选 → 驱动卡片高亮、辅助栏切换、流程图脉冲 */
    setSelectedCheckNode: (nodeId) => set({ selectedCheckNode: nodeId }),

    // ============================================================
    // 三、后端交互相关
    // ============================================================

    // ---- 记录元数据（工具栏徽章 / 24h 锁定 / 查看器只读展示）----
    recordId: null,        // 已落库的记录 id（空 → 提交走 create，否则 update）
    recordStatus: null,    // draft | submitted | null
    checkedAt: null,       // 时间基准 = updated_at（表结构已无 checked_at）
    loadedRecord: null,    // 已加载的记录对象（查看模式展示用）

    // ---- 保存状态 / 失败提示（SaveErrorToast 常驻展示）----
    saveStatus: 'idle',    // idle | saving | saved | error
    saveError: null,       // 保存/提交失败提示（常驻，手动关闭）

    /** 关闭保存失败提示 */
    clearSaveError: () => set({ saveError: null }),

    /**
     * 写入记录元数据（加载记录 / 提交成功 / 切换类型时调用）
     * 只覆盖传入的键，未传的保持原值（与 React setState 的局部更新语义一致）。
     * @param {{recordStatus?: string|null, checkedAt?: string|null, loadedRecord?: Object|null}} meta
     */
    setRecordMeta: (meta) => set(meta),

    /**
     * 按记录主键加载检查单 —— **查看页（/checklists/:checkedId）的唯一数据入口**
     * ------------------------------------------------------------
     * 记录 id 就是身份：一次到位装配 航班 + 模板 + 记录元数据 三样，
     * 页面侧零 props 自订阅即可渲染（刷新 / 直链 / 提交后跳转都走这条路）。
     * 同时把已落库结果灌进填写层（hydrateFromRecord）——点"修改"进编辑器时
     * 看到的就是原填写内容，而不是空表。
     * @param {string|number} checkedId checklist_records.id（URL 参数）
     * @returns {Promise<Object|null>} 记录对象；失败返回 null（saveError 已写入）
     */
    loadRecord: async (checkedId) => {
      const id = Number(checkedId)
      if (!id) return null
      set({ saveStatus: 'idle', saveError: null })
      try {
        const record = await checklistsApi.getRecord(id)
        const tpl =
          getTemplateById(record.checklist_category) || getTemplateById(FALLBACK_TEMPLATE_ID)
        const flight = flightOfRecord(record, await findSourceFlight(record))
        set({
          recordId: record.id,
          loadedRecord: record,
          recordStatus: record.status || null,
          checkedAt: record.updated_at || record.created_at || null,
          flight,
          header: {
            ...(record.header || {}),
            flightNo: flight.flightNo,
            aircraftType: flight.aircraftType,
          },
          template: tpl,
          selectedCheckNode: null,
        })
        hydrateFromRecord(record)
        setDraftContext({
          flightId: flight.uuid || record.flight_id,
          flightNo: flight.flightNo,
          templateId: tpl.id,
        })
        return record
      } catch (err) {
        set({ saveError: err.message || '加载检查单失败' })
        return null
      }
    },

    // ---- 三个写动作：新建 / 更新 / 删除（一一对应 POST / PUT / DELETE）----
    // 为什么必须分开：POST 与 PUT 的语义完全不同 —— 以前只有一个 submit() 靠 recordId
    // 隐式分流，而后端 POST 又按 flight_id upsert，于是"点创建检查表"实际改掉了旧记录。
    // 现在按语义显式调用，且后端 POST 只 INSERT：
    //   新建态（recordId 为空）→ createRecord()   POST   新增一条
    //   修改态（有 recordId）  → updateRecord()   PUT    只改 id 那一条
    //   删除                   → deleteRecord()   DELETE 只删 id 那一条
    // 失败不抛错：写 saveError 由 SaveErrorToast 常驻展示。

    /**
     * **新建**检查单记录 —— POST /checklists/records（永远新增一条，绝不碰旧记录）
     * ------------------------------------------------------------
     * 同一航班可以有多份检查单（重填 / 换类型各一份），每份都是独立的一条记录。
     * 调用入口（都是"新建"语义的按钮）：
     *   - 编辑器提交按钮（新建态：URL 上没带 ?record）
     *   - 航班列表「创建检查表」→ reset() + openFlight()（recordId 已清空）
     *   - 详情页「新建检查单」→ 同上
     * ★ 成功后写回 recordId：本会话再提交就变成"更新刚建的这一条"。
     * @param {{status?: string}} [opts] status 默认 'submitted'
     * @returns {Promise<Object|null>} 新记录；失败 null（saveError 已写）
     */
    createRecord: async (opts = {}) => {
      const { status = 'submitted' } = opts
      const pre = prepareSubmit()
      if (!pre) return null
      const { s, d } = pre
      set({ saveStatus: 'saving' })
      try {
        const record = await checklistsApi.createRecord(buildPayload(s, d, status))
        set({ recordId: record.id })
        afterSaved(record, status, s)
        return record
      } catch (err) {
        set({ saveStatus: 'error', saveError: err.message || '新建失败，请重试' })
        return null
      }
    },

    /**
     * **更新**检查单记录 —— PUT /checklists/records/:id（只改 recordId 这一条）
     * 必须处于修改态（recordId 非空，来自 `?record=<id>` 或刚新建成功），否则拒绝执行 ——
     * 宁可报错也不隐式降级成新建，避免"以为在改、其实多出一条"。
     * @param {{status?: string}} [opts] status 默认 'submitted'
     * @returns {Promise<Object|null>} 更新后的记录；失败 null（saveError 已写）
     */
    updateRecord: async (opts = {}) => {
      const { status = 'submitted' } = opts
      const id = get().recordId
      if (!id) {
        set({ saveError: '当前不是修改态（没有记录 id）—— 新建请走"创建检查表"入口' })
        return null
      }
      const pre = prepareSubmit()
      if (!pre) return null
      const { s, d } = pre
      set({ saveStatus: 'saving' })
      try {
        const record = await checklistsApi.updateRecord(id, buildPayload(s, d, status))
        if (!record) throw new Error('记录不存在或已被删除')
        afterSaved(record, status, s)
        return record
      } catch (err) {
        set({ saveStatus: 'error', saveError: err.message || '更新失败，请重试' })
        return null
      }
    },

    /**
     * **删除**检查单记录 —— DELETE /checklists/records/:id（只删这一条）
     * 后端会重算来源航班的 checklist_uuid（该航班还有别的检查单就指向最新一份，没有则置空）。
     * @param {string|number} [id] 记录 id；不传则删当前会话这条（recordId）
     * @returns {Promise<boolean>} 是否删除成功
     */
    deleteRecord: async (id) => {
      const target = id ?? get().recordId
      if (!target) return false
      set({ saveStatus: 'saving' })
      try {
        await checklistsApi.deleteRecord(target)
        // 删掉的正是当前会话这条 → 一并退出修改态（否则后续提交会打到一个不存在的 id）
        if (String(get().recordId) === String(target)) {
          set({ recordId: null, loadedRecord: null, recordStatus: null, checkedAt: null })
        }
        set({ saveStatus: 'idle', saveError: null })
        useRecordsStore.getState().refresh()
        return true
      } catch (err) {
        set({ saveStatus: 'error', saveError: err.message || '删除失败，请重试' })
        return false
      }
    },

    /**
     * 提交（按当前态自动分流）—— recordId 在 → updateRecord（PUT），不在 → createRecord（POST）
     * 工具栏提交按钮用它；需要"必须新建 / 必须更新"的按钮直接调上面两个动作。
     * @returns {Promise<Object|null>} 落库后的记录
     */
    submit: async (opts = {}) => (get().recordId ? get().updateRecord(opts) : get().createRecord(opts)),

    // ============================================================
    // 整体清空（切换航班 / 离开检查单页）
    // ============================================================
    reset: () => {
      hardResetDraft()
      set({
        template: null,
        recordId: null,
        flight: null,
        header: {},
        selectedCheckNode: null,
        saveStatus: 'idle',
        saveError: null,
        recordStatus: null,
        checkedAt: null,
        loadedRecord: null,
        // 注：viewMode / thumbVisible / panels 为内存态布局，跨航班保留，不在此重置
      })
    },
  }
})

/**
 * 是否处于 24h 锁定态（已提交且超时）→ 禁止修改 / 提交
 * selector 返回布尔原始值 → Object.is 稳定，store 不变时不会引起重渲染
 */
export const useIsLocked = () => useChecklistStore((s) => isLockedBy(s.recordStatus, s.checkedAt))
