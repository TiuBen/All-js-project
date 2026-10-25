/**
 * ============================================================
 * fipsHeaders —— 航班表的三套表头配置（默认值）
 * ------------------------------------------------------------
 * 表头形状（store 里持久化的就是它，设置页改的也是它）：
 *   {
 *     source: "fips",                       ← 这套列属于哪个数据源
 *     columns: [
 *       { keyName: "sobt", title: "SOBT", tooltip: "…", order: "default", isHide: false },
 *       …
 *     ]
 *   }
 *   keyName → 行上的字段名（渲染 / 排序都读它）
 *   title   → 表头文案（设置页展示的也是它）
 *   tooltip → 鼠标悬停说明（空串 = 不提示）
 *   order   → 'default' | 'asc' | 'desc'（单列排序，只有一列能不是 default）
 *   isHide  → 表里不渲染这一列（数据仍在）
 *   english → 展示形态（radio 单选，设置页）：true = 英文 / false = 中文；
 *             ★ 列上**没配**这个字段（undefined）= 该列不提供这组切换（设置页不渲染）
 *   icao    → 展示形态（radio 单选，设置页）：true = ICAO4字码 / false = IATA3字码；同上
 * ★ **columns 的数组顺序 = 列顺序**，不需要额外的位置字段。
 *
 * 谁在用：store/fips.store.js（三个 state 的初值 + 恢复默认 + 读老缓存时对齐）
 * 改列 / 改文案 / 加列只改这个文件；用户调过的顺序与显隐存在 localStorage，
 * 以本地为准（见 buildHeaders）。
 *
 * ⚠️ ecyilang 那套列的 keyName 是「格子键」（RawEcyilangTable 里 cellsOf() 返回的键，
 *    一条快照两腿共用一套列），**目前只做配置、还没接渲染** —— 原始快照表仍然
 *    由 pages/FipsPage/stateToWhichCell.js 的 COLUMNS 驱动。
 * ============================================================
 */
import { shortCutTooltip } from "../utils/shortCutFullNameTooltip";

/* ============================================================
 * 一、全部航班表（fips / manual_fips 源；两表字段已对齐，共用这一套）
 * ============================================================ */
