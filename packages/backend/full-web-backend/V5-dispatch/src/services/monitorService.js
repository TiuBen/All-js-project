/**
 * ============================================================
 * 航班监控 —— 每日 00:01 灌当日计划进 ecyilang → 定时增量比对
 * ------------------------------------------------------------
 * 【流程（用户定的）】
 *   ① 每天 00:01：从远程拉一次**当天的航班计划** → 转换后**灌进 ecyilang 表**
 *      （先删当天旧行再插，口径与 db_seed 的按天覆盖一致），同时算出总条数。
 *      灌完在内存里建基线 map：hash(flightReadableId) → 行。
 *   ② 之后每隔 N 分钟拉一次，**先数个数**，按 flightReadableId 逐条对：
 *        - 本轮有、map 没有 → **新增**：转换后插入 ecyilang → 通知「新的航班计划」
 *        - map 有、本轮没有 → **减少**：从 ecyilang 删掉该行 → 通知「航班减少」（点名哪班）
 *        - 两边都有        → 逐字段比属性，变了 → **变更**：
 *             新值写进 ecyilang 对应列 + 追加到该行的 changelog
 *             → 通知「航班变更」（带新旧值）
 *      map 同步滚动更新（新增 / 删减都会改 map）。
 *   ③ 服务重启：从 ecyilang 按**当天日期**读出行 → 重建 map → 继续比对
 *      （不重新拉远程，避免重启瞬间制造一波假差异）。
 *   ④ 有变化 → SSE 推给前端（带上具体更新内容），同时留最近 200 条在内存
 *      供前端重连后 GET /api/monitor/events 一次拉齐。
 *
 * 【flightReadableId（用户核过的组合，实测 18 份快照 / 1074 行单份内部 100% 唯一、0 空键）】
 *   a_flight_date | a_flight_no_full | a_name | d_flight_date | d_flight_no_full | d_name
 *   日期只取 YYYY-MM-DD。★ 两个 *_flight_type_code **刻意不进键**：
 *   实测它们会从空补成 H/Z（15:28→15:56 有 6 行，行号 51/52/53/62/69/70），
 *   进键会把同一航班拆成「一减一增」；不进键时它们就是普通属性，
 *   补全动作会以「变更通知」的形式报出来，语义正好。
 *
 * 【比对口径（为什么 map 里存的不是原始 JSON）】
 *   库里的时间列是 Date（'05:00(+1)' + 基准日期 → 绝对时间），原始 JSON 是 'HH:mm' 字符串。
 *   两种口径直接比会永远不相等。所以 map 里每行存的是**归一化值**：
 *     时间字段 → toDateTime(本侧日期, 值).toISOString()；文本字段 → 字符串。
 *   重启从库重建时，Date.toISOString() 得到完全相同的口径。
 *   changelog / 通知里给人看的值再转回 'YYYY-MM-DD HH:mm'。
 *
 * 【两道防误报（不能删）】
 *   本轮拉到 0 条 / 比上一轮少超阈值 → 跳过本轮。不设防的话接口挂一次
 *   会把当天所有航班一次性报成「减少」并把它们从 ecyilang 里删掉。
 *
 * 节奏配置在 config/index.js 的 config.monitor（.env 可改）。
 * ============================================================
 */
import { createHash } from 'node:crypto';
import { prisma, jsonValue } from '../db/prisma.js';
import { config } from '../config/index.js';
import { normalizeDay, wallDay, wallMinute, cnDateTime, cnMinute, todayCn } from '../utils/date.js';
import { badRequest } from '../utils/http.js';
// 复用 db_seed 的「原始行 → 插入对象」换算（时区口径 / 跨天后缀 / 机场码回填），勿抄两份
import { toEcyilangRow, toDateTime, toText, airportMapOf, newStats } from '../../db_seed/ecyilangRow.js';

/* ==================== 日志（统一时间前缀 YYYY-MM-DD HH:mm） ==================== */

/** 所有监控输出都走这里：[2026-10-15 19:08] 消息 —— 用户要求日志带北京时间前缀 */
/** 日志级别（error < warn < info）：生产设 LOG_LEVEL=warn 就只留 warn/error，静默掉每轮汇总 */
const LEVELS = { error: 0, warn: 1, info: 2 };
const enabled = (lvl) => LEVELS[lvl] <= LEVELS[config.logLevel];
const log = (msg) => { if (enabled('info')) console.log(`[${cnMinute(new Date())}] ${msg}`); };
const warn = (msg) => { if (enabled('warn')) console.warn(`[${cnMinute(new Date())}] ${msg}`); };
const error = (msg) => { if (enabled('error')) console.error(`[${cnMinute(new Date())}] ${msg}`); };

