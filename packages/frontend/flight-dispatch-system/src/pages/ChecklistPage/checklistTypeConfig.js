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
// tplId 对应 data/checklists/*.json 文件名（中文名模板）；视频监管重点由后端按 category 自动附加（货运→货运航班视频监管重点 / 客运→客运航班视频监管重点）
export const TYPE_BUTTONS = [
    {
        label: "顺航检查单",
        routeId: "template1",
        tplId: "顺航检查单", // 空模板（暂无内容，先占位）
        flightType: "常规航班",
        dot: "bg-green-500",
        activeCls: "border-green-400 bg-green-100 text-green-800",
        textCls: "text-green-800",
        titleCls: "text-green-800",
    },
    {
        label: "始发货航检查单",
        routeId: "template2",
        tplId: "货运始发航班", // 对应 data/checklists/货运始发航班.json
        flightType: "始发航班",
        dot: "bg-purple-500",
        activeCls: "border-purple-400 bg-purple-100 text-purple-800",
        textCls: "text-purple-800",
        titleCls: "text-purple-800",
    },
    {
        label: "过站货航检查单",
        routeId: "template3",
        tplId: "货运过站航班", // 对应 data/checklists/货运过站航班.json
        flightType: "过站航班",
        dot: "bg-cyan-500",
        activeCls: "border-cyan-400 bg-cyan-100 text-cyan-800",
        textCls: "text-cyan-800",
        titleCls: "text-cyan-800",
    },
    {
        label: "始发客运检查单",
        routeId: "template4",
        tplId: "客运始发航班", // 对应 data/checklists/客运始发航班.json
        flightType: "航空器始发",
        dot: "bg-teal-500",
        activeCls: "border-teal-400 bg-teal-100 text-teal-800",
        textCls: "text-teal-800",
        titleCls: "text-teal-800",
    },
    {
        label: "过站客运检查单",
        routeId: "template5",
        tplId: "客运过站航班", // 对应 data/checklists/客运过站航班.json
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

/**
 * 模板定位表：category + checklistName → 模板 id（文件名）
 * 记录只存 checklist_category，模板由 header.template（category + checklistName）反查；
 * 两者组合可唯一确定 5 个模板之一。
 */
const TEMPLATE_BY_CATEGORY_NAME = {
    "货运航班-顺航": "顺航检查单",
    "货运航班-始发航班": "货运始发航班",
    "货运航班-常规航班": "货运过站航班",
    "客运航班-始发航班": "客运始发航班",
    "客运航班-过站航班": "客运过站航班",
};

/**
 * 按记录/航班解析应加载的模板 id
 * 优先级：记录 header.template（category + checklistName 精确反查）→ 客运默认 → 航班前缀规则
 * @param {Object} headerTemplate 记录 header.template（可能为空，旧数据）
 * @param {Object} flight 航班对象（提供 category / flightNo）
 * @returns {string} 模板 id（如 "货运始发航班"）
 */
export const resolveTemplateIdByRecord = (headerTemplate, flight) => {
    const name = headerTemplate?.checklistName;
    const category = headerTemplate?.category || flight?.category;
    if (category && name) {
        const id = TEMPLATE_BY_CATEGORY_NAME[`${category}-${name}`];
        if (id) return id;
    }
    if (category === "客运航班") return "客运始发航班";
    const defaultBtn = TYPE_BY_LABEL[resolveDefaultType(flight?.flightNo)];
    return defaultBtn?.tplId || "货运过站航班";
};
