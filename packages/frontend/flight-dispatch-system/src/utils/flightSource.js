/**
 * ============================================================
 * flightSource —— 航班数据源（fips / ecyilang / manual_fips）的本地缓存读写
 * ------------------------------------------------------------
 * 当前数据源（取值 = 表名）存在 localStorage，键见 SOURCE_STORAGE_KEY
 * （与 app.store 的 persist 键分开存：一个是大对象，一个是单个字符串）。
 *
 * ★ 为什么在 utils 而不是 api/：这里**一次网络请求都不发**，纯粹是
 *   「读写一个本地缓存值」的活，放在 api 目录里会让 http.js 混进业务状态。
 *   api/http.js 只负责在发请求时按当前源拼参，值从这里的 getSource() 取。
 * ★ 每次调用都**现读**缓存，不缓存成模块常量 —— 切源后下一个请求立即生效。
 * ★ 缓存不可用（隐私模式 / 被禁用 / 配额满）时一律回落默认源，不抛异常。
 * ============================================================
 */
import { FLIGHT_SOURCES, DEFAULT_FLIGHT_SOURCE } from "../config/dataSource";

/** 当前数据源在 localStorage 里的键（内部用，只有本文件读写） */
const SOURCE_STORAGE_KEY = "flight-dispatch:source";

/**
 * 读当前航班数据源。
 * @usedBy api/http.js（发请求前按源拼 ?source=）
 *         store/app.store.js（初始化 / 切源后同步 store 状态）
 * @returns {'fips'|'ecyilang'|'manual_fips'} 缓存里没有 / 值非法 → ecyilang
 */
export function getSource() {
    try {
        const v = String(localStorage.getItem(SOURCE_STORAGE_KEY) || "").trim();
        return FLIGHT_SOURCES.includes(v) ? v : DEFAULT_FLIGHT_SOURCE;
    } catch {
        // 隐私模式 / 存储被禁用：读不到就退回默认源
        return DEFAULT_FLIGHT_SOURCE;
    }
}

/**
 * 写当前航班数据源（非法值归一成默认源）。
 * @usedBy store/app.store.js（设置页切源 → 落缓存 + 同步 store）
 * @param {string} source
 * @returns {'fips'|'ecyilang'|'manual_fips'} 最终真正落缓存的值
 */
export function setSource(source) {
    const value = FLIGHT_SOURCES.includes(source) ? source : DEFAULT_FLIGHT_SOURCE;
    try {
        localStorage.setItem(SOURCE_STORAGE_KEY, value);
    } catch {
        /* 写不进去（隐私模式 / 配额满）也照常返回，本次会话内仍按传入值走 */
    }
    return value;
}