/* ==================== 一、flightReadableId 与 hash ==================== */

/**
 * 取日期部分：'2026-10-14T08:00:00' / Date → '2026-10-14'；空 → ''
 * ★ 远程行给的是字符串、库行给的是 Date —— 两种都要能算出同一个 'YYYY-MM-DD'，
 *   否则重建 map 后 hash 全对不上，整批航班会被误判成「新增」。
 */
const dayOf = (v) => {
    if (v === null || v === undefined || v === '') return '';
    if (v instanceof Date) return wallDay(v) || '';
    return normalizeDay(v) || '';
};
/** 取文本部分：null / undefined / 空白 → ''（键里用空串占位，保证字段数固定） */
const textOf = (v) => (v === null || v === undefined ? '' : String(v).trim());

/**
 * 航班可读唯一键（6 字段，见文件头）
 * @param {Object} row 远程原始行 **或** ecyilang 库行（日期列两种形态都认）
 */
export function flightReadableIdOf(row) {
    return [
        dayOf(row?.a_flight_date),
        textOf(row?.a_flight_no_full),
        textOf(row?.a_name),
        dayOf(row?.d_flight_date),
        textOf(row?.d_flight_no_full),
        textOf(row?.d_name),
    ].join('|');
}

/** flightReadableId → 内存 map 的 key（sha1，避开键里各种字符的转义问题） */
export const hashOf = (readableId) => createHash('sha1').update(readableId).digest('hex');

/** 一行归属哪一天（跨天行取离港侧；两腿同天时随便取哪侧都对） */
export function dayOfRow(row) {
    return dayOf(row?.d_flight_date) || dayOf(row?.a_flight_date);
}

/* ==================== 二、比对口径 ==================== */

/**
 * 要监控的属性（flightReadableId 的 6 个字段之外的全部业务字段）
 * ★ *_flight_no_full / *_name / *_flight_date 都在键里 —— 键换了 = 另一行，
 *   会以「一减一增」的形式报出来，不进这里。
 */
export const WATCH_FIELDS = [
    'd_flight_type_code', 'd_plan_time', 'd_time', 'd_jx',
    'd_country_type', 'd_craft_seat_code', 'd_state_name', 'd_abnormal_state',
    'a_flight_type_code', 'a_plan_time', 'a_time', 'a_jx',
    'a_country_type', 'a_craft_seat_code', 'a_state_name', 'a_abnormal_state',
    'k_h',
];

/** 时间类字段：写库要走 toDateTime（'HH:mm' + 基准日期 → Date），比对用 toISOString */
export const TIME_FIELDS = new Set(['d_plan_time', 'd_time', 'a_plan_time', 'a_time']);
/** 时间字段的日期基准（与 ecyilangRow.js 的 TIME_COLUMNS / FALLBACK_DATE 同一口径） */
const TIME_BASE = {
    d_plan_time: ['d_flight_date', 'a_flight_date'],
    d_time: ['d_flight_date', 'a_flight_date'],
    a_plan_time: ['a_flight_date', 'd_flight_date'],
    a_time: ['a_flight_date', 'd_flight_date'],
};

/** 该字段在原始行里的日期基准（本侧为空退对侧，跨天后缀靠它定位） */
export function baseDayOf(rawRow, field) {
    const [own, other] = TIME_BASE[field];
    return dayOf(rawRow?.[own]) || dayOf(rawRow?.[other]) || '';
}

/**
 * 原始行 → 比对口径（每个监控字段一个可比字符串）
 *   时间字段：'HH:mm(+n)' + 基准日期 → Date → ISO 字符串（库行也是这个口径）
 *   文本字段：trim（'' → null）
 * @returns {Object} { field: string|null }
 */
export function normOfRow(rawRow) {
    const norm = {};
    for (const field of WATCH_FIELDS) {
        if (TIME_FIELDS.has(field)) {
            const dt = toDateTime(baseDayOf(rawRow, field), rawRow?.[field]);
            norm[field] = dt ? dt.toISOString() : null;
        } else {
            norm[field] = toText(rawRow?.[field]);
        }
    }
    return norm;
}

