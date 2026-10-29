/**
 * ============================================================
 * fips.store —— 航班列表页 store（列表数据 + 三套表头 + 视图模式）
 * ------------------------------------------------------------
 * 就四块，很薄：
 *   A. 表头（**落 localStorage**）
 *      allHeader / depHeader / arrHeader，形状见 config/fipsHeaders.js：
 *        { source: "fips", columns: [{ keyName, title, tooltip, order, isHide }] }
 *      ★ 设置页「航班表」的改动就是**直接改这三个值**（勾选 = isHide、箭头 = 数组换位、
 *        点表头 = 改 order），改完立即生效并落盘 —— 没有草稿 / 确认两步。
 *
 *   B. 列表数据（不落盘）
 *      rows       后端原样返回的行
 *      flights / depFlights / arrFlights = 三张表**可以直接渲染**的数据
 *                 （已按关键词 / 只看生鲜过滤，已按各自表头的 order 排序）
 *      「怎么拆表、怎么筛、怎么排」全在这里的三个纯函数里（splitFlights /
 *      filterFlights / sortFlights），页面只负责把数组铺到表格上。
 *
 *   C. 过滤条件（不落盘）：keyword / freshOnly / freshCount
 *      ★ 日期参数不由页面传 —— fetchFlights 现读 app.store 的
 *        mode / selectedDate / rangeFrom / rangeTo 拼 ?date= / ?from=&to=，交后端筛。
 *      ★ 数据源 source 也不在这里：api/http.js 发请求时现读 utils/flightSource.js。
 *
 *   D. 视图三态（viewMode，不落盘）：单个 / 左进港右离港 / 右进港左离港。
 *
 * ★ 选中航班 / 增删改 / 生鲜标记 / 添加修改对话框 —— 全在 store/sidebar.store.js，
 *   不在这里（那边要用本文件的 fetchFlights，所以只能单向依赖：sidebar → fips）。
 * ============================================================
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fipsApi } from "../api";
import { useAppStore, dateFilterParamsOf } from "./app.store";
import { ALL_HEADER, DEP_HEADER, ARR_HEADER, ECYILANG_ALL_HEADER } from "../config/fipsHeaders";
import { resolveObjectFields } from "../utils/displayFields";

/* ============================================================
 * 一、表头 —— 纯函数
 * ============================================================ */

/** 视图 → store 里的表头字段名（内部用：动作、persist 归位都走它） */
const HEADER_STATE_KEY = {
    all: "allHeader",
    dep: "depHeader",
    arr: "arrHeader",
    ecyilang: "ecyilangHeader", // 花湖翼览（原始快照源）的表头设置
};

/** 各套默认表头（恢复默认 / 读老缓存时用） */
const DEFAULT_HEADER = { all: ALL_HEADER, dep: DEP_HEADER, arr: ARR_HEADER, ecyilang: ECYILANG_ALL_HEADER };

/**
 * 取「要渲染的列」= columns 里没被隐藏的那些（顺序沿用数组顺序）。
 * 设置页要展示**全部**列（含隐藏的才能勾回来），所以那边直接遍历 columns。
 * @param {{source:string, columns:Array}} header
 */
export function visibleColumns(header) {
    return (header?.columns ?? []).filter((col) => !col.isHide);
}

/**
 * config 配了的展示开关（english / icao）取值：
 *   - config **配了**（布尔）→ 本地存过布尔就用本地的，没存过退回 config 默认
 *   - config **没配**（undefined）→ 一律返回 undefined（删掉）—— 本地存的旧值不算数，
 *     「配没配」以 config/fipsHeaders.js 为唯一事实来源，否则删掉字段后 radio 还在
 */
function pickFlag(configCol, saved, flag) {
    if (typeof configCol[flag] !== "boolean") return undefined;
    return typeof saved?.[flag] === "boolean" ? saved[flag] : configCol[flag];
}

/**
 * 以 config/fipsHeaders.js 的列为准，套上「已保存的显隐 / 顺序 / 排序」。
 * ★ 数组顺序即列顺序：先按 saved 的次序排，配置里有、saved 里没有的新列按声明
 *   顺序补在末尾；saved 里有、配置里已删的列直接丢掉 ——
 *   加列 / 删列 / 读老缓存都不用额外迁移，走一次本函数就自动对齐。
 * 返回新对象，不修改入参。
 * @param {{source:string, columns:Array}} defaultHeader 默认表头（来自 config）
 * @param {{keyName:string, order?:string, isHide?:boolean}[]} [saved] 已保存的配置
 */
