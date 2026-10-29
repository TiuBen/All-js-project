/**
 * ============================================================
 * stateToWhichCell —— ecyilang 原始行 → RawEcyilangTable 格子的配置 / 纯函数
 * ------------------------------------------------------------
 * RawEcyilangTable（主表）和 RawEcyilangTableDialog（changelog 弹窗）
 * 都要用同一套「表头列定义 + 状态 → 格子」的规则，抽在这里防止两处漂移。
 *
 * ★ 对外只提供**一条函数** cellsOf(row)：一行快照 → 两腿各 14 个格子。
 *   以前是 legCells(row, 'a'|'d') + 外面按 LEGS 数组循环拼腿，
 *   现在一次算完「到」和「离」两条腿，组件里两行直接照写，不再拼腿。
 *
 * 【字段语义（按接口真实数据核过）】
 *   d_time      = 起飞时间（实际/预计二义性）—— 未起飞时它就是「计划起飞」
 *   d_plan_time = 计划到达时间（目的地），常带跨天后缀如 08:50(+1)
 *   a_plan_time = 前方机场起飞（实际/预计）
 *   a_time      = 进港到达（实际/预计）
 *
 * 【时间四列分配规则（用户定的，看航班状态）】
 *   离港腿（d）：d_state 未推进（null / 值机…）→ d_time 放「计划起飞」；
 *               d_state 已「起飞 / 到达」→ d_time 放「实际起飞」；
 *               d_plan_time 恒放「计划到达」（含 (+1) 后缀）
 *   进港腿（a）：a_state = null / 值机（前方未起飞）→ a_plan_time 放「计划起飞」、a_time 放「计划到达」；
 *               a_state = 「前方起飞」→ a_plan_time 放「实际起飞」、a_time 仍是「计划到达」；
 *               a_state = 「到达」→ a_plan_time 放「实际起飞」、a_time 放「实际到达」
 *
 * ⚠️ 本文件只放纯函数 / 常量（无组件、无副作用）。
 * ============================================================
 */

/** 本场站名（快照行里没有本场列，按腿语义手工填充） */
export const LOCAL_NAME = "鄂州";

/* ============================================================
 * 列定义（14 列）—— 一条腿的展示列，顺序即显示顺序
 * 表头第 1 行按 group 铺 colspan，第 2 行按这里的顺序出列名。
 * ============================================================ */
export const COLUMNS = [
    { key: "flight_no_full", label: "航班号", group: "航班信息" },
    { key: "flight_date", label: "计划日期", group: "航班信息" },
    { key: "flight_type_code", label: "任务性质", group: "航班信息" },
    { key: "dep_station", label: "起飞飞机场", group: "航班信息" },
    { key: "arr_station", label: "目的地机场", group: "航班信息" },
    { key: "jx", label: "机型", group: "航班信息" },
    { key: "plan_dep", label: "计划起飞时间", group: "时间" },
    { key: "act_dep", label: "实际起飞时间", group: "时间" },
    { key: "plan_arr", label: "计划到达时间", group: "时间" },
    { key: "act_arr", label: "实际到达时间", group: "时间" },
    { key: "state_name", label: "航班状态", group: "航班动态" },
    { key: "abnormal_state", label: "不正常状态", group: "其它属性" },
    { key: "country_type", label: "国内外地区", group: "其它属性" },
    { key: "craft_seat_code", label: "停机位", group: "其它属性" },
];

/** 分组出现顺序（表头第 1 行按它铺 colspan） */
export const GROUPS = [...new Set(COLUMNS.map((c) => c.group))];

/** 整腿为空时的占位：14 个格子全 null（组件里统一渲染「-」），跟着 COLUMNS 一起变 */
const EMPTY_CELLS = Object.fromEntries(COLUMNS.map((c) => [c.key, null]));

/** 空值判定：null / undefined / 空串都算没值 */
const isBlank = (v) => v == null || v === "";

/** 库日期列 / 远程日期串 → 'YYYY-MM-DD' */
const day = (v) => (isBlank(v) ? null : String(v).slice(0, 10));

/** 文本原样（空 → null） */
const text = (v) => (isBlank(v) ? null : v);

/**
 * 时间格：'HH:mm' + **跨天偏移后缀**（(+1) / (-1) 要显示出来 —— 用户定的）。
 * 兼容两种输入形态：
 *   - 远程原始串 '23:55' / '08:50(+1)' → 无 T，原样返回（后缀自带）
 *   - 库行 ISO '2026-10-16T08:50:00.000Z' → 取 T 后 HH:mm，并与 baseDay 比天数差重算后缀
 * 模块私有：调用方只经过 cellsOf，不单独用。
 * @param {string} iso      时间值
 * @param {string} baseDay  该腿的航班日期 'YYYY-MM-DD'（d_* 用 d_flight_date，a_* 用 a_flight_date）
 */