export const ALL_HEADER = {
    source: "fips",
    columns: [
        {
            keyName: "task",
            title: "任务性质",
            tooltip: "任务性质：客运 / 货运 / 顺航等，来自航班任务代码",
            order: "default",

            isHide: false,
            english: true,
        },
        {
            keyName: "flight_no",
            title: "航班号",
            tooltip: "航班号：航司二字码 + 数字（如 CZ3101）",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "origin_station",
            title: "起飞机场",
            tooltip: "起飞机场：三 / 四字码，本场为 ZHEC",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "dest_station",
            title: "目的地机场",
            tooltip: "目的地机场：三 / 四字码",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "landing_station",
            title: "落地机场",
            tooltip: "落地机场：经停 / 备降时会与目的地机场不同",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "sobt",
            title: "SOBT",
            tooltip: shortCutTooltip("sobt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "eobt",
            title: "EOBT",
            tooltip: shortCutTooltip("eobt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "atot",
            title: "ATOT",
            tooltip: shortCutTooltip("atot"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "sibt",
            title: "SIBT",
            tooltip: shortCutTooltip("sibt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "eldt",
            title: "ELDT",
            tooltip: shortCutTooltip("eldt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "aldt",
            title: "ALDT",
            tooltip: shortCutTooltip("aldt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "runway",
            title: "跑道",
            tooltip: "跑道：起降跑道编号",
            order: "default",
            isHide: false,
        },
        {
            keyName: "stand",
            title: "停机位",
            tooltip: "停机位：航班停放的机位号",
            order: "default",
            isHide: false,
        },
        {
            keyName: "aircraft_type",
            title: "机型",
            tooltip: "机型：IATA / ICAO 机型代码（如 B77L / A320）",
            order: "default",
            isHide: false,
        },
    ],
};

/* ============================================================
 * 二、离港航班表 —— 起飞机场恒为本场，没有意义 → 不含 origin_station
 * ============================================================ */
export const DEP_HEADER = {
    source: "fips",
    columns: [
        {
            keyName: "task",
            title: "任务性质",
            tooltip: "任务性质：客运 / 货运 / 顺航等，来自航班任务代码",
            order: "default",
            isHide: false,
            english: true,
        },
        {
            keyName: "flight_no",
            title: "航班号",
            tooltip: "航班号：航司二字码 + 数字（如 CZ3101）",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "dest_station",
            title: "目的地机场",
            tooltip: "目的地机场：三 / 四字码",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "landing_station",
            title: "落地机场",
            tooltip: "落地机场：经停 / 备降时会与目的地机场不同",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "sobt",
            title: "SOBT",
            tooltip: shortCutTooltip("sobt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "eobt",
            title: "EOBT",
            tooltip: shortCutTooltip("eobt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "atot",
            title: "ATOT",
            tooltip: shortCutTooltip("atot"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "sibt",
            title: "SIBT",
            tooltip: shortCutTooltip("sibt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "eldt",
            title: "ELDT",
            tooltip: shortCutTooltip("eldt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "aldt",
            title: "ALDT",
            tooltip: shortCutTooltip("aldt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "runway",
            title: "跑道",
            tooltip: "跑道：起降跑道编号",
            order: "default",
            isHide: false,
        },
        {
            keyName: "stand",
            title: "停机位",
            tooltip: "停机位：航班停放的机位号",
            order: "default",
            isHide: false,
        },
        {
            keyName: "aircraft_type",
            title: "机型",
            tooltip: "机型：IATA / ICAO 机型代码（如 B77L / A320）",
            order: "default",
            isHide: false,
        },
    ],
};

/* ============================================================
 * 三、进港航班表 —— 落地机场恒为本场，没有意义 → 不含 landing_station
 * ============================================================ */
export const ARR_HEADER = {
    source: "fips",
    columns: [
        {
            keyName: "task",
            title: "任务性质",
            tooltip: "任务性质：客运 / 货运 / 顺航等，来自航班任务代码",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "flight_no",
            title: "航班号",
            tooltip: "航班号：航司二字码 + 数字（如 CZ3101）",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "origin_station",
            title: "起飞机场",
            tooltip: "起飞机场：三 / 四字码，本场为 ZHEC",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "dest_station",
            title: "目的地机场",
            tooltip: "目的地机场：三 / 四字码",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "sobt",
            title: "SOBT",
            tooltip: shortCutTooltip("sobt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "eobt",
            title: "EOBT",
            tooltip: shortCutTooltip("eobt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "atot",
            title: "ATOT",
            tooltip: shortCutTooltip("atot"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "sibt",
            title: "SIBT",
            tooltip: shortCutTooltip("sibt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "eldt",
            title: "ELDT",
            tooltip: shortCutTooltip("eldt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "aldt",
            title: "ALDT",
            tooltip: shortCutTooltip("aldt"),
            order: "default",
            isHide: false,
        },
        {
            keyName: "runway",
            title: "跑道",
            tooltip: "跑道：起降跑道编号",
            order: "default",
            isHide: false,
        },
        {
            keyName: "stand",
            title: "停机位",
            tooltip: "停机位：航班停放的机位号",
            order: "default",
            isHide: false,
        },
        {
            keyName: "aircraft_type",
            title: "机型",
            tooltip: "机型：IATA / ICAO 机型代码（如 B77L / A320）",
            order: "default",
            isHide: false,
        },
    ],
};

/* ============================================================
 * 四、ecyilang 原始快照表的一套列（暂未接渲染，只做配置）
 *   keyName = stateToWhichCell.js 里 cellsOf() 返回的格子键（{ a, d } 两腿共用一套键）
 * ============================================================ */
export const ECYILANG_ALL_HEADER = {
    source: "ecyilang",
    columns: [
        {
            keyName: "flight_no_full",
            title: "航班号",
            tooltip: "该航段的完整航班号（含航司二字码）",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "flight_date",
            title: "计划日期",
            tooltip: "该航段的航班日期（YYYY-MM-DD）",
            order: "default",
            isHide: false,
        },
        {
            keyName: "flight_type_code",
            title: "任务性质",
            tooltip: "任务性质代码：客 / 货 / 顺航",
            order: "default",
            isHide: false,
            english: true,
        },
        {
            keyName: "dep_station",
            title: "起飞飞机场",
            tooltip: "起飞机场；本场起飞的那条腿自动填「鄂州」",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "arr_station",
            title: "目的地机场",
            tooltip: "目的地机场；回本场的那条腿自动填「鄂州」",
            order: "default",
            isHide: false,
            english: true,
            icao: false,
        },
        {
            keyName: "jx",
            title: "机型",
            tooltip: "机型（快照原字段 jx）",
            order: "default",
            isHide: false,
        },
        {
            keyName: "plan_dep",
            title: "计划起飞时间",
            tooltip: "航班状态未推进时，d_time / a_plan_time 落在这里",
            order: "default",
            isHide: false,
        },
        {
            keyName: "act_dep",
            title: "实际起飞时间",
            tooltip: "航班状态已「起飞 / 到达」后，同样那两个时间字段落在这里",
            order: "default",
            isHide: false,
        },
        {
            keyName: "plan_arr",
            title: "计划到达时间",
            tooltip: "d_plan_time / a_time（到港腿未落地时）；带 (+1) 表示跨天",
            order: "default",
            isHide: false,
        },
        {
            keyName: "act_arr",
            title: "实际到达时间",
            tooltip: "到港腿状态已「到达」时，a_time 落在这里",
            order: "default",
            isHide: false,
        },
        {
            keyName: "state_name",
            title: "航班状态",
            tooltip: "该腿的航班状态：正在值机 / 起飞 / 前方起飞 / 到达",
            order: "default",
            isHide: false,
        },
        {
            keyName: "abnormal_state",
            title: "不正常状态",
            tooltip: "不正常状态：延误 / 取消 / 备降等",
            order: "default",
            isHide: false,
            english: true,
        },
        {
            keyName: "country_type",
            title: "国内外地区",
            tooltip: "国内 / 国际 / 地区",
            order: "default",
            isHide: false,
            english: true,
        },
        {
            keyName: "craft_seat_code",
            title: "停机位",
            tooltip: "停机位（快照原字段 craft_seat_code）",
            order: "default",
            isHide: false,
        },
    ],
};
