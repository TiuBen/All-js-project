/**
 * ============================================================
 * checklist.editor.store —— 检查单**编辑器**的会话态
 * ------------------------------------------------------------
 * 只放编辑器界面自己的状态：当前航班 / 当前模板 / 列显隐 / 小地图 / 选中节点。
 * 填写数据（items / videoItems / inspector）不在这里 —— 那是非受控的内存草案，
 * 在 store/checklist.store.js 的填写层。
 * ============================================================
 */
import { create } from "zustand";
import { useSidebarStore } from "./sidebar.store";
import { TEMPLATE_KEY_BY_TYPE } from "../config/dataSource";
import { draftKeyOf } from "../utils/checklistCache";
import {
    CARGO_VIDEO_FOCUS,
    SHUNHANG_VIDEO_FOCUS,
    PASSENGER_VIDEO_FOCUS,
    cargoBypassFlight,
    cargoInitFlight,
    passengerBypassFlight,
    passengerInitFlight,
    shunhangFlight,
} from "../pages/ChecklistPage/Const";

/* ============================================================
 * 二、模块级资产：检查单类型
 * ------------------------------------------------------------
 * ★ 键 = 模板文件名 = category = dropdown label = 落库 `checklist_category`
 *   （类型名本身就是"模板 id"，四处一致，绝不改键名）
 * ★ 键序 = 类型下拉菜单顺序（顺航 · 货运始发 · 货运过站 · 客运始发 · 客运过站）
 *   TemplateChooseDropdown 的 TYPE_ORDER 自维护顺序，改这里时需与它同步。
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

/* ============================================================
 * 三、模板数据：类型名 → schema / 视频监管
 * ------------------------------------------------------------
 * ★ 面板组件（MainList / AuxiliaryList / VideoList）**不接 props**，
 *   各自到这里订阅 —— 所以「按类型查模板」这件事必须在 store 里做一次，
 *   否则每个面板都要自己抄一份 map（抄错一个字就是一张空白检查单）。
 * ★ 这里是全前端第三处复用这组中文类型名（另两处：
 *   Editor 的模板选择、ChecklistViewer 的按记录类型取模板），键名必须逐字一致。
 * ============================================================ */
const TEMPLATE_BY_TYPE = {
    货运过站航班: cargoBypassFlight,
    顺航检查单: shunhangFlight,
    货运始发航班: cargoInitFlight,
    客运始发航班: passengerInitFlight,
    客运过站航班: passengerBypassFlight,
};

/** 类型名 → 模板（认不出返回 null，调用方兜底） */
export const templateOf = (templateType) => TEMPLATE_BY_TYPE[templateType] ?? null;

/** 类型名 → 视频监管数据（口径与填写页 / 查看页一致：货运 / 顺航 / 其余客运） */
export const videoFocusOf = (templateType) => {
    if (String(templateType).includes("货运")) return CARGO_VIDEO_FOCUS;
    if (String(templateType).includes("顺航")) return SHUNHANG_VIDEO_FOCUS;
    return PASSENGER_VIDEO_FOCUS;
};

/**
 * 由「航班 uuid + 模板类型」算出编辑器要用的全部派生量。
 * ★ 一个航班 × 一种模板 = 一条草稿，所以草稿键也在这里算（规则在
 *   utils/checklistCache 的 draftKeyOf，别在业务代码里自己拼）。
 * @param {string} flightUuid    路由上的 :flightUuid
 * @param {string} templateType  中文类型名
 */
const draftStateOf = (flightUuid, templateType) => {
    const templateKey = TEMPLATE_KEY_BY_TYPE[templateType];
    return {
        templateType,
        templateKey,
        draftKey: draftKeyOf(flightUuid, templateKey),
        mains: templateOf(templateType)?.schema ?? [],
        videoGroups: videoFocusOf(templateType).groups,
    };
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
        // 当前航班信息 —— 就是航班页选中的那一行（sidebar.store）
        editingFlight: () => useSidebarStore.getState().selectedFlight,

        // 写入航班信息（从未提交草稿页面进入具体检查单页 / 流程图页时调用）
        setEditingFlight: (editingFlight) =>
            set({
                editingFlight,
            }),

        //节点
        // ★ 选中主项的**唯一真源**：MainCheckItem 点一下就写这里，
        //   主项高亮与辅助列「当前看哪个主项的辅助项」都读它，不再用 props 往下传。
        selectedMainNode: null,
        setSelectedCheckNode: (node) => set({ selectedMainNode: node }),

        // ============================================================
        // 2.4) 航班 + 模板 → 模板数据 / 草稿键（三个面板的唯一数据源）
        // ------------------------------------------------------------
        // ★ 面板组件（MainList / AuxiliaryList / VideoList）**不接 props**：
        //   各自订阅这里，切航班 / 切模板时自动跟着换数据。
        // ★ flightUuid 由 Editor 从路由同步进来（setFlightUuid），
        //   草稿键随之重算 —— 一个航班 × 一种模板 = 一条草稿。
        // ============================================================
        flightUuid: "",
        setFlightUuid: (flightUuid) => set({ flightUuid, ...draftStateOf(flightUuid, get().templateType) }),

        /** 模板相关派生量：templateType / templateKey / draftKey / mains / videoGroups */
        ...draftStateOf("", TYPE_ORDER[0]),
        setTemplateType: (templateType) => set(draftStateOf(get().flightUuid, templateType)),

        // ============================================================
        // 2.5) 三列显隐（主要 / 辅助 / 视频）
        // ------------------------------------------------------------
        // ★ 三个布尔值是唯一真源；panels 是它们的派生数组（见下），
        //   只为兼容「面板组按 panels 过滤 columns」的老调用方。
        // ============================================================
        mainColVisible: true,
        setMainColVisible: true,
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

        //  选中某个检查节点
        selectedCheckNode: null, // 原 currentStep
        // setSelectedCheckNode: (nodeId) => set({ selectedCheckNode: nodeId }),
    };
});
