/**
 * ============================================================
 * settingStore —— 设置页（码表维护）专用 store
 * ------------------------------------------------------------
 * 管理两张码表的数据与操作，后端同一个资源、靠 kind 区分：
 *   airlines → airplane_company_name_code  航司码（中文名 ↔ IATA / ICAO）
 *   airports → airport_name_code           机场码（中英文名 ↔ IATA / ICAO）
 *
 * ★ 为什么两张表共用**一个** store：
 *   后端两张码表是两个**独立模块**（airlines / airports，字段名直接用库列名），
 *   但 HTTP 路径完全对称（/api/setting/:kind[/:id]）。前端对应地也只维护
 *   一套状态，用行缓存 rowsByKind 把两张表的数据分开放，切板块不丢数据、
 *   也不互相覆盖。
 *
 * ★ 搜索是**服务端**做的（?q= 模糊匹配中文名 / 英文名 / IATA / ICAO）：
 *   码表本身会持续增长，前端全量拉回来再本地过滤不划算，所以 keyword
 *   变化由页面触发一次 fetchRows。
 *
 * ★ 写操作（create / update / remove）成功后**自动重拉当前码表**，
 *   保证表格与库一致；失败则原样抛出，由调用方（表格组件）就地提示，
 *   不写进 error —— error 只表示「列表加载失败」，避免两种错误互相串台。
 * ============================================================
 */
import { create } from 'zustand'
import { settingApi, SETTING_KINDS } from '../api'

/** 取不到时复用的空数组（保持引用稳定，避免无谓重渲染） */
const EMPTY = []

/** 两张码表的初始空缓存 */
const emptyRows = () => SETTING_KINDS.reduce((acc, k) => ({ ...acc, [k]: [] }), {})

/** 两张码表的初始空搜索词 */
const emptyKeywords = () => SETTING_KINDS.reduce((acc, k) => ({ ...acc, [k]: '' }), {})

export const useSettingStore = create((set, get) => ({
    // ---- 状态 ----
    /** 当前板块（码表种类）：airlines | airports */
    kind: SETTING_KINDS[0],
    /**
     * 各码表的搜索词：{ airlines: '', airports: '' }
     * ★ 必须**按 kind 分开**：设置页三个板块是常驻挂载的，两张表格同时活着，
     *   共用一个 keyword 会让「航司的搜索词」把机场表也一起过滤掉。
     */
    keywordByKind: emptyKeywords(),
    /** 各码表的行缓存：{ airlines: [], airports: [] } */
    rowsByKind: emptyRows(),
    /** 正在加载的码表种类（null = 空闲）；只让「当前表格」转圈 */
    loadingKind: null,
    /** 列表加载错误（仅此一种；保存/删除错误由调用方就地处理） */
    error: null,

    // ---- 动作 ----
    /** 切换当前码表（非法值忽略） */
    setKind: (kind) => {
        if (!SETTING_KINDS.includes(kind)) return
        set({ kind, error: null })
    },

    /** 设置某个码表的搜索词（页面 onChange 调它，再由页面防抖触发 fetchRows） */
    setKeyword: (kind, keyword) =>
        set((s) => ({ keywordByKind: { ...s.keywordByKind, [kind]: keyword } })),

    /** 取某个码表的行（默认当前）——非响应式读取，供事件回调里用 */
    rowsOf: (kind = get().kind) => get().rowsByKind[kind] || EMPTY,

    /**
     * 拉取码表列表
     * @param {'airlines'|'airports'} [kind] 目标码表，默认当前
     * @param {{q?:string}} [opts] 传 q 覆盖该码表的 keyword（不传则用 store 里的）
     */
    fetchRows: async (kind = get().kind, opts = {}) => {
        const q = opts.q !== undefined ? opts.q : get().keywordByKind[kind] || ''
        set({ loadingKind: kind, error: null })
        try {
            const d = await settingApi.list(kind, q ? { q } : {})
            set((s) => ({
                loadingKind: null,
                rowsByKind: { ...s.rowsByKind, [kind]: d?.items || [] },
            }))
            return d?.items || []
        } catch (e) {
            console.error(`加载码表（${kind}）失败:`, e)
            set((s) => ({
                loadingKind: null,
                error: e.message || '加载失败',
                rowsByKind: { ...s.rowsByKind, [kind]: [] },
            }))
            return []
        }
    },

    /** 新增（中文名列必填；唯一列撞车后端回 409 → 抛出给调用方提示） */
    createRow: async (kind, data) => {
        const row = await settingApi.create(kind, data)
        await get().fetchRows(kind)
        return row
    },

    /** 更新（局部更新；显式传 null / 空串清空该列） */
    updateRow: async (kind, id, data) => {
        const row = await settingApi.update(kind, id, data)
        await get().fetchRows(kind)
        return row
    },

    /** 删除 */
    removeRow: async (kind, id) => {
        await settingApi.remove(kind, id)
        await get().fetchRows(kind)
    },
}))
