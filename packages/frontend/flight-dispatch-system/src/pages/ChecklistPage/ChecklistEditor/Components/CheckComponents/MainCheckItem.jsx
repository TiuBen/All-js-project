import { memo, useCallback } from "react";
import { cn } from "../../../../../lib/utils";
import { evaluateFormula } from "../../../../../utils/timeFormula";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../OtherComponents/statusBadge";
// 填写数据在 checklistDraft（内存 + IndexedDB）：逐项订阅 + 模块级稳定写入函数
import { useMainItem, setItemValue } from "../../../../../store/checklistDraft";
import { useChecklistStore } from "../../../../../store/checklistStore";
import useTimeFormulas from "../../hooks/useTimeFormulas";
import useRegister from "../../hooks/useRegister";

/**
 * ============================================================
 * MainCheckItem —— 主要监控指标「单个节点卡片」（填写模式）
 * ------------------------------------------------------------
 * 由 MainMonitoringPanel 纵向流式渲染，一张卡片 = 一个主监控节点：
 *   序号 + 名称 / 描述 / 最晚保障时间 / formula 计算明细 / 状态 / 实际完成时间
 *
 * ★ 表单写法仿 react-hook-form
 *   输入控件只写一行 `{...register("time")}` —— 没有 value、没有 ref、
 *   没有手写 onChange；"手改时间 → 取消自动标记"由 also 选项顺手带上：
 *     <input type="datetime-local" {...register("time", { also: { auto: false } })} />
 *
 * ★ 其余状态全部自己订阅（零业务 props）
 *   - 数据   useMainItem(nodeId)                       只订阅自己那一项（checklistDraft）
 *   - 写入   setItemValue（checklistDraft 模块级函数，引用永久稳定）
 *   - 高亮   useChecklistStore(s => s.selectedCheckNode === nodeId)
 *   - 聚焦   useChecklistStore(s => s.setSelectedCheckNode)
 *   - 公式上下文 自己从 store 取 template / flight 后 useTimeFormulas 现算
 *   于是"选中某个节点"只让旧/新两张卡各自重渲染，面板本身不动、nodes.map 不重跑。
 *
 * memo 生效的前提（父级需配合）：node / index 引用稳定（来自 nodes 数组）。
 * ============================================================
 * @param {Object} props.node  主监控节点（{ id, name, desc, formula, auxiliaries, ... }）
 * @param {number} props.index 流内序号（从 0 起，展示为 index+1）
 * ============================================================
 */
export default memo(function MainCheckItem({ node, index }) {
    const nodeId = node.uuid; // 节点身份 = uuid
    const itemKey = `main-${nodeId}`;

    // 只订阅自己那一项：其他节点填写时本卡片不重渲染
    const item = useMainItem(nodeId);
    const data = item || {};
    // 高亮 / 聚焦：一律自己从 store 取，不从父级层层透传
    const isActive = useChecklistStore((s) => s.selectedCheckNode === nodeId);
    const setSelectedCheckNode = useChecklistStore((s) => s.setSelectedCheckNode);

    // 公式上下文：template / flight 自己从 store 取，不再由面板层层透传
    const template = useChecklistStore((s) => s.template);
    const flight = useChecklistStore((s) => s.flight);
    const { formulaCtx } = useTimeFormulas({ template, nodes: template?.schema || [], flight });

    // 表单：取值 / 写入 / 回填全部收进 register（setItemValue 是模块级函数，引用稳定）
    const writeField = useCallback((field, value) => setItemValue(itemKey, field, value), [itemKey]);
    const register = useRegister({ time: data.time }, writeField);

    return (
        <div
            id={itemKey}
            onClick={() => setSelectedCheckNode(nodeId)}
            className={cn(
                "relative flex min-w-60 shrink-0 cursor-pointer flex-col   gap-1.5 rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-primary-50/40",
                isActive && "border-amber-300 bg-amber-50/70"
            )}
        >
            {/* 序号 + 名称 */}
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        isActive ? "bg-amber-400 text-white" : "bg-primary-50 text-primary-700"
                    )}
                >
                    {index + 1}
                </span>
                <span className="truncate text-[13px] font-semibold text-slate-800" title={node.name}>
                    {node.name}
                </span>
            </div>

            {/* 描述 */}
            <div className="truncate text-[12px] text-slate-400" title={node.desc || "—"}>
                {node.desc || "—"}
            </div>

            {/* 最晚保障时间：YYYY-MM-DD HH:mm（T → 空格） */}
            <div className="truncate text-[12px] text-blue-400">
                最晚保障时间 {data.time ? String(data.time).replace("T", " ") : "—"}
            </div>

            {/* formula 计算明细：多候选公式（function/functions）逐条展示时间或提示 */}
            {node.formula &&
                (() => {
                    const fr = evaluateFormula(node.formula, formulaCtx);
                    const details = fr.details || [];
                    if (details.length > 1) {
                        return (
                            <div className="space-y-0.5">
                                {details.map((dd, i) => (
                                    <div
                                        key={i}
                                        className={
                                            dd.ok
                                                ? "truncate text-[12px] text-emerald-600"
                                                : "truncate text-[12px] text-amber-600"
                                        }
                                        title={dd.ok ? dd.value : dd.reason}
                                    >
                                        {dd.ok ? `候选${i + 1}：${dd.value}` : `候选${i + 1}：⚠ ${dd.reason}`}
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    // 单公式：可算不显示，不可算显示提示
                    return !fr.ok ? (
                        <div className="truncate text-[12px] text-amber-600" title={fr.reason}>
                            ⚠ {fr.reason}
                        </div>
                    ) : null;
                })()}

            {/* 完成情况（文字 + 单击切换状态图标） */}
            <label
                className={cn(
                    "text-[14px] absolute right-2 top-1 flex items-center gap-1.5  border-b ",
                    STATUS_COLORS[data.status || ""] || "text-blue-500"
                )}
            >
                <span>{STATUS_LABELS[data.status || ""]}</span>
                {/* 状态图标：单击循环切换（待检查→正常→异常→不适用→…），hover 显示文字 */}
                <button
                    className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-150"
                    title={`状态：${STATUS_LABELS[data.status || ""]}（单击切换）`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setItemValue(itemKey, "status", nextStatus(data.status));
                        setSelectedCheckNode(nodeId);
                    }}
                >
                    {STATUS_ICONS[data.status || ""]}
                </button>
            </label>

            {/* 实际完成时间：仿 RHF，一行展开；点输入框不触发卡片选中 */}
            <label className="flex  mt-auto  items-center gap-1.5 text-[12px] text-slate-500">
                实际完成时间
                <input
                    type="datetime-local"
                    {...register("time", { also: { auto: false } })}
                    onClick={(e) => e.stopPropagation()}
                    className="input min-w-0 flex-1 px-1 py-1 text-[11px]"
                />
            </label>
        </div>
    );
});
