import { useMemo } from "react";
import { useChecklistStore } from "../../../../store/checklistStore";
// 填写数据在 checklistDraft（内存 + IndexedDB），不在 checklistStore
import { getSnapshot as getDraftSnapshot } from "../../../../store/checklistDraft";

/**
 * ============================================================
 * useTimeFormulas —— 检查单填写页私有 hook
 * 位置：ChecklistPage/ChecklistEditor/hooks/useTimeFormulas.js
 * ------------------------------------------------------------
 * 只负责构建公式求值上下文 formulaCtx（variables / parameters / 事件时间 / 名称映射）。
 *
 * ★ 节点身份 = uuid
 *   模板里的 `id` 已删除，`uuid` 是节点的唯一身份 —— 因此到处直接写
 *   `n.uuid` 即可，不再需要任何"取节点定位键"的辅助函数：
 *     items 的 key 形如 `main-${n.uuid}` / `aux-${a.uuid}`，
 *     视频项 key 就是条目自身的 uuid。
 *
 * ★ 引用稳定性（重渲染的关键）
 *   formulaCtx 的依赖只有 template / nodes / flight —— **不含 items / header**。
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
 * @returns {{ formulaCtx }}
 * ============================================================
 */
export default function useTimeFormulas({ template, nodes, flight }) {
    const formulaCtx = useMemo(() => {
        const paramMap = {};
        (template?.parameters || []).forEach((p) => (paramMap[p.code] = p));
        const varDefs = template?.variables || {};
        // 事件关联是 uuid（formula 里叫 refUUID）→ 直接按 uuid 找节点
        const findNode = (refUUID) => (nodes || []).find((n) => n.uuid === refUUID);
        const eventTime = (refUUID) => {
            const refNode = findNode(refUUID);
            if (!refNode) return null;
            return getDraftSnapshot().items[`main-${refNode.uuid}`]?.time || null;
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
            eventName: (refUUID) => findNode(refUUID)?.name || String(refUUID).slice(0, 8),
        };
    }, [template, nodes, flight]);

    return { formulaCtx };
}
