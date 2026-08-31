import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { evaluateFormula } from "../../../utils/timeFormula";

/**
 * ============================================================
 * useTimeFormulas —— 检查单填写页（ChecklistPage）私有 hook
 * ------------------------------------------------------------
 * 负责 v3 模板的公式时间计算：
 *   1. 构建 formulaCtx（variables / parameters / 事件时间 / 名称映射）
 *   2. 自动计算 effect：formula 求值 → 批量写入时间（迭代至稳定）
 *
 * 手动优先约定：
 *   items[key].auto === true  → 自动计算写入，可被重新计算覆盖
 *   手动输入（无 auto）与历史记录值 → 不覆盖
 *
 * @param {Object} 入参 { template, nodes, items, header, flight, setItems }
 * @returns {{ formulaCtx, getNodeId }}
 * ============================================================
 */
export default function useTimeFormulas({ template, nodes, items, header, flight, setItems }) {
    // 节点定位键：新结构用全局 id；兼容旧结构 source.seq / seq
    const getNodeId = (n) => n?.id ?? n?.source?.seq ?? n?.seq;

    // 公式求值上下文：变量来源 + 机型参数表 + 事件时间 + 名称映射
    const formulaCtx = useMemo(() => {
        const paramMap = {};
        (template?.parameters || []).forEach((p) => (paramMap[p.code] = p));
        const varDefs = template?.variables || {};
        return {
            vars: {
                // 变量来源：航班头部 / 航班原始字段；机必备必填（默认 B757）
                actualLanding: header.landingTimeLocal || flight?.landingTimeUtc || flight?.raw?.aldt || "",
                estimatedLanding: flight?.raw?.eldt || "",
                cobt: flight?.raw?.cobt || "",
                ctot: flight?.raw?.ctot || "",
                aircraftType: flight?.aircraftType || header.aircraftType || "",
                demandGroundPower: "",
                demandWater: "",
            },
            paramValue: (code, ac) => paramMap[code]?.values?.[ac] ?? null,
            // 机型宽窄判断（choice 条件分支用）：窄体机名单，其余视为宽体机
            isNarrowBody: (ac) => {
                const code = String(ac || "").toUpperCase();
                return ["B737", "B757", "B718", "A319", "A320", "A321"].some((k) => code.startsWith(k));
            },
            getEventTime: (eventId) => {
                const refNode = nodes.find((n) => n.eventId === eventId);
                if (!refNode) return null;
                return items[`main-${getNodeId(refNode)}`]?.time || null;
            },
            varName: (ref) => varDefs[ref]?.name || ref,
            eventName: (eventId) => nodes.find((n) => n.eventId === eventId)?.name || eventId,
        };
    }, [template, header, flight, nodes, items]);

    // 自动计算：迭代至稳定；手动输入过的节点（无 auto）不覆盖
    useEffect(() => {
        if (!template || !nodes.length) return;
        const next = { ...items };

        // HH:mm → 完整 datetime（补当天日期），供"实际时间" datetime-local 输入使用
        const toFullTime = (hm) => dayjs().format("YYYY-MM-DD") + "T" + hm;

        // toFull=true：aux 实际时间（完整 datetime）；toFull=false：main 节点（HH:mm）
        const setIfAuto = (key, formula, toFull = false) => {
            if (!formula) return false;
            const cur = next[key];
            if (cur?.time && !cur?.auto) return false; // 手动/历史值 → 不覆盖
            const r = evaluateFormula(formula, formulaCtx);
            if (r.ok && r.kind === "time") {
                const v = toFull ? toFullTime(r.value) : r.value;
                if ((cur?.time || "") !== v) {
                    next[key] = { ...(cur || {}), time: v, auto: true };
                    return true;
                }
            }
            return false;
        };

        for (let round = 0; round < nodes.length + 2; round++) {
            let changed = false;
            for (const n of nodes) {
                // main 节点：实际完成时间默认填系统计算时间（完整 datetime，手动优先）
                changed = setIfAuto(`main-${getNodeId(n)}`, n.formula, true) || changed;
                // aux 辅助项：实际时间默认填系统计算时间（完整 datetime，手动优先）
                for (const a of n.auxiliaries || []) {
                    changed = setIfAuto(`aux-${a.id ?? a.row}`, a.formula, true) || changed;
                }
            }
            if (!changed) break;
        }
        if (JSON.stringify(next) !== JSON.stringify(items)) setItems(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template, nodes, formulaCtx, items]);

    return { formulaCtx, getNodeId };
}
