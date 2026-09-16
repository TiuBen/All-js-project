import { useEffect } from "react";
import dayjs from "dayjs";
import { useChecklistStore } from "../../../../store/checklistStore";
import { evaluateFormula } from "../../../../utils/timeFormula";

/**
 * ============================================================
 * TimeFormulaEngine —— v3 模板「公式时间自动计算」引擎（无 UI）
 * ------------------------------------------------------------
 * 渲染 null，只做一件事：items 变化时按 formula 迭代求值，
 * 把系统计算时间写回 items（手动输入过的项不覆盖）。
 *
 * 为什么单独抽成一个组件？
 *   自动计算**必须**跟随 items 变化，而编辑器本身绝不能订阅 items
 *   （否则填任何一项都会让整个编辑页重渲染）。把订阅下沉到这个
 *   渲染 null 的组件里，重渲染代价几乎为零，编辑器得以保持静止。
 *
 * 迭代到稳定：节点间可能互相引用事件时间（A 依赖 B），
 *   最多跑 nodes.length + 2 轮，某轮无写入即收敛。
 * ============================================================
 * @param {Object}   props.template   检查单模板
 * @param {Array}    props.nodes      主监控节点数组
 * @param {Object}   props.formulaCtx 公式求值上下文（引用稳定，见 useTimeFormulas）
 * @param {Function} props.getNodeId  节点取 id 的方法（引用稳定）
 * ============================================================
 */
export default function TimeFormulaEngine({ template, nodes, formulaCtx, getNodeId }) {
    const items = useChecklistStore((s) => s.items);
    // header 必须一起订阅：formulaCtx 里的 vars.actualLanding 取自 header.landingTimeLocal，
    // 落地时间改动后（items 没变）也要重算，否则公式时间会停在旧值
    const header = useChecklistStore((s) => s.header);
    const setItems = useChecklistStore((s) => s.setItems);

    useEffect(() => {
        if (!template || !nodes.length) return;
        const next = { ...items };
        let dirty = false;

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
            dirty = dirty || changed;
            if (!changed) break;
        }
        // dirty 判定等价于旧写法 JSON.stringify(next) !== JSON.stringify(items)，
        // 但省掉了每次按键两次全量序列化的开销
        if (dirty) setItems(next);
        // header 仅用于触发（值通过 formulaCtx 的 getter 现读），故不参与计算
    }, [template, nodes, formulaCtx, items, header, getNodeId, setItems]);

    return null;
}
