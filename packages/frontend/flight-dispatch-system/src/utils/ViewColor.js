/**
 * ============================================================
 * ViewColor —— 查看页检查单的状态配色 / 状态口径
 * ------------------------------------------------------------
 * 只服务"看"：查看页那条只读卡片（Viewer/Components/ViewItem.jsx）。
 * 填写页（Editor）的配色不走这里 —— 那边是"能点、能改"的交互态，
 * 配色在 Editor/Components/statusBadge.js。
 *
 * ★ 纯数据 + 纯函数：无 React、无 store（utils 层不许反向依赖 store，
 *   否则和 checklist.store → utils 形成环）。
 *
 * ★ 当前配色口径（有意为之，先统一、后细分）：
 *     异常 abnormal → 红
 *     不适用 na     → 灰
 *     待检查 pending → 灰
 *     正常 ok       → 灰
 *   除"异常"外三种**暂时统一灰色**：查看页首要目标是"一眼挑出异常"，
 *   正常/不适用/未填不抢视线。将来若要细分，只改本文件这一张表。
 *
 * ★ 本次清理删掉的死代码（全仓库零引用）：
 *     VIEW_STATUS_ORDER / viewStatusColor / VIEW_LIST / countViewStatus
 *   —— 统计条与三列分色的方案最终没落地，看记录只用了 viewStatusOf 一个出口。
 * ============================================================
 */

/** 状态键：空串 / 未填 → pending（内部统一用这四个键） */
const PENDING = "pending";

/**
 * 状态描述表（唯一配色来源，内部用）。
 * @property {string} key    状态键（同下四个）
 * @property {string} label  中文名（卡片右上角那个词）
 * @property {string} color  文字色
 * @property {string} bg     浅底
 * @property {string} border 浅边框
 * @property {string} dot    圆点色
 */
const VIEW_STATUS = {
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

/**
 * 状态 → 配色描述（归一化出口：未知值一律按"待检查"）。
 * @usedBy pages/ChecklistPage/Viewer/Components/ViewItem.jsx（卡片右上角的状态文字色）
 * @param {string} [status] 记录里的 state：'' | 'ok' | 'abnormal' | 'na'
 * @returns {{key:string,label:string,color:string,bg:string,border:string,dot:string}}
 */
export const viewStatusOf = (status) => VIEW_STATUS[status] || VIEW_STATUS[PENDING];
