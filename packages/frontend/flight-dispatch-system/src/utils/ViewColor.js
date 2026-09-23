/**
 * ============================================================
 * ViewColor —— 查看页（ChecklistViewer）检查单配色 / 状态口径
 * ------------------------------------------------------------
 * 只服务"看"：查看页那三个 CheckList（主监控 / 辅助监控 / 视频监管）
 * 以及它们的统计条。填写页（ChecklistEditor）的配色不走这里 ——
 * 那边是"能点、能改"的交互态，配色在 statusBadge.jsx。
 *
 * ★ 纯数据 + 纯函数：无 React、无 store（utils 层不许反向依赖 store，
 *   否则和 checklistStore → utils 形成环）。
 *
 * ★ 当前配色口径（有意为之，先统一、后细分）：
 *     异常 abnormal → 红
 *     不适用 na     → 灰
 *     待检查 pending → 灰
 *     正常 ok       → 灰
 *   除"异常"外三种**暂时统一灰色**：查看页首要目标是"一眼挑出异常"，
 *   正常/不适用/未填不抢视线。将来若要细分，只改本文件这一张表，
 *   三个 List 与统计条会自动跟着变。
 *
 * ★ 用法
 *   const s = viewStatusOf(item.status)   // 归一化（未知/空 → pending）
 *   <span style={{ color: s.color }}>     // 一律 inline style
 *   ⚠️ 不用 Tailwind 动态类名（JIT 扫不到会静默失效）
 * ============================================================
 */

/**
 * 状态键（内部统一用这四个；记录里 status 的取值是 '' | 'ok' | 'abnormal' | 'na'）
 * 空串 / 未填 → pending
 */
export const PENDING = "pending";

/**
 * 状态描述表（唯一配色来源）
 * @property {string} key    状态键（同上四个）
 * @property {string} label  中文名（统计条 / 状态提示用）
 * @property {string} color  文字色
 * @property {string} bg     浅底（行高亮 / 徽章底）
 * @property {string} border 浅边框
 * @property {string} dot    圆点色（状态图标旁的小圆点）
 */
export const VIEW_STATUS = {
    abnormal: {
        key: "abnormal",
        label: "异常",
        color: "#dc2626", // 红：唯一有色的状态
        bg: "#fef2f2",
        border: "#fecaca",
        dot: "#ef4444",
    },
    na: {
        key: "na",
        label: "不适用",
        color: "#64748b", // 灰（暂时）
        bg: "#f8fafc",
        border: "#e2e8f0",
        dot: "#94a3b8",
    },
    pending: {
        key: PENDING,
        label: "待检查",
        color: "#64748b", // 灰（暂时）
        bg: "#f8fafc",
        border: "#e2e8f0",
        dot: "#cbd5e1",
    },
    ok: {
        key: "ok",
        label: "正常",
        color: "#64748b", // 灰（暂时）
        bg: "#f8fafc",
        border: "#e2e8f0",
        dot: "#94a3b8",
    },
};

/** 统计条里的展示顺序（异常最先 → 一眼看到问题） */
export const VIEW_STATUS_ORDER = ["abnormal", "na", PENDING, "ok"];

/**
 * 状态 → 配色描述（归一化出口：一切组件都经这里取色）
 * @param {string} [status] 记录里的 status：'' | 'ok' | 'abnormal' | 'na'
 * @returns {Object} VIEW_STATUS 里的一项（未知值一律按"待检查"）
 */
export const viewStatusOf = (status) => VIEW_STATUS[status] || VIEW_STATUS[PENDING];

/**
 * 状态文字色（最常用的一项，单独给个快捷函数）
 * @param {string} [status]
 */
export const viewStatusColor = (status) => viewStatusOf(status).color;

/**
 * 三个 CheckList 的外观配置（标题 / 主色）
 * ★ 目前三块统一中性灰，不分色：查看页要的是"三列并排、一眼扫完"，
 *   标题文字已足够区分；将来要分色也只改这里。
 * @property {string} label  列表标题
 * @property {string} accent 主色（标题图标 / 计数徽章）
 * @property {string} soft   浅底（标题栏背景 / 分组标题底）
 */
export const VIEW_LIST = {
    main: { label: "主监控指标", accent: "#475569", soft: "#f1f5f9" },
    auxiliary: { label: "辅助监控指标", accent: "#475569", soft: "#f1f5f9" },
    video: { label: "视频监管检查重点", accent: "#475569", soft: "#f1f5f9" },
};

/**
 * 统计一组记录项的状态分布
 * @param {Array<Object|undefined|null>} items 记录项数组（record.items[key]）
 * @returns {{total:number, abnormal:number, na:number, pending:number, ok:number}}
 */
export function countViewStatus(items) {
    const out = { total: 0, abnormal: 0, na: 0, pending: 0, ok: 0 };
    for (const it of items || []) {
        out.total++;
        out[viewStatusOf(it?.status).key]++;
    }
    return out;
}
