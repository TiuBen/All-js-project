import { memo, useCallback } from "react";
import { cn } from "../../../../lib/utils";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "./statusBadge";
import { useChecklistStore } from "../../../../store/checklistEditorPage.store";

/**
 * MainCheckItem —— 主要监控指标「单个节点卡片」（填写模式）
 */
export default memo(function MainCheckItem({ node, index, onSelect }) {
    const nodeId = node.uuid; // 节点身份 = uuid
    const itemKey = `main-${nodeId}`;

    // 高亮 / 聚焦：一律自己从 store 取，不从父级层层透传
    const selectedMainNode = useChecklistStore((s) => s.selectedMainNode);
    const setSelectedCheckNode = useChecklistStore((s) => s.setSelectedCheckNode);
    const isActive = useChecklistStore((s) => s.selectedMainNode === node);

    return (
        <div
            id={itemKey}
            onClick={() => {
                setSelectedCheckNode(node);
                onSelect(node.uuid);
            }}
            className={cn(
                "relative flex min-w-60 shrink-0 cursor-pointer flex-col   gap-1.5 rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-primary-50/40",
                isActive && "border-amber-300 bg-amber-50/70"
            )}
        >
            {/* 序号 + 名称 */}
            <div className="flex items-start gap-2">
                <span
                    className={cn(
                        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        isActive ? "bg-amber-400 text-white" : "bg-primary-50 text-primary-700"
                    )}
                >
                    {index + 1}
                </span>
                <span className="text-wrap text-[14px] font-semibold text-slate-800" title={node.name}>
                    {node?.name}
                    <div className="text-wrap text-[11px] text-slate-400" title={node?.desc || "—"}>
                        {node?.desc || "—"}
                    </div>
                </span>
            </div>

            {/* 描述 */}

            {/* 最晚保障时间：YYYY-MM-DD HH:mm（T → 空格） */}
            {/* <div className="truncate text-[12px] text-blue-400">
                最晚保障时间 {data.time ? String(data.time).replace("T", " ") : "—"}
            </div> */}

            {/* formula 计算明细：多候选公式（function/functions）逐条展示时间或提示 */}
            {/* {node.formula &&
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
                })()} */}

            {/* 完成情况（文字 + 单击切换状态图标） */}
            {/* 状态图标：单击循环切换（待检查→正常→异常→不适用→…），hover 显示文字 */}
            {/* <label
                className={cn(
                    "text-[14px] absolute right-2 top-1 flex items-center gap-1.5  border-b ",
                    STATUS_COLORS[data.status || ""] || "text-blue-500"
                )}
            >
                <span>{STATUS_LABELS[data.status || ""]}</span>
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
            </label> */}

            {/* 实际完成时间：仿 RHF，一行展开；点输入框不触发卡片选中 */}
            <label className="flex  mt-auto  items-center gap-1.5 text-[12px] text-slate-500">
                实际完成时间
                <input
                    type="datetime-local"
                    onClick={(e) => e.stopPropagation()}
                    className="input min-w-0 flex-1 px-[0.25rem] py-[0.2rem] text-[11px]"
                />
            </label>
        </div>
    );
});