export function buildHeaders(defaultHeader, saved) {
    const columns = defaultHeader?.columns ?? [];
    const byKey = new Map(columns.map((col) => [col.keyName, col]));
    const out = [];
    const seen = new Set();

    for (const hit of Array.isArray(saved) ? saved : []) {
        const col = byKey.get(hit?.keyName);
        if (!col || seen.has(col.keyName)) continue; // 已删列 / 重复项丢掉
        seen.add(col.keyName);
        out.push({
            ...col,
            order: hit.order === "asc" || hit.order === "desc" ? hit.order : "default",
            isHide: typeof hit.isHide === "boolean" ? hit.isHide : false,
            // 展示开关（english / icao）：config 没配 → 删掉；配了 → 本地值优先
            english: pickFlag(col, hit, "english"),
            icao: pickFlag(col, hit, "icao"),
        });
    }
    for (const col of columns) {
        if (seen.has(col.keyName)) continue; // 新增列排在最后
        out.push({ ...col });
    }
    return { source: defaultHeader?.source ?? "", columns: out };
}

/* 对象字段（后端 nestVariants 打包的三类：*_name / *_flight_no_full /
 * *_flight_type_code）→ 按表头设置的展示形态取值的实现在 utils/displayFields.js：
 * fetchFlights / fetchFlightRows 两个数据入口和 RawEcyilangTable 共用同一份。 */

/* ============================================================
 * 二、拆表 / 筛选 / 排序 —— 纯函数
 * ============================================================ */

/** 本场四字码（ecyilang 映射、本场机场显示成「鄂州」都用它）⚠️ 与后端同一个值 */
export const LOCAL_STATION = "ZHEC";

/** 时间列：展示取 HH:mm，排序按时间戳 */
export const TIME_KEYS = ["sobt", "eobt", "atot", "sibt", "eldt", "aldt"];

/**
 * 把行拆成离港 / 进港两组。
 *   ecyilang 映射过来的行自带 leg（'d' / 'a'）；
 *   fips / manual_fips 没有 leg，按「机场是不是本场」判：本场起飞 = 离港、
 *   本场落地 = 进港；两边都不是本场的行只出现在「全部」表里。
 */
export function splitFlights(rows = []) {
    const dep = [];
    const arr = [];
    for (const row of rows) {
        const origin = String(row?.origin_station || "").toUpperCase();
        const landing = String(row?.landing_station || row?.dest_station || "").toUpperCase();
        if (row?.leg === "d" || origin === LOCAL_STATION) dep.push(row);
        else if (row?.leg === "a" || landing === LOCAL_STATION) arr.push(row);
    }
    return { dep, arr };
}

/** 关键词（命中航班号 / 机型 / 停机位）+ 只看生鲜 过滤 */
export function filterFlights(rows = [], { keyword = "", freshOnly = false } = {}) {
    let list = rows;
    if (freshOnly) list = list.filter((f) => f.is_fresh);
    const kw = keyword.trim().toLowerCase();
    if (!kw) return list;
    return list.filter(
        (f) =>
            f.flight_no?.toLowerCase().includes(kw) ||
            f.aircraft_type?.toLowerCase().includes(kw) ||
            f.stand?.toLowerCase().includes(kw)
    );
}

/** 按表头里**那唯一一个** order != 'default' 的列排序；都没排过就原样返回 */
export function sortFlights(rows = [], columns = []) {
    const col = columns.find((c) => c.order === "asc" || c.order === "desc");
    if (!col) return rows;
    const dir = col.order === "asc" ? 1 : -1;
    const valueOf = (row) => {
        const raw = row?.[col.keyName];
        if (TIME_KEYS.includes(col.keyName)) return raw ? new Date(raw).getTime() || 0 : 0;
        return raw == null ? "" : String(raw);
    };
    return [...rows].sort((a, b) => {
        const va = valueOf(a);
        const vb = valueOf(b);
        if (va < vb) return -dir;
        if (va > vb) return dir;
        return 0;
    });
}

/** 原始行 + 过滤条件 + 三套表头 → 三张表要渲染的数据 */
function deriveLists({ rows, keyword, freshOnly, allHeader, depHeader, arrHeader }) {
    const prep = (list, header) => sortFlights(filterFlights(list, { keyword, freshOnly }), header.columns);
    const { dep, arr } = splitFlights(rows);
    return {
        flights: prep(rows, allHeader),
        depFlights: prep(dep, depHeader),
        arrFlights: prep(arr, arrHeader),
    };
}