const timeCell = (iso, baseDay) => {
    if (isBlank(iso)) return null;
    const m = String(iso).match(/T(\d{2}:\d{2})/);
    if (!m) return String(iso);
    const t = m[1];
    if (!baseDay) return t;
    const d = new Date(iso);
    const b = new Date(`${baseDay}T00:00:00Z`);
    if (Number.isNaN(b.getTime())) return t;
    const off = Math.round(
        (Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - b.getTime()) / 86400000
    );
    return off === 0 ? t : `${t}(${off > 0 ? "+" : ""}${off})`;
};

/**
 * 关键词过滤（整条数据为单位：到 / 离任一格的任一值命中就整条保留）。
 * ★ 表格（RawEcyilangTable）与搜索卡（FlightSearchCard 的「匹配 N 条」）共用，
 *   两处口径必须一致；放在本文件是因为它只依赖 cellsOf。
 * @param {Object} row 一行原始快照（已过 resolveObjectFields 的行也适用）
 * @param {string} keyword
 */
export function matchKeyword(row, keyword) {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return true;
    const { a, d } = cellsOf(row);
    // __search = resolveObjectFields 拼的「全部变体文本」（中文名 / 英文名 / IATA / ICAO）——
    // 展示只显示一种形态，搜索仍要能命中任意形态
    const extra = String(row?.__search ?? "").toLowerCase();
    if (extra && extra.includes(kw)) return true;
    return [a, d].some((cells) => Object.values(cells).some((v) => v != null && String(v).toLowerCase().includes(kw)));
}

/**
 * ★ 一行 ecyilang 快照 → 两腿的格子（到 = a，离 = d），每条腿都是 14 个格子的完整对象。
 *   一条快照在表里就是两行（到 / 离），所以这里一次把两行都算好，组件直接照着摆。
 *
 * 返回：{ a: {...14 键}, d: {...14 键} }，值可直接当单元格内容（null = 显示「-」）。
 * 整腿为空（纯离港 / 纯进港快照）→ 那条腿 14 格全 null。
 *
 * 本场侧按腿语义填充：到腿目的地 = 鄂州，离腿起飞 = 鄂州。
 * @param {Object} row 一行原始快照（远程行 / changelog 里的 snapshot 都行）
 */
export function cellsOf(row) {
    /* -------------------- 到港腿（a） -------------------- */
    const aBase = day(row?.a_flight_date);
    const aState = String(row?.a_state_name ?? "");
    const aArrived = aState.includes("到达"); // 已落地
    const aDeparted = /起飞|到达/.test(aState); // 前方已起飞（「前方起飞」/「到达」都算）
    const aEmpty = ["a_flight_no_full", "a_name", "a_plan_time", "a_time"].every((k) => isBlank(row?.[k]));
    const aCells = aEmpty
        ? EMPTY_CELLS
        : {
              flight_no_full: text(row?.a_flight_no_full),
              flight_date: aBase,
              flight_type_code: text(row?.a_flight_type_code),
              dep_station: text(row?.a_name), // 起飞飞机场 = 前方机场
              arr_station: LOCAL_NAME, // 目的地机场 = 本场
              jx: text(row?.a_jx),
              plan_dep: aDeparted ? null : timeCell(row?.a_plan_time, aBase),
              act_dep: aDeparted ? timeCell(row?.a_plan_time, aBase) : null,
              plan_arr: aArrived ? null : timeCell(row?.a_time, aBase),
              act_arr: aArrived ? timeCell(row?.a_time, aBase) : null,
              state_name: text(row?.a_state_name),
              abnormal_state: text(row?.a_abnormal_state),
              country_type: text(row?.a_country_type),
              craft_seat_code: text(row?.a_craft_seat_code),
          };

    /* -------------------- 离港腿（d） -------------------- */
    const dBase = day(row?.d_flight_date);
    const dDeparted = /起飞|到达/.test(String(row?.d_state_name ?? ""));
    const dEmpty = ["d_flight_no_full", "d_name", "d_plan_time", "d_time"].every((k) => isBlank(row?.[k]));
    const dCells = dEmpty
        ? EMPTY_CELLS
        : {
              flight_no_full: text(row?.d_flight_no_full),
              flight_date: dBase,
              flight_type_code: text(row?.d_flight_type_code),
              dep_station: LOCAL_NAME, // 起飞飞机场 = 本场
              arr_station: text(row?.d_name), // 目的地机场 = 远端
              jx: text(row?.d_jx),
              plan_dep: dDeparted ? null : timeCell(row?.d_time, dBase),
              act_dep: dDeparted ? timeCell(row?.d_time, dBase) : null,
              plan_arr: timeCell(row?.d_plan_time, dBase),
              act_arr: null, // 离港腿没有到达时间
              state_name: text(row?.d_state_name),
              abnormal_state: text(row?.d_abnormal_state),
              country_type: text(row?.d_country_type),
              craft_seat_code: text(row?.d_craft_seat_code),
          };

    return { a: aCells, d: dCells };
}
