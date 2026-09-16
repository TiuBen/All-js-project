import { memo } from "react";
import { cn } from "../../../../lib/utils";
import { evaluateFormula } from "../../../../utils/timeFormula";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../../CommonComponents/statusBadge";
import { useMainItem } from "../../../../store/checklistStore";

/**
 * ============================================================
 * MainCheckItem —— 主要监控指标「单个节点卡片」（填写模式）
 * ------------------------------------------------------------
 * 由 MainMonitoringPanel 横向流式渲染，一张卡片 = 一个主监控节点：
 *   序号 + 名称 / 描述 / 最晚保障时间 / formula 计算明细 / 状态 / 实际完成时间
 *
 * ★ 自行订阅自己那一项（useMainItem(nodeId)）
 *   面板**不再订阅整个 items**（否则填任何一项都会让整列 map 重跑一遍、
 *   所有卡片都跟着走一次 render，即使 memo 最终没提交）。订阅下沉到卡片后：
 *   改 A 卡片 → 只有 A 的 store 切片变化 → 只有 A 重渲染，
 *   其余卡片连 render 都不会被调用。
 *
 * memo 生效的前提（面板侧需配合）：
 *   - onFocusNode / setItemValue 必须是稳定引用（useCallback / store 方法）
 *   - formulaCtx 只在 node.formula 存在时传入，且其引用稳定（见 useTimeFormulas）
 *   - node / index / nodeId 引用稳定（来自 nodes 数组，不随填写变化）
 * ============================================================
 * @param {Object}   props.node         主监控节点（{ id, name, desc, formula, auxiliaries, ... }）
 * @param {number}   props.index        流内序号（从 0 起，展示为 index+1）
 * @param {string|number} props.nodeId  节点定位键（getNodeId(node) 的结果，与 items key 对应）
 * @param {boolean}  props.isActive     是否为当前聚焦节点（高亮）
 * @param {Object}   [props.formulaCtx] 公式求值上下文（仅当 node.formula 存在时传入）
 * @param {Function} props.onFocusNode  点击卡片 → 聚焦该节点 (node) => void
 * @param {Function} props.setItemValue 写入单项字段 (itemKey, field, value) => void
 * ============================================================
 */
export default memo(function MainCheckItem({
    node,
    index,
    nodeId,
    isActive = false,
    formulaCtx,
    onFocusNode,
    setItemValue,
}) {
    const itemKey = `main-${nodeId}`;
    // 只订阅自己那一项：其他节点填写时本卡片不重渲染
    const item = useMainItem(nodeId);
    const data = item || {};

    return (
        <div
            id={`main-${nodeId}`}
            onClick={() => onFocusNode(node)}
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
                        onFocusNode(node);
                    }}
                >
                    {STATUS_ICONS[data.status || ""]}
                </button>
            </label>

            {/* 实际完成时间（手动输入 → 取消自动标记） */}
            <label className="flex  mt-auto  items-center gap-1.5 text-[12px] text-slate-500">
                实际完成时间
                <input
                    type="datetime-local"
                    className="input min-w-0 flex-1 px-1 py-1 text-[11px]"
                    value={data.time || ""}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        setItemValue(itemKey, "time", e.target.value);
                        setItemValue(itemKey, "auto", false);
                    }}
                />
            </label>
        </div>
    );
});
