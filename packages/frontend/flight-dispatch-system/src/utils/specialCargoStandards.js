/**
 * ============================================================
 * specialCargoStandards —— 生鲜货物「卸机作业时长」标准（纯函数，无 React）
 * ------------------------------------------------------------
 * 来源：pages/SpecialPage/components/ProcessNode.png 下半张表
 *   指标名称：卸机作业（适用于进出港均满载的情况）
 *   标准：B747/A330 80 分钟 · B777 80 · B767 75 · B757 50 · B737 40
 *   责任单位：空港地服公司
 *
 * ★ 数值与后端模板 `data/checklists/节点保障/货运过站航班.json` 的
 *   parameters[UNLOAD_TIME] 完全一致（B747:80 / B777:80 / B767:75 /
 *   B757:50 / B737:40）。落一份前端常量是为了展示不依赖接口；
 *   标准若调整，两处都要改（或将本表改为从模板参数表读取）。
 *
 * 谁在用（改这里就够了，别在别处再手写一遍映射）：
 *   ProcessNode / SpecialPage ← unloadStandardText（卡片表头「卸机时长标准 XX」）
 *   config/specialSpec.js     ← unloadStandardMinutes（卸货结束环节的间隔达标判定）
 *
 * ★ 数据里的机型是 4 位代码（B744 / B77L / B763 / B752 / B733 …），
 *   标准表按系列给（B747 / B777 / …），因此用 prefixes 做前缀归并。
 * ============================================================
 */

/** 货物保障标准表（PNG 下半张表；rows 顺序 = 展示顺序） */
export const CARGO_STANDARDS = {
    title: "货物保障",
    indicator: "卸机作业（适用于进出港均满载的情况）",
    unit: "空港地服公司",
    rows: [
        { aircraft: "B747/A330", minutes: 80, prefixes: ["B74", "A33"] },
        { aircraft: "B777", minutes: 80, prefixes: ["B77"] },
        { aircraft: "B767", minutes: 75, prefixes: ["B76"] },
        { aircraft: "B757", minutes: 50, prefixes: ["B75"] },
        { aircraft: "B737", minutes: 40, prefixes: ["B73"] },
    ],
};

/** 卸机作业这个指标的展示名（表头文案用，避免各处硬编码字符串） */
export const UNLOAD_STANDARD_LABEL = "卸机时长标准";

/**
 * 机型 → 命中的标准行。
 * 机型先规整（大写、去掉非字母数字），再按 prefixes 前缀匹配。
 * @param {string} aircraftType 机型代码，如 'B77L' / 'b77l' / 'B777-200F'
 * @returns {Object|null} CARGO_STANDARDS.rows 的一项；不在标准表内返回 null
 */
export function cargoStandardRowOf(aircraftType) {
    const t = String(aircraftType || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
    if (!t) return null;
    return CARGO_STANDARDS.rows.find((r) => r.prefixes.some((p) => t.startsWith(p))) || null;
}

/**
 * 机型 → 卸机作业标准时长（分钟）。
 * @param {string} aircraftType
 * @returns {number|null} 标准分钟数；机型不在标准表内返回 null
 */
export function unloadStandardMinutes(aircraftType) {
    const row = cargoStandardRowOf(aircraftType);
    return row ? row.minutes : null;
}

/**
 * 机型 → 卸机作业标准时长的展示文案（卡片表头直接用）。
 * @param {string} aircraftType
 * @returns {string} 命中返回 '80 分钟'；未命中返回 ''（由调用方决定怎么显示）
 */
export function unloadStandardText(aircraftType) {
    const minutes = unloadStandardMinutes(aircraftType);
    return minutes == null ? "" : `${minutes} 分钟`;
}

/**
 * 机型 → 悬停说明（讲清标准出处与适用条件）。
 * @param {string} aircraftType
 * @returns {string}
 */
export function unloadStandardHint(aircraftType) {
    const row = cargoStandardRowOf(aircraftType);
    if (!row) return "机型未收录卸机作业标准（标准表仅含 B747/A330、B777、B767、B757、B737）";
    return `卸机作业标准 ${row.minutes} 分钟（按 ${
        row.aircraft
    } 系列，适用于进出港均满载的情况；责任单位：${CARGO_STANDARDS.unit}）`;
}

export default CARGO_STANDARDS;