/**
 * ecyilang 库行 → 比对口径（重启重建 map 用；与 normOfRow 完全同口径）
 * 库里的时间列本来就是 toDateTime 存进去的 Date，直接 toISOString。
 */
export function normOfDbRow(dbRow) {
    const norm = {};
    for (const field of WATCH_FIELDS) {
        const v = dbRow?.[field];
        norm[field] = TIME_FIELDS.has(field)
            ? (v ? new Date(v).toISOString() : null)
            : toText(v);
    }
    return norm;
}

/** 比对口径值 → 人看的展示值（时间 'YYYY-MM-DD HH:mm'，文本原样） */
export function displayValue(field, value) {
    if (value === null || value === undefined) return null;
    if (TIME_FIELDS.has(field)) return wallMinute(value);
    return String(value);
}

/** 逐字段比对，返回 { field: {old, new} }（old/new 是比对口径值） */
export function fieldDiff(oldNorm, newNorm) {
    const changes = {};
    for (const field of WATCH_FIELDS) {
        if (oldNorm?.[field] !== newNorm?.[field]) {
            changes[field] = { old: oldNorm?.[field] ?? null, new: newNorm?.[field] ?? null };
        }
    }
    return changes;
}

/** 字段名 → 中文（通知里没人想看 d_abnormal_state） */
const FIELD_LABELS = {
    d_flight_type_code: '离港任务性质', d_plan_time: '离港计划起飞', d_time: '离港时间',
    d_jx: '离港机型', d_country_type: '离港类型', d_craft_seat_code: '离港座位',
    d_state_name: '离港状态', d_abnormal_state: '离港异常',
    a_flight_type_code: '进港任务性质', a_plan_time: '前方计划起飞', a_time: '进港时间',
    a_jx: '进港机型', a_country_type: '进港类型', a_craft_seat_code: '进港座位',
    a_state_name: '进港状态', a_abnormal_state: '进港异常',
    k_h: '客货标识',
};
export const labelOfField = (field) => FIELD_LABELS[field] || field;

/** 一行里人看的航班标识：BK3064 深圳→天津 15:50 */
export function labelOfRow(row) {
    const no = textOf(row?.d_flight_no_full) || textOf(row?.a_flight_no_full) || '(无航班号)';
    const from = textOf(row?.a_name) || '?';
    const to = textOf(row?.d_name) || '?';
    const time = textOf(row?.d_plan_time) || textOf(row?.a_plan_time);
    return `${no} ${from}→${to}${time ? ' ' + time : ''}`;
}

/* ==================== 三、拉远程 ==================== */

/**
 * 拉远程用的请求头 —— 照浏览器成功访问该接口的标头抄的（用户实测）：
 *   有些网关会校验 User-Agent / 直接掐掉无 UA 的客户端，带上保险；
 *   Host / Proxy-Connection / Cache-Control 那些是浏览器/代理行为，程序里不需要。
 */
const REQUEST_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9',
};

/**
 * 拉一批远程数据。拉不到抛错由调用方接住 —— 保留基线，绝不清空。
 * ★ 失败自动重试：MONITOR_RETRY_COUNT 次（默认 2，总尝试 3 次），间隔 MONITOR_RETRY_DELAY_MS。
 *   ⚠️ 每次尝试**独立**的 AbortController + 超时：共享一个 signal 的话，
 *   第一次超时 abort 之后，后面所有重试都会拿着已 abort 的 signal 立刻失败，重试等于没重试。
 */
export async function fetchRemote() {
    const { url, timeoutMs, retryCount, retryDelayMs } = config.monitor;
    let lastError = null;

    for (let attempt = 1; attempt <= 1 + retryCount; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const res = await fetch(url, { signal: controller.signal, headers: REQUEST_HEADERS });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const body = await res.json();
            const rows = body?.data ?? body?.rows ?? body;
            if (!Array.isArray(rows)) throw new Error('返回结构里没有数组（期望 data）');
            if (attempt > 1) log(`重试第 ${attempt - 1} 次成功：拉到 ${rows.length} 条`);
            return rows;
        } catch (err) {
            lastError = err;
            const reason =
                err?.name === 'AbortError'
                    ? `超时（${timeoutMs}ms）`
                    : err?.code || err?.errno || err?.message || String(err);
            warn(`拉远程第 ${attempt}/${1 + retryCount} 次失败：${reason}（URL: ${url}）`);
            if (attempt <= retryCount) await new Promise((r) => setTimeout(r, retryDelayMs));
        } finally {
            clearTimeout(timer);
        }
    }
    throw lastError;
}

