/**
 * ============================================================
 * app.store —— 应用级全局状态（跨页面共享、持久化到 localStorage）
 * ------------------------------------------------------------
 * 目前存三类：
 *   1. 当前用户 currentUser + 登录日志会话 loginLogId（谁在用 / 登出时该盖哪一行）
 *   2. 所选日期（单选/范围，日历控件共享，航班列表页与填写记录页共用）
 *   3. 航班数据源 source（设置页可切，持久化到独立的本地缓存键）
 *
 * ★ 为什么 source 放在这里：它是「全局唯一的一个选择」，航班列表页 / 生鲜页
 *   都要跟着变（换源 → 重新拉数），放在 appStore 里页面直接订阅最省事。
 *   真正的拼参不在这里 —— api/http.js 发请求时现读本地缓存（同一个键），
 *   所以本值只是「缓存的一份响应式镜像」，两者靠 setSource 保持同步。
 *   缓存的读写本身在 utils/flightSource.js（非 HTTP 的工具层）。
 *
 * ★ useDateFilterParams 也放这里：它是「读 appStore 出筛选参数」的纯派生 hook，
 *   放组件文件里会让 react-refresh 报「同一文件既导出组件又导出函数」。
 *   另导出两个**非 hook** 版本（dateFilterParamsOf / dateFilterKeyOf）：
 *   fips.store 在自己的 action / 订阅里要用 —— 那边不在组件环境里，调不了 hook。
 * ============================================================
 */

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import dayjs from "dayjs";
import { userLogApi } from "../api";
import { getSource, setSource as writeSource } from "../utils/flightSource";

const BASE_AIRPORT = "ZHEC";

export const useAppStore = create(
    persist(
        (set, get) => ({
            // ---- 航班数据源（运行期可切） ----
            // 初值直接取本地缓存（读不到 / 非法 → ecyilang），保证与 http.js 一致
            source: getSource(),
            /**
             * 切换航班数据源
             * ★ 先落本地缓存（http.js 下次请求就按新源拼参），再更新状态触发重渲染
             * @param {'fips'|'ecyilang'|'manual_fips'} source
             * @returns {'fips'|'ecyilang'|'manual_fips'} 归一后的值（非法值回落到默认源）
             */
            setSource: (source) => set({ source: writeSource(source) }),

            // ---- 主界面 TAB（原 tabsStore 并入） ----
            // flights | checklist | records；跟着 persist 落 localStorage，
            // 记住用户上次停在哪一页（高亮仍以当前路由为准，这里只是记忆）
            activeTab: "flights",
            setActiveTab: (tab) => set({ activeTab: tab }),

            // ---- 当前用户 + 登录日志会话 ----
            // ★ 两个值放一起，因为它们一起变：currentUser 只决定「界面上是谁」，
            //   loginLogId 是**这一场登录在 user_login_log 里的行 id** ——
            //   登出时要靠它找到那一行盖 logout_time，所以必须存住。
            // ★ loginLogId 跟着 store 落 localStorage：刷新页面不该把这一场弄丢，
            //   丢了就会留下一条永远不登出的日志。
            currentUser: "",
            /** 当前用户的 user 表主键（SwitchUserDialog 选人时就有；提交检查单 / 台账的检查人用它） */
            currentUserId: null,
            loginLogId: null,
            /**
             * 纯本地改名（不写流水）：登录日志写失败时的兜底，见 SwitchUserDialog
             * @param {string} name
             * @param {number} [userId] 花名册 id（有就一起存；登录成功的路径由 login 自己从返回行里取）
             */
            setCurrentUser: (name, userId) =>
                set(userId === undefined ? { currentUser: name } : { currentUser: name, currentUserId: userId }),

            /**
             * 登录：往 user_login_log 插一行，再把人 + 行 id 记进当前会话
             * ★ 失败会**抛**（不吞）：调用方自己决定是拦人还是只告警 ——
             *   「记流水失败」和「能不能切换用户」是两件事。
             * @param {string} username
             * @returns {Promise<Object|null>} 新插入的行（含 id / login_time / user_id）；名字为空返回 null
             */
            login: async (username) => {
                const name = String(username ?? "").trim();
                if (!name) return null;
                const row = await userLogApi.login({ username: name });
                // user_id 由后端按 username 在 user 花名册里现解析（对不上为 null）
                set({ currentUser: name, loginLogId: row?.id ?? null, currentUserId: row?.user_id ?? null });
                return row;
            },

            /**
             * 登出：给这一场盖上 logout_time（服务端时间），成功后清空会话
             * ★ 没开场（loginLogId 为空）直接返回，不发没意义的请求。
             * ★ 失败同样抛，且**不清会话** —— 这一行还开着，留着 id 下次还能补上
             *   （半个登出状态比丢掉 id 更可控）。
             * @returns {Promise<Object|null>}
             */
            logout: async () => {
                const { loginLogId } = get();
                if (!loginLogId) return null;
                const row = await userLogApi.logout(loginLogId);
                set({ currentUser: "", currentUserId: null, loginLogId: null });
                return row;
            },

            // ---- 所选日期（单选或范围） ----
            mode: "single", // single | range
            // 默认今天。用 dayjs 取**本地**日期（不是 toISOString，避免时区偏移差一天）
            selectedDate: dayjs().format("YYYY-MM-DD"),
            rangeFrom: null,
            rangeTo: null,
            setMode: (mode) => set({ mode }),
            setSelectedDate: (d) => set({ selectedDate: d }),
            setRange: (from, to) => set({ rangeFrom: from, rangeTo: to }),
        }),
        {
            name: "flight-dispatch:app",
            // source 有自己的缓存键（utils/flightSource.js 的 SOURCE_STORAGE_KEY 读写），
            // 这里把它剔掉再持久化，免得两份缓存打架
            partialize: (state) => Object.fromEntries(Object.entries(state).filter(([key]) => key !== "source")),
        }
    )
);

