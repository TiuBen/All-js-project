/**
 * ============================================================
 * displayFields —— 对象字段 → 按表头设置的展示形态取值
 * ------------------------------------------------------------
 * 后端把名称类字段升级成了「对象携带变体」的形状（fipsService.nestVariants
 * 打包，三类：*_name / *_flight_no_full / *_flight_type_code）：
 *   d_name: {
 *     d_name:           "北京首都国际机场",
 *     d_name_english:   "Beijing Capital International Airport",
 *     d_name_iata_code: "PEK",
 *     d_name_icao_code: "ZBAA",
 *   }
 * 取值口径：**不是摊平保留全部变体**，而是按设置页列上的两组 radio
 * （english：中文/英文；icao：IATA/ICAO）从对象里挑出**一个值**写回原字段名，
 * 下游（表格 / 侧栏 / tooltip / 检查单）拿到的永远是字符串，对象不会漏进 React：
 *   english=false & icao=false → 中文（d_name 本值）
 *   english=true  & icao=false → 英文（d_name_english）
 *   english=false & icao=true  → IATA（d_name_iata_code）
 *   english=true  & icao=true  → ICAO（d_name_icao_code）
 *
 * 谁在用：store/fips.store.js（fetchFlights / fetchFlightRows 两个数据入口）、
 *         RawEcyilangTable（自拉 raw 行 + 受控模式喂进来的 changelog 快照）。
 * ============================================================
 */

/** 展示形态 → 依次尝试的子键后缀（'' = 原字段名本值；所选形态缺失时逐级回退） */
const VARIANT_SUFFIXES = {
    chinese: [""],
    english: ["_english", "_name_en", ""],
    iata: ["_iata_code", "_iata", ""],
    icao: ["_icao_code", "_icao", ""],
};

/** 嵌套字段在表头设置里对应的列 keyName 别名（按序找第一个配了开关的列） */
const FIELD_COLUMN_ALIASES = {
    a_name: ["dep_station", "origin_station", "a_name"], // 到港腿起飞机场
    d_name: ["arr_station", "dest_station", "d_name"], // 离港腿目的地机场
    a_flight_no_full: ["flight_no_full", "flight_no", "a_flight_no_full"],
    d_flight_no_full: ["flight_no_full", "flight_no", "d_flight_no_full"],
    a_flight_type_code: ["task", "a_flight_type_code"],
    d_flight_type_code: ["task", "d_flight_type_code"],
};

/**
 * 查某字段该用哪组展示开关：按 headers 顺序找第一个命中别名列的列，
 * 列上没配 english / icao 字段就按 false 算；都没命中 → 默认中文。
 * @param {string} field 嵌套字段名（如 a_name）
 * @param {Array<Object>} headers 参与查找的表头设置（ecyilang / all / dep / arr）
 */
function displayFlagOf(field, headers) {
    const aliases = FIELD_COLUMN_ALIASES[field] ?? [field];
    for (const header of headers) {
        const cols = header?.columns ?? [];
        for (const alias of aliases) {
            const col = cols.find((c) => c.keyName === alias);
            if (col) return { english: col.english === true, icao: col.icao === true };
        }
    }
    return { english: false, icao: false };
}

/**
 * 从一个「变体对象」里按展示形态挑出**一个字符串值**。
 * @param {Object} obj 后端打包的变体对象
 * @param {string} baseKey 原字段名（chinese 形态直接取它，其余取 baseKey + 后缀）
 * @param {{english:boolean, icao:boolean}} flag 该字段列上的展示开关
 */
function pickVariantValue(obj, baseKey, flag) {
    // 两个 radio 的四组组合 ↔ 四种展示形态
    const mode = flag.english ? (flag.icao ? "icao" : "english") : flag.icao ? "iata" : "chinese";

    // 任务性质对象的「中文」形态优先取中文名（后端补的 *_flight_type_name_cn =
    // full_cn → short_cn → short_en 逐级回退），拿不到再退代码本身；
    // 机场 / 航班号的「中文」就是原字段名本值，不受影响。
    const chineseSuffixes = /_flight_type_code$/.test(baseKey) ? ["_name_cn", ""] : VARIANT_SUFFIXES.chinese;
    const suffixes = mode === "chinese" ? chineseSuffixes : VARIANT_SUFFIXES[mode];

    // 变体键有两种拼法：直接追加（a_name + _english）；
    // 或后端把 _code 结尾的字段换中段（a_flight_type_code → a_flight_type_name_en）。
    const stems = [baseKey, baseKey.replace(/_code$/, "")];
    for (const suffix of suffixes) {
        for (const stem of suffix === "" ? [baseKey] : stems) {
            const v = obj[`${stem}${suffix}`];
            if (v !== null && v !== undefined && v !== "") return v;
        }
    }
    // 所选形态全空 → 退对象里第一个非空标量；再不行给空串（绝不把对象漏给 React）
    for (const v of Object.values(obj)) {
        if (v !== null && v !== undefined && v !== "" && typeof v !== "object") return v;
    }
    return "";
}

/**
 * 行级入口：凡是「纯对象」值的字段，按设置挑一个字符串写回原字段名。
 * 数组 / Date / null 原样保留；行里没有对象字段时原样返回，不多拷贝。
 * @param {Object} row 后端返回的一行（或 changelog 里的一份历史快照）
 * @param {Array<Object>} headers 参与开关查找的表头设置
 * @returns {Object} 取值后的行
 */
export function resolveObjectFields(row, headers = []) {
    if (!row || typeof row !== "object") return row;

    let out = null;
    // 搜索文本：把对象里的**全部变体值**拼起来（中文名 / 英文名 / IATA / ICAO / 航司名…）
    // —— 展示只挑一种，但搜索要能命中任意形态（英文模式下搜「无锡」也得搜得到）
    const searchParts = [];

    for (const [key, value] of Object.entries(row)) {
        if (!value || typeof value !== "object" || Array.isArray(value) || value instanceof Date) continue;

        for (const v of Object.values(value)) {
            if (v !== null && v !== undefined && v !== "" && typeof v !== "object") searchParts.push(String(v));
        }

        out = out ?? { ...row };
        out[key] = pickVariantValue(value, key, displayFlagOf(key, headers));
    }

    if (!out) return row;
    if (searchParts.length) out.__search = searchParts.join(" ");
    return out;
}