/* ==================== 四、运行态（内存 map + SSE） ==================== */

const state = {
    /** 比对基准：hash → { readableId, uuid, label, norm }（基线 = 00:01 灌库后的样子，滚动更新） */
    map: new Map(),
    /** 基线归属日 */
    day: null,
    /** 00:01 建基线时的总条数（重启后 = 重建 map 时的条数） */
    totalBase: 0,
    /** 基线建好 / 上次重建的时间与来源 */
    builtAt: null,
    builtFrom: null, // 'remote' 拉远程灌库 | 'db' 从库重建
    timer: null,
    planTimer: null,
    running: false,
    lastStartedAt: null,
    lastFinishedAt: null,
    lastError: null,
    lastCounts: null,
    /** 最近 200 条通知（SSE 是实时的，这里是给前端重连后一次拉齐用的） */
    events: [],
    /** SSE 订阅者（Express res 对象） */
    sseClients: new Set(),
};

/** 构造一条通知事件：入内存环形缓冲 + 推给所有 SSE 订阅者 */
function emit(event) {
    const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, at: cnDateTime(new Date()), ...event };
    state.events.unshift(item);
    if (state.events.length > 200) state.events.length = 200;
    const payload = `data: ${JSON.stringify(item)}\n\n`;
    for (const res of state.sseClients) {
        try { res.write(payload); } catch { /* 客户端断开会在 close 里清理 */ }
    }
    return item;
}

/* ==================== 五、写库 ==================== */

/** 'YYYY-MM-DD' → ecyilang 日期列的 Date 边界（无时区 date，与 parseWallDay 同口径） */
function dayBound(day) {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
}

/** 机场码表（中文名 → iata/icao），与 db_seed 导入共用一份口径 */
async function airportMap() {
    const rows = await prisma.airport_name_code.findMany({
        select: { chinese_airport_name: true, airport_iata_code: true, airport_icao_code: true },
    });
    return airportMapOf(rows);
}

/**
 * 原始行 → ecyilang 插入对象（带 flight_readable_id 与空 changelog）
 * ★ 导出给 db_seed/replayEcyilangSnapshots.js 复用 —— 回放脚本灌库必须与监控同口径，
 *   两处各写一份迟早漂移。
 */
export function toDbRow(raw, airports) {
    const row = toEcyilangRow(raw, airports, newStats());
    row.flight_readable_id = flightReadableIdOf(raw);
    row.changelog = [];
    return row;
}

/* ==================== 六、每日 00:01 建基线 ==================== */

/**
 * 建当天基线：拉远程 → 灌 ecyilang（先删当天旧行再插）→ 重建内存 map
 * ★ 幂等：重复调用 = 重灌当天（00:01 的语义就是「当天的计划以这次拉到的为准」）。
 * ★ 与 runOnce 互斥：00:01 时 loopDaily 和 loopEach 可能同时触发，
 *   两边并发删/插当天会撞唯一约束 —— 正在比对时这里直接跳过
 *   （没建成也不要紧，runOnce 的跨天兜底会在下一轮补建）。
 * @param {Object} [options] { rows } 离线喂样本用
 * @returns {Promise<{day, total, from, removedOld}|{skipped:true}>}
 */
export async function buildBaseline({ rows } = {}) {
    if (state.running) return { skipped: true, reason: '比对正在进行，跳过本轮建基线（runOnce 的跨天兜底会补建）' };
    state.running = true;
    try {
        return await doBuildBaseline({ rows });
    } finally {
        state.running = false;
    }
}

