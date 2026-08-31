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
// label 与模板 category 完全对齐（= 模板文件名 = checklist_records.checklist_category 的落库值）：
//   dropdown 选中什么，记录里存的 checklist_category 就是什么，前后端数据一致。
// tplId 对应 data/checklists/*.json 文件名（中文名模板）；视频监管重点由后端按 category 匹配（含"客运"→客运视频 / 含"货运|顺航"→货运视频）
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
        label: "货运始发航班",
        routeId: "template2",
        tplId: "货运始发航班", // 对应 data/checklists/货运始发航班.json
        flightType: "始发航班",
        dot: "bg-purple-500",
        activeCls: "border-purple-400 bg-purple-100 text-purple-800",
        textCls: "text-purple-800",
        titleCls: "text-purple-800",
    },
    {
        label: "货运过站航班",
        routeId: "template3",
        tplId: "货运过站航班", // 对应 data/checklists/货运过站航班.json
        flightType: "过站航班",
        dot: "bg-cyan-500",
        activeCls: "border-cyan-400 bg-cyan-100 text-cyan-800",
        textCls: "text-cyan-800",
        titleCls: "text-cyan-800",
    },
    {
        label: "客运始发航班",
        routeId: "template4",
        tplId: "客运始发航班", // 对应 data/checklists/客运始发航班.json
        flightType: "航空器始发",
        dot: "bg-teal-500",
        activeCls: "border-teal-400 bg-teal-100 text-teal-800",
        textCls: "text-teal-800",
        titleCls: "text-teal-800",
    },
    {
        label: "客运过站航班",
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
 * 例：{ "顺航检查单": ["CSS"], "货运过站航班": ["CCA"] }
 * 前缀匹配不区分大小写；多个前缀可用数组配置。
 */
export const CHECKLIST_TYPE_PREFIX_RULES = {
    "顺航检查单": ["CSS"], // CSS 开头 → 顺航检查单
    // "货运始发航班": ["XXX"], // 需要时取消注释配置
};

/** 未匹配任何前缀时的默认检查单类型 */
export const DEFAULT_CHECKLIST_TYPE = "货运过站航班";

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
 * 模板定位表：category（= 模板名 = dropdown label）→ 模板 id（文件名）
 * 记录只存 checklist_category，且保存时把模板 category（即下拉菜单选中的名称）落库；
 * 因此 category 本身就是唯一键，直接映射到模板文件。
 */
const TEMPLATE_BY_CATEGORY = {
    顺航检查单: "顺航检查单",
    货运始发航班: "货运始发航班",
    货运过站航班: "货运过站航班",
    客运始发航班: "客运始发航班",
    客运过站航班: "客运过站航班",
};

/**
 * 按记录/航班解析应加载的模板 id
 * 优先级：记录 header.template.category（与 dropdown 对齐的模板名）精确反查 → 客运默认 → 航班前缀规则
 * @param {Object} headerTemplate 记录 header.template（可能为空，旧数据）
 * @param {Object} flight 航班对象（提供 category / flightNo）
 * @returns {string} 模板 id（如 "货运始发航班"）
 */
export const resolveTemplateIdByRecord = (headerTemplate, flight) => {
    const category = headerTemplate?.category || flight?.category;
    if (category) {
        const id = TEMPLATE_BY_CATEGORY[category];
        if (id) return id;
    }
    // 旧数据/兜底：航班分类含"客运" → 客运始发；否则按航班号前缀规则（CSS → 顺航；其他 → 货运过站）
    if (String(category || "").includes("客运")) return "客运始发航班";
    const defaultBtn = TYPE_BY_LABEL[resolveDefaultType(flight?.flightNo)];
    return defaultBtn?.tplId || "货运过站航班";
};
