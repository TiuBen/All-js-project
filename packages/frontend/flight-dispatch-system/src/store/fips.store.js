/**
 * ============================================================
 * fips.store —— 航班列表（FipsPage）「表头配置」仓库
 * ------------------------------------------------------------
 * 管理三张表的表头（列）配置：
 *   all → 全部航班（单表）
 *   in  → 进港航班（落地机场 = 本场的航班）
 *   out → 离港航班（起飞机场 = 本场的航班）
 *
 * 每列的形状：
 *   { key: 'sobt', label: 'SOBT', isHide: false, colOrder: 5 }
 *     isHide   → 是否在表格中隐藏（true = 不渲染此列）
 *     colOrder → 列顺序（渲染时按它升序排列，可在编辑态用上下箭头调整）
 *
 * ★ 默认值 = 全部显示（isHide:false）+ 声明顺序（colOrder = 下标），
 *   即 DEFAULT_TABLE_HEADERS。
 *
 * ★ 交互模型（编辑 → 确认）：
 *   1. beginEdit(view)   进入编辑态：把当前配置复制成「草稿」，表头出现 checkbox
 *   2. toggleDraft(key)  勾选 / 取消勾选（只改草稿，不动生效配置）
 *   3. confirmEdit()     确认：草稿写回 tableHeaders → persist 落 localStorage
 *      cancelEdit()      取消：丢弃草稿，生效配置不变
 *
 * ★ 持久化只用 localStorage（zustand/middleware persist）。
 *   编辑草稿（draftHeaders）**不落盘**（partialize 只存 tableHeaders），
 *   避免"改了但没确认"的状态被当成已保存配置。
 *
 * ★ 读取顺序（渲染时）：本地缓存有该视图的配置 → 用它；
 *   没有 → 用默认（全部显示 + 默认 colOrder）。
 *   merge() 里还会做一次归一化：以基础列为准，把新增列补上、已删除列丢掉，
 *   因此以后在 BASE_COLUMNS 里加列，老用户缓存不会挡住新列。
 * ============================================================
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 时间列（展示取 HH:mm，排序按时间戳） */
export const TIME_KEYS = ['sobt', 'eobt', 'atot', 'sibt', 'eldt', 'aldt']

/** 视图键：全部 / 进港 / 离港 */
export const VIEW_KEYS = ['all', 'in', 'out']

/**
 * 基础列定义（全部航班的列；数组顺序 = 默认 colOrder）
 * ★ 这里是「列清单」的唯一事实来源：中文名、顺序都只在这里写一遍。
 */
export const BASE_COLUMNS = [
    { key: 'task', label: '任务性质' },
    { key: 'flight_no', label: '航班号' },
    { key: 'origin_station', label: '起飞机场' },
    { key: 'dest_station', label: '目的地机场' },
    { key: 'landing_station', label: '落地机场' },
    { key: 'sobt', label: 'SOBT' },
    { key: 'eobt', label: 'EOBT' },
    { key: 'atot', label: 'ATOT' },
    { key: 'sibt', label: 'SIBT' },
    { key: 'eldt', label: 'ELDT' },
    { key: 'aldt', label: 'ALDT' },
    { key: 'runway', label: '跑道' },
    { key: 'stand', label: '停机位' },
    { key: 'aircraft_type', label: '机型' },
]

/**
 * 三种视图各自的基础列
 *   进港：落地机场就是本场，无意义 → 不含 landing_station
 *   离港：起飞机场就是本场，无意义 → 不含 origin_station
 *   （与改动前的 ARR_COLUMNS / DEP_COLUMNS 语义完全一致）
 */
export const BASE_COLUMNS_BY_VIEW = {
    all: BASE_COLUMNS,
    in: BASE_COLUMNS.filter((c) => c.key !== 'landing_station'),
    out: BASE_COLUMNS.filter((c) => c.key !== 'origin_station'),
}

/** 某个视图的默认表头：全部显示 + 声明顺序 */
export function makeDefaultHeaders(view) {
    const cols = BASE_COLUMNS_BY_VIEW[view] || []
    return cols.map((c, i) => ({ key: c.key, label: c.label, isHide: false, colOrder: i }))
}

/** 三套默认表头（本地缓存为空时用它） */
export const DEFAULT_TABLE_HEADERS = VIEW_KEYS.reduce((acc, v) => {
    acc[v] = makeDefaultHeaders(v)
    return acc
}, {})

/**
 * 归一化：以基础列为准，套用已保存的 isHide / colOrder
 *   - 有明确 colOrder 的列 → 按它排序（并列时按声明顺序）
 *   - 没有 colOrder 的列（新增列 / 老缓存缺项）→ 按声明顺序排在最后
 *   - 已删除的列 → 丢弃
 *   - 最后把 colOrder 重新编号成 0..n-1，避免与回落值碰撞
 * 返回新数组，不修改入参。
 */