async function doBuildBaseline({ rows } = {}) {
    const day = todayCn();
    const data = rows ?? (await fetchRemote());
    const todayRows = data.filter((r) => dayOfRow(r) === day);
    // 🔴 当天 0 条绝不灌库：八成是接口异常/计划还没生成，把库清空才是真灾难
    if (!todayRows.length) {
        throw badRequest(`远程没有 ${day} 的航班数据（共 ${data.length} 行），已中止灌库`);
    }

    const airports = await airportMap();
    const bound = dayBound(day);

    // 按天覆盖（与 db_seed / addNewEcyilangToDb 同口径）：先删当天旧行，再插全部
    // ⚠️ 子表外键 ON DELETE SET NULL —— 删掉的行如果挂着检查单/生鲜台账，关联会被清空，
    //   这是「每日重灌计划」模式的固有行为（与手动重导快照一致）。
    const removed = await prisma.ecyilang.deleteMany({
        where: { OR: [{ d_flight_date: bound }, { a_flight_date: bound }] },
    });
    await prisma.ecyilang.createMany({ data: todayRows.map((raw) => toDbRow(raw, airports)) });

    const rebuilt = await rebuildFromDb({ day });
    log(`${day} 基线已建：${rebuilt.total} 条（删旧行 ${removed.count}，来源：${rows ? '离线样本' : '远程'}）`);
    emit({
        type: 'baseline',
        day,
        total: rebuilt.total,
        removedOld: removed.count,
        from: rows ? 'offline' : 'remote',
    });
    return { day, total: rebuilt.total, from: rows ? 'offline' : 'remote', removedOld: removed.count };
}

/**
 * 从 ecyilang 重建内存 map（服务重启 / 建完基线后调）
 * ★ 只读库、不碰远程 —— 重启瞬间不制造任何「变化」。
 * ★ 当天的判定用**成员口径**（d = day，或 d 为空且 a = day），与 dayOfRow 一致 ——
 *   不能用宽口径 OR[d=day, a=day]：那会把**昨天**的跨天进港行（d=昨天、a=今天）
 *   也算进今天的 map，重启后第一轮比对就会把它们误报「减少」并从库里删掉。
 */
export async function rebuildFromDb({ day } = {}) {
    const monitorDay = normalizeDay(day) || todayCn();
    const bound = dayBound(monitorDay);
    const rows = await prisma.ecyilang.findMany({
        where: {
            OR: [{ d_flight_date: bound }, { d_flight_date: null, a_flight_date: bound }],
            flight_readable_id: { not: null },
        },
    });

    const map = new Map();
    for (const row of rows) {
        const readableId = flightReadableIdOf(row);
        map.set(hashOf(readableId), {
            readableId,
            uuid: row.id,
            label: labelOfRow(row),
            norm: normOfDbRow(row),
        });
    }
    state.map = map;
    state.day = monitorDay;
    state.totalBase = map.size;
    state.builtAt = cnDateTime(new Date());
    state.builtFrom = 'db';
    return { day: monitorDay, total: map.size };
}

/**
 * 启动时确保当天基线就位：
 *   库里当天有数据（今天 00:01 已经灌过）→ 只从库重建 map；
 *   库里当天没数据（服务在 00:01 前首次启动 / 昨天夜里挂了）→ 拉远程补建。
 */
export async function ensureBaseline() {
    const day = todayCn();
    const bound = dayBound(day);
    // ★ 成员口径（与 rebuildFromDb / dayOfRow 一致）：d = day，或 d 为空且 a = day。
    //   不能用宽口径 OR[d=day, a=day] —— 昨天的跨天进港行（d=昨天、a=今天）会把它
    //   误判成「今天已灌过」，于是只拿那几行重建 map，第一轮比对把当天几十班
    //   全部误报「新增」。程序隔天中午才启动时最容易踩中。
    const count = await prisma.ecyilang.count({
        where: { OR: [{ d_flight_date: bound }, { d_flight_date: null, a_flight_date: bound }] },
    });
    if (count > 0) {
        const r = await rebuildFromDb({ day });
        log(`从 ecyilang 重建 ${day} 基线：${r.total} 条`);
        return { ...r, from: 'db' };
    }
    const r = await buildBaseline();
    return { day: r.day, total: r.total, from: 'remote' };
}

/* ==================== 七、定时比对主流程 ==================== */

/**
 * 跑一轮比对（先数个数 → 按 flightReadableId 查 → 新增 / 减少 / 变更）
 * @param {Object} [options]
 * @param {Array<Object>} [options.rows] 直接喂数据（离线验证用；不给就拉远程）
 * @returns {Promise<Object>} 本轮统计
 */
