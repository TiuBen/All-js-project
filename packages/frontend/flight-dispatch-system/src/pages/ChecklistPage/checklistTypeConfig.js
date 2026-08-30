/**
 * ============================================================
 * 检查单类型配置（可编辑）
 * ------------------------------------------------------------
 * TYPE_BUTTONS：检查单类型定义（下拉菜单项 + 标题颜色）
 * CHECKLIST_TYPE_PREFIX_RULES：默认类型规则 —— 航班号前缀 → 检查单类型
 *   { "顺航检查单": ["CSS"], ... }  前缀匹配（不区分大小写）
 * DEFAULT_CHECKLIST_TYPE：未匹配前缀时的默认类型
 * ============================================================
 */

// 检查单类型：tplId 模板 + flightType 节点集（旧结构 flightTypes 用；新结构 schema 忽略 flightType）
// 5 类各用一种颜色（避免使用全局主色蓝 / 琥珀）
export const TYPE_BUTTONS = [
    {
        label: "顺航检查单",
        routeId: "template1",
        tplId: "cargo-checklist",
        flightType: "常规航班",
        dot: "bg-green-500",
        activeCls: "border-green-400 bg-green-100 text-green-800",
        textCls: "text-green-800",
        titleCls: "text-green-800",
    },
    {
        label: "始发货航检查单",
        routeId: "template2",
        tplId: "cargo-checklist",
        flightType: "始发航班",
        dot: "bg-purple-500",
        activeCls: "border-purple-400 bg-purple-100 text-purple-800",
        textCls: "text-purple-800",
        titleCls: "text-purple-800",
    },
    {
        label: "过站货航检查单",
        routeId: "template3",
        tplId: "cargo-checklist",
        flightType: "过站航班",
        dot: "bg-cyan-500",
        activeCls: "border-cyan-400 bg-cyan-100 text-cyan-800",
        textCls: "text-cyan-800",
        titleCls: "text-cyan-800",
    },
    {
        label: "始发客运检查单",
        routeId: "template4",
        tplId: "passenger-checklist",
        flightType: "航空器始发",
        dot: "bg-teal-500",
        activeCls: "border-teal-400 bg-teal-100 text-teal-800",
        textCls: "text-teal-800",
        titleCls: "text-teal-800",
    },
    {
        label: "过站客运检查单",
        routeId: "template5",
        tplId: "passenger-checklist",
        flightType: "航空器过站",
        dot: "bg-lime-500",
        activeCls: "border-lime-400 bg-lime-100 text-lime-800",
        textCls: "text-lime-800",
        titleCls: "text-lime-800",
    },
];

/** 按 label 快速查找（默认类型解析用） */
export const TYPE_BY_LABEL = Object.fromEntries(TYPE_BUTTONS.map((b) => [b.label, b]));

/**
 * 默认类型规则：检查单类型名 → 航班号前缀列表
 * 例：{ "顺航检查单": ["CSS"], "过站货航检查单": ["CCA"] }
 * 前缀匹配不区分大小写；多个前缀可用数组配置。
 */
export const CHECKLIST_TYPE_PREFIX_RULES = {
    "顺航检查单": ["CSS"], // CSS 开头 → 顺航检查单
    // "始发货航检查单": ["XXX"], // 需要时取消注释配置
};

/** 未匹配任何前缀时的默认检查单类型 */
export const DEFAULT_CHECKLIST_TYPE = "过站货航检查单";

/**
 * 按航班号解析默认检查单类型
 * @param {string} flightNo 航班号
 * @returns {string} 检查单类型 label（如 "顺航检查单"）
 */
export const resolveDefaultType = (flightNo) => {
    const no = String(flightNo || "").toUpperCase();
    for (const [label, prefixes] of Object.entries(CHECKLIST_TYPE_PREFIX_RULES)) {
        if ((prefixes || []).some((p) => no.startsWith(String(p).toUpperCase()))) return label;
    }
    return DEFAULT_CHECKLIST_TYPE;
};