/**
 * 日期筛选 → 请求参数（**纯函数**，给「不在组件里」的调用方用）
 *   单选模式 → { date: 'YYYY-MM-DD' }
 *   范围模式 → { from, to }（可能为 null，axios 会自动跳过空值）
 *
 * ★ 默认直接现读 store —— fips.store 的 fetchFlights 就是这么拿参数的
 *   （AStore 自己监听 BStore 的日期，页面不再经手）。
 * @returns {{date?:string, from?:string|null, to?:string|null}}
 */
export function dateFilterParamsOf(state = useAppStore.getState()) {
    return state.mode === "single" ? { date: state.selectedDate } : { from: state.rangeFrom, to: state.rangeTo };
}

/**
 * 日期筛选指纹：四个字段拼成一行字符串
 * 用途：判断「筛选是不是真的变了」—— store 订阅、页面 effect 依赖都靠它，
 * 比拿对象比引用省事（对象每次都是新的）。
 */
export const dateFilterKeyOf = (state) =>
    `${state.mode}|${state.selectedDate ?? ""}|${state.rangeFrom ?? ""}|${state.rangeTo ?? ""}`;

/**
 * 读当前日期筛选参数（**hook**，供组件调用）
 *
 * ★ 用 useMemo 稳定返回对象的引用：页面普遍把它的返回值放进 useMemo /
 *   useEffect 依赖里，每次新对象会让下游 memo 全部失效（列表每帧重算）。
 * @returns {{date?:string, from?:string|null, to?:string|null}}
 */
export function useDateFilterParams() {
    const mode = useAppStore((s) => s.mode);
    const selectedDate = useAppStore((s) => s.selectedDate);
    const rangeFrom = useAppStore((s) => s.rangeFrom);
    const rangeTo = useAppStore((s) => s.rangeTo);
    return useMemo(
        () => dateFilterParamsOf({ mode, selectedDate, rangeFrom, rangeTo }),
        [mode, selectedDate, rangeFrom, rangeTo]
    );
}