export async function runOnce({ rows } = {}) {
    if (state.running) return { skipped: true, reason: '上一轮还没结束' };
    // 🔴 基线为空的兜底：如果 00:01 那次远程接口恰好挂了（buildBaseline 抛错），
    //   map 就是空的 —— 不兜底的话每 15 分钟都空转，当天监控瘫痪一整天。
    //   这里当场补建（库里有当天数据 → 只重建 map；没有 → 拉远程灌库）。
    if (!state.map.size) {
        await ensureBaseline();
        if (!state.map.size) return { skipped: true, reason: '基线补建失败（远程没有当天数据）' };
    }
    state.running = true;
    state.lastStartedAt = cnDateTime(new Date());

    try {
        let fetchedOk = false; // 区分「拉取失败」和「拉到了但落库失败」—— 错误日志的头一句话不同
        const data = rows ?? (await fetchRemote());
        fetchedOk = true;
        const today = todayCn();

        /**
         * 🔴 跨天兜底：map 的日期不是今天 = 00:01 的重灌没成功（接口挂了 / 被互斥跳过）。
         * 这时绝不能拿昨天的 map 比今天的数据 —— 今天全部会误报「新增」、
         * 昨天的航班全部误报「减少」并被从库里删掉（断崖保护拦不住：条数差不多）。
         * 处理：用本轮数据直接建今天基线，本轮不发差异通知。
         */
        if (state.day !== today) {
            const built = await doBuildBaseline({ rows: data });
            const counts = {
                day: today,
                newDayBaseline: true,
                totalBase: built.total,
                totalNow: built.total,
                added: 0, changed: 0, removed: 0,
                note: `跨天（原基线 ${state.day ?? '无'}）：已直接以本轮数据建立 ${today} 基线 ${built.total} 条，本轮不比对`,
            };
            state.lastCounts = counts;
            state.lastFinishedAt = cnDateTime(new Date());
            log(counts.note);
            return counts;
        }

        const day = state.day;
        const todayRows = data.filter((r) => dayOfRow(r) === day);

        /* ---------- 数个数 + 两道防误报 ---------- */
        if (!todayRows.length) {
            const counts = {
                day, fetched: data.length, totalNow: 0, totalBase: state.totalBase,
                added: 0, changed: 0, removed: 0, events: 0, emptySkipped: true,
                note: `本轮没有 ${day} 的航班，疑似接口异常，已跳过（map 与 ecyilang 都不动）`,
            };
            state.lastCounts = counts;
            warn(counts.note);
            return counts;
        }
        const lostRatio = 1 - todayRows.length / Math.max(state.map.size, 1);
        if (state.map.size >= 5 && lostRatio > config.monitor.dropRatioLimit) {
            const counts = {
                day, fetched: data.length, totalNow: todayRows.length, totalBase: state.totalBase,
                added: 0, changed: 0, removed: 0, events: 0, dropSkipped: true,
                note: `本轮 ${todayRows.length} 条 / 基线 ${state.map.size} 条，少了 ${Math.round(lostRatio * 100)}%` +
                    `（超过阈值 ${Math.round(config.monitor.dropRatioLimit * 100)}%），疑似数据源异常，已跳过本轮`,
            };
            state.lastCounts = counts;
            warn(counts.note);
            return counts;
        }

        /* ---------- 本轮的 map：hash → { readableId, norm, raw } ---------- */
        const incoming = new Map();
        for (const raw of todayRows) {
            const readableId = flightReadableIdOf(raw);
            incoming.set(hashOf(readableId), { readableId, norm: normOfRow(raw), raw });
        }

        const added = [];
        const removedRows = [];
        const changed = [];

        /* ---------- ① 新增：本轮有、map 没有 → 插 ecyilang ---------- */
        const newOnes = [...incoming.entries()].filter(([hash]) => !state.map.has(hash));
        if (newOnes.length) {
            const airports = await airportMap();
            for (const [, item] of newOnes) {
                const created = await prisma.ecyilang.create({
                    data: toDbRow(item.raw, airports),
                    select: { id: true },
                });
                const entry = {
                    readableId: item.readableId,
                    uuid: created.id,
                    label: labelOfRow(item.raw),
                    norm: item.norm,
                };
                state.map.set(hashOf(item.readableId), entry);
                added.push({ label: entry.label, uuid: created.id, flightReadableId: item.readableId, payload: item.raw });
            }
        }

        /* ---------- ② 减少：map 有、本轮没有 → 从 ecyilang 删掉 ---------- */
        const goneHashes = [...state.map.keys()].filter((hash) => !incoming.has(hash));
        if (goneHashes.length) {
            const goneEntries = goneHashes.map((hash) => state.map.get(hash));
            const gone = await prisma.ecyilang.deleteMany({
                where: { flight_readable_id: { in: goneEntries.map((e) => e.readableId) } },
            });
            for (const entry of goneEntries) {
                state.map.delete(hashOf(entry.readableId));
                removedRows.push({ label: entry.label, uuid: entry.uuid, flightReadableId: entry.readableId });
            }
            if (gone.count !== goneEntries.length) {
                warn(`减少清理：预期删 ${goneEntries.length} 行，实际删 ${gone.count} 行（差值多半是 readable_id 为空的历史手动导入行）`);
            }
        }

        /* ---------- ③ 变更：两边都有 → 比属性 → 写新值 + 追加 changelog ---------- */
        for (const [hash, item] of incoming) {
            const old = state.map.get(hash);
            if (!old) continue; // 刚插过的新行，下一轮才开始比
            const changes = fieldDiff(old.norm, item.norm);
            if (!Object.keys(changes).length) continue;

            // changelog 追加（旧数组来自库里的该行）
            // ★ 用户定的口径：**不记字段级 diff，直接把整条快照存进去**（调试时能直接看
            //   当时的原始数据，字段值一目了然）。字段级 diff 只用于判断「有没有变」和通知。
            const dbRow = await prisma.ecyilang.findUnique({
                where: { id: old.uuid },
                select: { changelog: true },
            });
            const now = cnDateTime(new Date());
            const log = [...(dbRow?.changelog ?? []), { updateTime: now, snapshot: item.raw }];

            // 新值写进对应列（时间字段要走 toDateTime 换成 Date，口径与导入一致）
            const patch = {};
            for (const field of Object.keys(changes)) {
                patch[field] = TIME_FIELDS.has(field)
                    ? toDateTime(baseDayOf(item.raw, field), item.raw[field])
                    : toText(item.raw[field]);
            }
            await prisma.ecyilang.update({
                where: { id: old.uuid },
                data: { ...patch, changelog: jsonValue(log) },
                select: { id: true },
            });

            state.map.set(hash, { ...old, norm: item.norm, label: labelOfRow(item.raw) });
            changed.push({
                label: labelOfRow(item.raw),
                uuid: old.uuid,
                flightReadableId: item.readableId,
                // 通知里仍带字段级新旧值（SSE / events 用）；changelog 只存整条快照
                changes: Object.entries(changes).map(([field, v]) => ({
                    field,
                    fieldLabel: labelOfField(field),
                    oldValue: displayValue(field, v.old),
                    newValue: displayValue(field, v.new),
                })),
            });
        }

        /* ---------- 汇总 + 通知 ---------- */
        const counts = {
            day,
            fetched: data.length,
            totalNow: state.map.size,
            totalBase: state.totalBase,
            diff: state.map.size - state.totalBase,
            added: added.length,
            changed: changed.length,
            removed: removedRows.length,
        };
        state.lastCounts = counts;
        state.lastError = null;
        state.lastFinishedAt = cnDateTime(new Date());

        // ★ 每轮必打的汇总日志（成功 / 变化条数），不管有没有差异
        log(`从网址成功获取 ${counts.fetched} 条：新增 ${counts.added}、变更 ${counts.changed}、减少 ${counts.removed}` +
            `（本轮 ${counts.totalNow} / 基线 ${counts.totalBase}）`);

        if (added.length || removedRows.length || changed.length) {
            const event = emit({
                type: 'diff',
                day,
                totals: { now: counts.totalNow, base: counts.totalBase, diff: counts.diff },
                added,
                removed: removedRows,
                changed,
            });
            counts.eventId = event.id;
        }
        return counts;
    } catch (err) {
        // ★ 用户要求失败也要有日志：拉不到 / 落库失败都打出来（本轮基线保持不动）
        //   带 err.code / err.errno / err.syscall，方便排查 DNS / 网络 / 连接被拒这类问题
        const code = err?.code || err?.errno || err?.syscall || '';
        const head = fetchedOk ? '本轮比对失败' : '从网址获取数据失败';
        error(`${head}：${err.message}${code ? ` (${code})` : ''}（本轮跳过，基线保持不动）`);
        state.lastError = err.message;
        state.lastFinishedAt = cnDateTime(new Date());
        throw err;
    } finally {
        state.running = false;
    }
}