export function normalizeHeaders(view, saved) {
    const base = BASE_COLUMNS_BY_VIEW[view] || []
    const savedMap = new Map(
        (Array.isArray(saved) ? saved : []).filter((h) => h && h.key).map((h) => [h.key, h]),
    )

    const ordered = []
    const unordered = []
    base.forEach((c, i) => {
        const s = savedMap.get(c.key)
        if (Number.isFinite(s?.colOrder)) ordered.push({ col: c, saved: s, order: s.colOrder, i })
        else unordered.push({ col: c, saved: s, i })
    })
    ordered.sort((a, b) => a.order - b.order || a.i - b.i)

    return [...ordered, ...unordered].map(({ col, saved: s }, idx) => ({
        key: col.key,
        label: col.label,
        isHide: typeof s?.isHide === 'boolean' ? s.isHide : false,
        colOrder: idx,
    }))
}

/**
 * 取某张表「当前要渲染的列」
 *   编辑态 → 返回**全部列**（含被隐藏的，供勾选回来）
 *   非编辑态 → 过滤掉 isHide，并按 colOrder 排序
 */
export function pickRenderColumns(state, view) {
    const editing = state.editingView === view
    const list = editing ? state.draftHeaders : state.tableHeaders[view]
    const arr = [...(list || [])].sort((a, b) => a.colOrder - b.colOrder)
    return editing ? arr : arr.filter((h) => !h.isHide)
}

export const useFipsStore = create(
    persist(
        (set, get) => ({
            /** 生效的表头配置（渲染依据；已持久化） */
            tableHeaders: DEFAULT_TABLE_HEADERS,

            /** 当前正在编辑哪张表的表头：null | 'all' | 'in' | 'out' */
            editingView: null,
            /** 编辑草稿（未确认前不落盘） */
            draftHeaders: null,

            /** 进入编辑态：草稿 = 当前生效配置的副本（含已隐藏列） */
            beginEdit: (view) => {
                if (!VIEW_KEYS.includes(view)) return
                const current = get().tableHeaders[view] || makeDefaultHeaders(view)
                set({ editingView: view, draftHeaders: current.map((h) => ({ ...h })) })
            },

            /** 草稿里切换某列的显示 / 隐藏 */
            toggleDraft: (key) =>
                set((s) => {
                    if (!s.draftHeaders) return {}
                    return {
                        draftHeaders: s.draftHeaders.map((h) =>
                            h.key === key ? { ...h, isHide: !h.isHide } : h,
                        ),
                    }
                }),

            /** 草稿里一次显示全部列 */
            showAllDraft: () =>
                set((s) => (s.draftHeaders ? { draftHeaders: s.draftHeaders.map((h) => ({ ...h, isHide: false })) } : {})),

            /** 草稿里把某列上移 / 下移一位（重排 colOrder） */
            moveDraft: (key, dir) =>
                set((s) => {
                    if (!s.draftHeaders) return {}
                    const arr = [...s.draftHeaders].sort((a, b) => a.colOrder - b.colOrder)
                    const i = arr.findIndex((h) => h.key === key)
                    const j = i + (dir === 'up' ? -1 : 1)
                    if (i < 0 || j < 0 || j >= arr.length) return {}
                    ;[arr[i], arr[j]] = [arr[j], arr[i]]
                    return { draftHeaders: arr.map((h, idx) => ({ ...h, colOrder: idx })) }
                }),

            /** 草稿恢复该视图默认（全部显示 + 默认顺序）；仍需点「确认」才生效 */
            resetDraft: (view) =>
                set((s) => (s.editingView === view ? { draftHeaders: makeDefaultHeaders(view) } : {})),

            /** 取消编辑：丢弃草稿 */
            cancelEdit: () => set({ editingView: null, draftHeaders: null }),

            /** 确认：草稿写回生效配置并落盘（persist 自动写 localStorage） */
            confirmEdit: () =>
                set((s) => {
                    if (!s.editingView || !s.draftHeaders) return {}
                    const view = s.editingView
                    const normalized = s.draftHeaders.map((h, i) => ({ ...h, colOrder: i }))
                    return {
                        tableHeaders: { ...s.tableHeaders, [view]: normalized },
                        editingView: null,
                        draftHeaders: null,
                    }
                }),

            /** 直接把某个视图恢复默认（无需进编辑态） */
            resetView: (view) =>
                set((s) =>
                    VIEW_KEYS.includes(view)
                        ? { tableHeaders: { ...s.tableHeaders, [view]: makeDefaultHeaders(view) } }
                        : {},
                ),
        }),
        {
            name: 'flight-dispatch:fips:table-headers',
            version: 1,
            // 只持久化生效配置；编辑草稿/编辑态是临时 UI 状态，不落盘
            partialize: (s) => ({ tableHeaders: s.tableHeaders }),
            // 读缓存时归一化：补新增列、丢已删列、修非法 colOrder
            merge: (persisted, current) => {
                const saved = persisted?.tableHeaders || {}
                const tableHeaders = VIEW_KEYS.reduce((acc, v) => {
                    acc[v] = normalizeHeaders(v, saved[v])
                    return acc
                }, {})
                return { ...current, tableHeaders }
            },
        },
    ),
)