/**
 * 改完某张表的表头之后，一次 set 里做两件事：
 *   ① 把新表头写回 state（这是持久化的那个值，设置页改的就是它）
 *   ② 重算三张表（列顺序 / 排序方向变了，数据也得跟着变）
 */
function withHeader(state, view, header) {
    const key = HEADER_STATE_KEY[view];
    return { [key]: header, ...deriveLists({ ...state, [key]: header }) };
}

/* ============================================================
 * 三、视图三态
 * ============================================================ */

/** 视图三态的键：单个 / 左进港右离港 / 右进港左离港（设置页 radio 按这个顺序列） */
export const VIEW_MODES = ["all", "in-left", "out-left"];

/**
 * 双表模式下左 / 右两张表分别是哪张
 *   'in-left'  左进港右离港 → { left: 'arr', right: 'dep' }
 *   'out-left' 左离港右进港 → { left: 'dep', right: 'arr' }
 */
export function panelViewsOf(viewMode) {
    return viewMode === "in-left" ? { left: "arr", right: "dep" } : { left: "dep", right: "arr" };
}

/* ============================================================
 * 四、store
 * ============================================================ */

export const useFipsStore = create(
    persist(
        (set, get) => ({
            /* ================= A. 表头（持久化） ================= */

            /** 全部航班表的表头（columns 数组顺序 = 列顺序） */
            allHeader: buildHeaders(ALL_HEADER),
            /** 离港航班表 */
            depHeader: buildHeaders(DEP_HEADER),
            /** 进港航班表的表头 */
            arrHeader: buildHeaders(ARR_HEADER),
            /** 花湖翼览（ecyilang 原始快照源）的表头 */
            ecyilangHeader: buildHeaders(ECYILANG_ALL_HEADER),

            /**
             * 点表头：default → asc → desc → default（单列排序，其余列复位）
             * @param {'all'|'dep'|'arr'} view
             * @param {string} keyName
             */
            toggleSort: (view, keyName) =>
                set((s) => {
                    const key = HEADER_STATE_KEY[view];
                    if (!key) return {};
                    const columns = s[key].columns.map((col) => {
                        if (col.keyName !== keyName) return { ...col, order: "default" };
                        const next = col.order === "default" ? "asc" : col.order === "asc" ? "desc" : "default";
                        return { ...col, order: next };
                    });
                    return withHeader(s, view, { ...s[key], columns });
                }),

            /** 切某列的显示 / 隐藏（隐藏只是表里不渲染，数据仍在） */
            toggleVisible: (view, keyName) =>
                set((s) => {
                    const key = HEADER_STATE_KEY[view];
                    if (!key) return {};
                    const columns = s[key].columns.map((col) =>
                        col.keyName === keyName ? { ...col, isHide: !col.isHide } : col
                    );
                    return withHeader(s, view, { ...s[key], columns });
                }),

            /**
             * 设置某列的展示形态（radio 单选，设置页用）：
             *   english = true 英文 / false 中文；icao = true ICAO4字码 / false IATA3字码
             * ★ 列上**没配**对应字段（undefined）时，设置页不渲染这组 radio ——
             *   「配没配」由 config/fipsHeaders.js 决定，这里只管存。
             * @param {'all'|'dep'|'arr'|'ecyilang'} view
             * @param {string} keyName
             * @param {'english'|'icao'} flag
             * @param {boolean} value
             */
            setColumnFlag: (view, keyName, flag, value) =>
                set((s) => {
                    const key = HEADER_STATE_KEY[view];
                    if (!key) return {};
                    const columns = s[key].columns.map((col) =>
                        col.keyName === keyName ? { ...col, [flag]: value } : col
                    );
                    return withHeader(s, view, { ...s[key], columns });
                }),

            /**
             * 把某列上移 / 下移一位（数组顺序即列顺序，直接换位置）
             * @param {'all'|'dep'|'arr'} view
             * @param {string} keyName
             * @param {'left'|'right'} dir  left = 上移，right = 下移
             */
            moveHeader: (view, keyName, dir) =>
                set((s) => {
                    const key = HEADER_STATE_KEY[view];
                    if (!key) return {};
                    const columns = [...s[key].columns];
                    const i = columns.findIndex((col) => col.keyName === keyName);
                    const j = i + (dir === "left" ? -1 : 1);
                    if (i < 0 || j < 0 || j >= columns.length) return {};
                    [columns[i], columns[j]] = [columns[j], columns[i]];
                    return withHeader(s, view, { ...s[key], columns });
                }),

            /** 某张表全部列都显示（顺序不动） */
            showAllHeaders: (view) =>
                set((s) => {
                    const key = HEADER_STATE_KEY[view];
                    if (!key) return {};
                    const columns = s[key].columns.map((col) => ({ ...col, isHide: false }));
                    return withHeader(s, view, { ...s[key], columns });
                }),

            /** 某张表恢复默认（config 里的列清单 + 全部显示 + 不排序） */
            resetHeaders: (view) =>
                set((s) => {
                    if (!HEADER_STATE_KEY[view]) return {};
                    return withHeader(s, view, buildHeaders(DEFAULT_HEADER[view]));
                }),

            /* ================= B. 列表数据（不落盘） ================= */

            /** 后端原样返回的行（未过滤未排序） */
            rows: [],

            /** 三张表要渲染的数据（已过滤 + 已按各自表头排序） */
            flights: [],
            depFlights: [],
            arrFlights: [],

            /** 过滤条件：关键词 / 只看生鲜 */
            keyword: "",
            freshOnly: false,
            /** 生鲜航班总数（不受关键词影响，搜索卡的角标用） */
            freshCount: 0,

            loading: false,
            error: null,
            total: 0,
            /** 后端实际返回数据的日期（fips / ecyilang 源有，manual_fips 源为 null） */
            dataDate: null,

            /**
             * 改关键词（过滤 + 排序在这一个 set 里算完）
             * ⚠️ deriveLists 只返回三张派生表 —— 筛选条件必须在这里**显式写回**，
             *    否则 keyword 永远进不了 store（受控输入框 value 恒为空、打字没反应）
             */
            setKeyword: (keyword) => set((s) => ({ keyword, ...deriveLists({ ...s, keyword }) })),

            /** 只看生鲜（同上：freshOnly 要显式写回，否则 Badge 点不动） */
            setFreshOnly: (freshOnly) => set((s) => ({ freshOnly, ...deriveLists({ ...s, freshOnly }) })),

            /**
             * 拉取航班列表
             * ★ 日期参数在这里拼：现读 app.store 的 mode / selectedDate / rangeFrom / rangeTo
             *   → ?date= 或 ?from=&to=，日期由后端筛；调用方不传任何参数。
             *   数据源 source 由 api/http.js 按当前源拼。
             * @returns {Promise<Array>} 原始行（失败会抛，页面自行 catch）
             */
            fetchFlights: async () => {
                set({ loading: true, error: null });
                try {
                    const params = dateFilterParamsOf(useAppStore.getState());
                    // ★ 花湖翼览源按**原始快照**拉（与 RawEcyilangTable 同形）：
                    //   搜索卡「匹配 N 条」按原始行的格子匹配、生鲜计数要看 is_fresh；
                    //   不传 raw 拿到的是 fips 映射后的腿（124 条、没有 d_name / a_name）
                    const rawSource = useAppStore.getState().source === "ecyilang";
                    const d = await fipsApi.list({ ...params, ...(rawSource ? { raw: 1 } : {}) });
                    // 名称类字段后端是「对象携带变体」形状，按表头设置的展示形态
                    // （中文/英文/IATA/ICAO）挑一个值写回原字段名 —— 对象不进 store
                    const displayHeaders = [get().ecyilangHeader, get().allHeader, get().depHeader, get().arrHeader];
                    let rows = (d?.items || []).map((r) => resolveObjectFields(r, displayHeaders));
                    // raw 模式（ecyilang 原始快照，RawEcyilangTable 用）：行上没有 flight_no，
                    // 补一个（离港号优先、进港号兜底）—— 侧栏创建检查单的
                    // templateKeyOf(flight_no) 和草稿显示都靠它
                    const raw = Boolean(d?.raw);
                    if (raw) {
                        rows = rows.map((r) => ({
                            ...r,
                            flight_no: r.d_flight_no_full || r.a_flight_no_full || null,
                        }));
                    }
                    set((s) => ({
                        ...deriveLists({ ...s, rows }),
                        rows,
                        total: d?.total ?? rows.length,
                        dataDate: d?.date ?? null,
                        freshCount: rows.filter((r) => r.is_fresh).length,
                        loading: false,
                        error: null,
                    }));
                    return rows;
                } catch (err) {
                    set({ loading: false, error: err.message || "加载失败" });
                    throw err;
                }
            },

            /** 切换数据源后清空当前列表（避免旧源的行挂在标题栏下） */
            clearFlights: () =>
                set({
                    rows: [],
                    flights: [],
                    depFlights: [],
                    arrFlights: [],
                    total: 0,
                    dataDate: null,
                    freshCount: 0,
                    error: null,
                }),

            /* ================= C. 视图三态（不落盘） ================= */

            viewMode: VIEW_MODES[0],

            /**
             * 数据版本号：后端监控 SSE 推来「新增 / 变更 / 减少」（或当天基线重灌）时 +1。
             * 页面与原始快照表都把它放进拉数据的 effect 依赖里 → 一变就重拉重渲染。
             * ★ 不落盘：刷新页面后靠正常首次拉取对齐，不需要记历史版本。
             */
            dataVersion: 0,
            bumpDataVersion: () => set((s) => ({ dataVersion: s.dataVersion + 1 })),

            /** 切到指定视图（设置页的 radio 调它） */
            setViewMode: (mode) => {
                if (VIEW_MODES.includes(mode)) set({ viewMode: mode });
            },
        }),
        {
            name: "flight-dispatch:fips",
            version: 5,
            // 只持久化四套表头（含顺序 / 显隐 / 排序方向 / english·icao 开关）
            partialize: (s) => ({
                allHeader: s.allHeader,
                depHeader: s.depHeader,
                arrHeader: s.arrHeader,
                ecyilangHeader: s.ecyilangHeader,
            }),
            // v1: tableHeaders{all,in,out} → v2: 三个同级数组（列键 key）
            // → v3: 列键改 keyName → v4: 每条表头变成 { source, columns }（列键 keyName + title）
            // → v5: 新增花湖翼览（ecyilang）表头设置
            migrate: (persisted, version) => {
                if (!persisted) return persisted;
                let saved = persisted;
                if (version < 2) {
                    const t = persisted.tableHeaders || {};
                    saved = { allHeaders: t.all, depHeaders: t.out, arrHeaders: t.in };
                }
                if (version < 3) {
                    const rename = (list) => (list || []).map((h) => ({ ...h, keyName: h.keyName || h.key }));
                    saved = {
                        allHeaders: rename(saved.allHeaders),
                        depHeaders: rename(saved.depHeaders),
                        arrHeaders: rename(saved.arrHeaders),
                    };
                }
                let out;
                if (version < 4) {
                    out = {
                        allHeader: buildHeaders(ALL_HEADER, saved.allHeaders),
                        depHeader: buildHeaders(DEP_HEADER, saved.depHeaders),
                        arrHeader: buildHeaders(ARR_HEADER, saved.arrHeaders),
                    };
                } else {
                    out = persisted;
                }
                if (version < 5) {
                    // v5：花湖翼览表头设置是新增的，本地没有 → 直接用 config 默认
                    out = { ...out, ecyilangHeader: buildHeaders(ECYILANG_ALL_HEADER) };
                }
                return out;
            },
            // 读缓存时对齐配置：补新增列、丢已删列、修非法 order / isHide
            // ⚠️ 必须按 HEADER_STATE_KEY 的键遍历（此前误用 VIEW_MODES，dep/arr 的
            //    持久化值从未被恢复过 —— 顺手修掉这个存量 bug）
            merge: (persisted, current) => {
                const out = { ...current, ...persisted };
                for (const [view, key] of Object.entries(HEADER_STATE_KEY)) {
                    out[key] = buildHeaders(DEFAULT_HEADER[view], persisted?.[key]?.columns);
                }
                return out;
            },
        }
    )
);

/* ============================================================
 * 五、给「不在页面里」的调用方（specialStore 的日历数字）
 * ============================================================ */

/**
 * 直接拉一次航班列表（**不写 store 状态、不带日期筛选**）
 * 供「手里只有一个航班键，需要反查航班行 / 算跨天统计」的场景兜底用。
 * @returns {Promise<Array>} 原始行
 */
export async function fetchFlightRows() {
    const d = await fipsApi.list();
    // 与 fetchFlights 同一入口约定：对象字段先按表头设置的展示形态取值再出门
    const s = useFipsStore.getState();
    const displayHeaders = [s.ecyilangHeader, s.allHeader, s.depHeader, s.arrHeader];
    return (d?.items || []).map((r) => resolveObjectFields(r, displayHeaders));
}