/* ==================== 八、定时调度 ==================== */

/** 定时比对：递归 setTimeout（拉取+写库要几秒，setInterval 会叠加） */
function loopEach(ms, task) {
    const tick = async () => {
        try {
            await task();
        } catch (err) {
            error(`${task.name} 失败：${err.message}`);
        }
        state.timer = setTimeout(tick, ms);
    };
    tick();
}

/**
 * 每日基线任务：排到下一个 00:01 再跑，跑完重算下一天 ——
 * ★ 启动**不立即跑**：启动时刻的基线由 ensureBaseline() 负责（优先从库重建），
 *   这里只管「每天 00:01 重灌当天」。固定 24h 排期会随任务耗时逐渐漂移，
 *   所以每次跑完都重算「到下一个 00:01 还差多久」。
 */
function loopDaily(task) {
    const schedule = () => {
        const now = new Date();
        const next = new Date(now);
        next.setHours(config.monitor.planHour, config.monitor.planMinute, 0, 0);
        if (next <= now) next.setDate(next.getDate() + 1);
        state.planTimer = setTimeout(async () => {
            try {
                await task();
            } catch (err) {
                error(`${task.name} 失败：${err.message}`);
            }
            schedule();
        }, next - now);
    };
    schedule();
}

/** 启动：先确保当天基线（从库重建或补建）→ 起两个定时器（00:01 重灌 / 每 N 分钟比对） */
export async function start() {
    if (state.timer || state.planTimer) return;
    if (!config.monitor.enabled) {
        log('监控已关闭（MONITOR_ENABLED=false），不自动跑');
        return;
    }

    // 基线就位（库里有当天数据 → 只重建 map；没有 → 拉远程补建）
    await ensureBaseline().catch((err) =>
        error(`启动建基线失败（下一轮比对会自动兜底补建）：${err.message}`)
    );

    // 00:01 的重灌任务
    loopDaily(function dailyBaseline() {
        return buildBaseline();
    });

    // 定时比对
    loopEach(config.monitor.intervalMinutes * 60 * 1000, runOnce);

    log(`监控已启动：每天 ${config.monitorPlanTime} 灌当日计划进 ecyilang，每 ${config.monitor.intervalMinutes} 分钟比对一次`);
}

