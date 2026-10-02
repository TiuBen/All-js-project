/**
 * ============================================================
 * processTime —— 保障流程节点的时间工具（纯函数，无 React / 无 store）
 * ------------------------------------------------------------
 * 只处理「时分」这一种量：所有环节都发生在同一天之内，
 * 不引入日期，避免 dayjs 依赖与时区问题。
 *
 *   时间节点   "HH:mm"（也接受快捷输入 "1741" / "741"）
 *   间隔时长   与上一环节的分钟差，**跨零点自动按 +24h 处理**
 *               （例：23:55 → 00:39 = 44 分钟，与 Excel 里填的一致）
 *
 * ★ 约定：写成 "HH:mm" 字符串存进 store，不存分钟数 ——
 *   分钟数无法表达"没填"和"填了 00:00"的区别。
 * ============================================================
 */

/** 一天的分钟数 */
export const DAY_MINUTES = 24 * 60

/** 分钟数 → "HH:mm" */
export function fmtHHmm(minutes) {
    const m = ((Math.round(minutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
    return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

/**
 * 时间字符串 → 当日分钟数
 * @param {string} value "HH:mm" / "H:mm" / "1741" / "741"
 * @returns {number|null} 0~1439；空值或非法值返回 null
 */
export function parseHHmm(value) {
    const s = String(value ?? "").trim();
    if (!s) return null;
    const m = s.match(/^(\d{1,2}):?(\d{2})$/);
    if (!m) return null;
    const h = Number(m[1]);
    const mi = Number(m[2]);
    if (h > 23 || mi > 59) return null;
    return h * 60 + mi;
}

/**
 * 宽松输入 → 规范 "HH:mm"（输入框失焦时调用）
 *   "1741" → "17:41"    "741" → "07:41"    "7:5" → 保持原样（无法判断）
 * @param {string} value
 * @returns {string} 规范化结果；无法解析时原样返回（交给用户改）
 */
export function normalizeHHmm(value) {
    const s = String(value ?? "").trim();
    if (!s) return "";
    if (/^\d{3,4}$/.test(s)) {
        const mi = s.slice(-2);
        const h = s.slice(0, s.length - 2);
        const num = Number(mi);
        if (num <= 59 && Number(h) <= 23) return `${String(Number(h)).padStart(2, "0")}:${mi}`;
        return s;
    }
    const parsed = parseHHmm(s);
    return parsed == null ? s : fmtHHmm(parsed);
}

/** 间隔超过这个分钟数就认为填错了（12 小时）——避免跨零点计算被误用 */
const MAX_SANE_GAP = 12 * 60;

/**
 * 与上一环节的间隔时长（分钟）
 * @param {string} prevValue 上一环节时间节点
 * @param {string} value     本环节时间节点
 * @returns {number|null} 分钟数；任一端没填/非法，或结果不合常理（>12h）时返回 null
 */
export function gapMinutes(prevValue, value) {
    const a = parseHHmm(prevValue);
    const b = parseHHmm(value);
    if (a == null || b == null) return null;
    const d = b - a;
    if (d >= 0) return d;
    const wrapped = d + DAY_MINUTES; // 跨零点
    return wrapped <= MAX_SANE_GAP ? wrapped : null;
}

/**
 * 总时长（分钟）：末环节 - 首环节，同样支持跨零点
 * @param {string} startValue
 * @param {string} endValue
 */
export function totalMinutes(startValue, endValue) {
    return gapMinutes(startValue, endValue);
}
