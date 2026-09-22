import { useEffect } from "react";
import dayjs from "dayjs";
import { useSyncExternalStore } from "react";
import { useChecklistStore } from "../../../../../store/checklistStore";
// 填写数据在 checklistDraft（内存 + IndexedDB）：引擎订阅 version，写回走 setItems
import {
  getSnapshot as getDraftSnapshot,
  setItems as setDraftItems,
  subscribeDraft,
  getDraftVersion,
} from "../../../../../store/checklistDraft";
import { evaluateFormula } from "../../../../../utils/timeFormula";
import useTimeFormulas from "../../hooks/useTimeFormulas";

/**
 * ============================================================
 * TimeFormulaEngine —— v3 模板「公式时间自动计算」引擎（无 UI）
 * ------------------------------------------------------------
 * 渲染 null，只做一件事：草案填写变化时按 formula 迭代求值，
 * 把系统计算时间写回草案 items（手动输入过的项不覆盖）。
 *
 * 为什么单独抽成一个组件？
 *   自动计算**必须**跟随填写变化，而编辑器本身绝不能订阅填写数据
 *   （否则填任何一项都会让整个编辑页重渲染）。把订阅下沉到这个
 *   渲染 null 的组件里，重渲染代价几乎为零，编辑器得以保持静止。
 *
 * 订阅方式：useSyncExternalStore 只订阅 checklistDraft 的 version 数字
 *   （任何填写改动 +1），值在 effect 里经 getSnapshot() 现读。
 *
 * 迭代到稳定：节点间可能互相引用事件时间（A 依赖 B），
 *   最多跑 nodes.length + 2 轮，某轮无写入即收敛。
 *
 * ★ 非受控：零 props —— template / flight / nodes / formulaCtx 全部自己从 store / 草案取。
 * ============================================================
 */
export default function TimeFormulaEngine() {
  // 草案版本：任何填写改动（含引擎自己写回）都会 +1 → 触发本 effect 重算
  const draftVersion = useSyncExternalStore(subscribeDraft, getDraftVersion, getDraftVersion);
  // header 必须一起订阅：formulaCtx 里的 vars.actualLanding 取自 header.landingTimeLocal，
  // 落地时间改动后（草案没变）也要重算，否则公式时间会停在旧值
  const header = useChecklistStore((s) => s.header);
  const template = useChecklistStore((s) => s.template);
  const flight = useChecklistStore((s) => s.flight);

  const nodes = template?.schema || [];
  const { formulaCtx } = useTimeFormulas({ template, nodes, flight });

  useEffect(() => {
    if (!template || !nodes.length) return;
    const items = getDraftSnapshot().items;
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
        changed = setIfAuto(`main-${n.uuid}`, n.formula, true) || changed;
        // aux 辅助项：实际时间默认填系统计算时间（完整 datetime，手动优先）
        for (const a of n.auxiliaries || []) {
          changed = setIfAuto(`aux-${a.uuid}`, a.formula, true) || changed;
        }
      }
      dirty = dirty || changed;
      if (!changed) break;
    }
    // dirty 判定等价于旧写法 JSON.stringify(next) !== JSON.stringify(items)，
    // 但省掉了每次按键两次全量序列化的开销
    if (dirty) setDraftItems(next);
    // header 仅用于触发（值通过 formulaCtx 的 getter 现读），故不参与计算
  }, [template, nodes, formulaCtx, draftVersion, header]);

  return null;
}