/** 停掉定时器（关服务时调） */
export function stop() {
    if (state.timer) clearTimeout(state.timer);
    if (state.planTimer) clearTimeout(state.planTimer);
    state.timer = null;
    state.planTimer = null;
}

/** 运行态（供 status 接口） */
export function status() {
    return {
        enabled: config.monitor.enabled,
        intervalMinutes: config.monitor.intervalMinutes,
        planTime: config.monitorPlanTime,
        day: state.day,
        totalBase: state.totalBase,
        mapSize: state.map.size,
        builtAt: state.builtAt,
        builtFrom: state.builtFrom,
        running: state.running,
        url: config.monitor.url,
        lastStartedAt: state.lastStartedAt,
        lastFinishedAt: state.lastFinishedAt,
        lastError: state.lastError,
        lastCounts: state.lastCounts,
        sseClients: state.sseClients.size,
    };
}

/* ==================== 九、SSE 与查询 ==================== */

/**
 * SSE 订阅（前端 EventSource 直接连这个）
 * 推送格式：data: {"type":"diff", day, totals, added[], removed[], changed[]}
 * 另有周期性心跳注释行，防代理掐空闲连接。
 */
export function streamHandler(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
    });
    res.write('retry: 5000\n\n');
    res.write(`data: ${JSON.stringify({ type: 'hello', day: state.day, totalBase: state.totalBase })}\n\n`);
    state.sseClients.add(res);
    const heartbeat = setInterval(() => {
        try { res.write(': ping\n\n'); } catch { /* ignore */ }
    }, 30000);
    req.on('close', () => {
        clearInterval(heartbeat);
        state.sseClients.delete(res);
    });
}

/** 最近通知（前端重连后一次拉齐；limit 默认 50） */
export function listEvents(query = {}) {
    const limit = Math.min(Math.max(parseInt(query.limit || '50', 10) || 50, 1), 200);
    return { total: state.events.length, items: state.events.slice(0, limit) };
}

/** 手动跑一轮比对（可离线喂样本） */
export async function trigger(body = {}) {
    if (body.rows && !Array.isArray(body.rows)) throw badRequest('rows 必须是数组');
    return runOnce({ rows: body.rows });
}

/** 手动建基线（00:01 自动跑；这里用于调试 / 补建。可离线喂样本） */
export async function triggerBaseline(body = {}) {
    if (body.rows && !Array.isArray(body.rows)) throw badRequest('rows 必须是数组');
    return buildBaseline({ rows: body.rows });
}
