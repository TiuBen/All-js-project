import { useCallback, useMemo } from "react";
import { useChecklistStore } from "../../../store/checklistStore";

/**
 * ============================================================
 * useTimeFormulas —— 检查单填写页（ChecklistPage）私有 hook
 * ------------------------------------------------------------
 * 只负责构建公式求值上下文 formulaCtx（variables / parameters / 事件时间 / 名称映射）。
 *
 * ★ 引用稳定性（重渲染的关键）
 *   formulaCtx 的依赖只有 template / nodes / flight / getNodeId —— **不含 items / header**。
 *   原来把 items、header 作为依赖，导致"填任何一项 → formulaCtx 重建 →
 *   所有带 formula 的卡片 props 变化 → memo 全部失效、整列卡片重渲染"。
 *   现在改成：
 *     - vars / getEventTime 用 getter 在**求值那一刻**从 store 现读（getState()），
 *       结果永远是最新的，不需要把它们放进依赖里
 *     - formulaCtx 对象本身在整个填写过程中引用不变 → memo(卡片) 只受"自己那一项"影响
 *
 * 自动计算（formula → 写回 items）不在这里做，见 Components/TimeFormulaEngine.jsx：
 * 那部分必须跟随 items 变化，放在一个只订阅 items、渲染 null 的引擎组件里，
 * 才不至于把整个编辑页拖进重渲染。
 *
 * @param {Object} 入参 { template, nodes, flight }
 * @returns {{ formulaCtx, getNodeId }}
 * ============================================================
 */
export default function useTimeFormulas({ template, nodes, flight }) {
    // 节点定位键：新结构用全局 id；兼容旧结构 source.seq / seq
    // useCallback([])：引用永久稳定 → memo 卡片不会因它而刷新
    const getNodeId = useCallback((n) => n?.id ?? n?.source?.seq ?? n?.seq, []);

    const formulaCtx = useMemo(() => {
        const paramMap = {};
        (template?.parameters || []).forEach((p) => (paramMap[p.code] = p));
        const varDefs = template?.variables || {};
        const eventTime = (eventId) => {
            const st = useChecklistStore.getState();
            const refNode = (nodes || []).find((n) => n.eventId === eventId);
            if (!refNode) return null;
            return st.items[`main-${getNodeId(refNode)}`]?.time || null;
        };

        return {
            // 变量来源：航班头部 / 航班原始字段；机必备必填（默认 B757）
            // getter 现读 store.header —— 落地时间改动后无需重建本对象即可生效
            get vars() {
                const header = useChecklistStore.getState().header || {};
                return {
                    actualLanding: header.landingTimeLocal || flight?.landingTimeUtc || flight?.raw?.aldt || "",
                    estimatedLanding: flight?.raw?.eldt || "",
                    cobt: flight?.raw?.cobt || "",
                    ctot: flight?.raw?.ctot || "",
                    aircraftType: flight?.aircraftType || header.aircraftType || "",
                    demandGroundPower: "",
                    demandWater: "",
                };
            },
            paramValue: (code, ac) => paramMap[code]?.values?.[ac] ?? null,
            // 机型宽窄判断（choice 条件分支用）：窄体机名单，其余视为宽体机
            isNarrowBody: (ac) => {
                const code = String(ac || "").toUpperCase();
                return ["B737", "B757", "B718", "A319", "A320", "A321"].some((k) => code.startsWith(k));
            },
            getEventTime: eventTime,
            varName: (ref) => varDefs[ref]?.name || ref,
            eventName: (eventId) => (nodes || []).find((n) => n.eventId === eventId)?.name || eventId,
        };
    }, [template, nodes, flight, getNodeId]);

    return { formulaCtx, getNodeId };
}
