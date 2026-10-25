/**
 * ============================================================
 * checklistEditorPage.store.js —— 检查单**编辑器**的会话态【Comp 版】
 * ------------------------------------------------------------
 * ★ 本文件是 store/checklistEditorPage.store.js 的 Comp 独立版：
 *   去掉了 fips.store 依赖（editingFlight / setEditingFlight），
 *   方便在 TEMP/Comp 目录下直接跑；其余字段与原版一致。
 *
 * 只放编辑器界面自己的状态：当前模板类型 / 列显隐 / 小地图 / 选中节点。
 * 填写数据（state / text / time / images）不在这里 —— 那是非受控的
 * 本地草稿，在 cache.store.js（Comp 版）里按 uuid 落 IndexedDB。
 * ============================================================
 */
import { create } from "zustand";

/* ============================================================
 * 模块级资产：检查单类型
 * ------------------------------------------------------------
 * ★ 键 = 模板文件名 = category = dropdown label = 落库 `checklist_category`
 *   （类型名本身就是"模板 id"，四处一致，绝不改键名）
 * ★ 键序 = 类型下拉菜单顺序（货运过站 · 顺航 · 货运始发 · 客运始发 · 客运过站）
 * ============================================================ */

/** 检查单类型 → hex 主色 */
export const TYPE_COLORS = {
    顺航检查单: "#059669", // 翠绿
    货运始发航班: "#0891B2", // 深青
    货运过站航班: "#7C3AED", // 紫
    客运始发航班: "#D946EF", // 洋红
    客运过站航班: "#6B2608", // 深棕
};
export const TYPE_ORDER = ["货运过站航班", "顺航检查单", "货运始发航班", "客运始发航班", "客运过站航班"];
/** 类型名 → 主色 */
export const typeColorOf = (label) => TYPE_COLORS[label];

/**
 * hex 主色 → 指定透明度的 rgba
 * 用于从单一主色派生浅底 / 浅边框
 * ⚠️ 禁止 Tailwind 动态拼接类名（JIT 扫不到会静默失效）→ 一律 inline style + 本函数
 */
export const withAlpha = (hex, alpha = 1) => {
    const h = String(hex || "")
        .replace("#", "")
        .trim();
    const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
    if (full.length !== 6) return hex;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return hex;
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

// 三列的固定顺序（与面板组 columns 的 key 一致；显隐为内存态，不持久化）。
const PANEL_KEYS = ["main", "aux", "video"];

// 「面板 key → 显隐字段名」：一一对应，只为了让 panels 数组能跟三个布尔值对上。
// ★ 唯一真源是三个布尔值（mainColVisible / auxColVisible / videoColVisible），
//   panels 只是它们的派生结果，任何改显隐的动作都必须同时更新两者（见 setColVisible）。
export const COLUMN_FIELD = {
    main: "mainColVisible",
    aux: "auxColVisible",
    video: "videoColVisible",
};

/** 由 { main, aux, video } 三个布尔值算出 panels（顺序 = PANEL_KEYS）。 */
const panelsOf = (visible) => PANEL_KEYS.filter((k) => !!visible[k]);

export const useChecklistStore = create((set, get) => {
    return {
        // 模板
        templateType: TYPE_ORDER[0],
        setTemplateType: (templateType) =>
            set({
                templateType,
            }),

        // ============================================================
        // 三列显隐（主要 / 辅助 / 视频）
        // ------------------------------------------------------------
        // ★ 三个布尔值是唯一真源；panels 是它们的派生数组（见下），
        //   只为兼容「面板组按 panels 过滤 columns」的老调用方。
        // ============================================================
        mainColVisible: true,
        auxColVisible: true,
        videoColVisible: true,

        /** 可见列（main/aux/video 的子集，至少一列）；派生量，勿直接 set。 */
        panels: PANEL_KEYS.slice(),

        /**
         * 设置某一列的显示（main / aux / video）。
         * 三条守卫都在这里，调用方（PanelSwitcher）不需要自己判：
         *   - 非法 key → 忽略
         *   - 值没变   → 直接返回（省掉一次无意义的重渲染）
         *   - 关最后一列 → 无效（编辑器至少留一列）
         * 通过守卫后同时写「对应布尔值 + 归一后的 panels」，两者永远一致。
         */
        setColVisible: (key, visible) => {
            const field = COLUMN_FIELD[key];
            if (!field) return;

            const next = !!visible;
            if (get()[field] === next) return;

            const all = {
                main: get().mainColVisible,
                aux: get().auxColVisible,
                video: get().videoColVisible,
            };
            all[key] = next;
            const panels = panelsOf(all);
            if (panels.length === 0) return;

            set({ [field]: next, panels });
        },

        /** 切换某一列的显示（= 取反后交给 setColVisible，守卫共用一份）。 */
        togglePanel: (key) => {
            const field = COLUMN_FIELD[key];
            if (!field) return;
            get().setColVisible(key, !get()[field]);
        },

        // 右下角小地图开关
        thumbVisible: false,
        setThumbVisible: (next) => {
            const value = !!next;
            if (value === get().thumbVisible) return;
            set({ thumbVisible: value });
        },
        toggleThumbVisible: () => get().setThumbVisible(!get().thumbVisible),

        // 选中某个检查节点（对象身份 = schema 里的节点对象）
        selectedMainNode: null,
        setSelectedCheckNode: (node) => set({ selectedMainNode: node }),

        // 原字段名保留：选中节点的 uuid（流程图 / 联动高亮用）
        selectedCheckNode: null,
        setSelectedCheckNodeId: (nodeId) => set({ selectedCheckNode: nodeId }),
    };
});
