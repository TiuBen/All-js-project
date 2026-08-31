import { useCallback, useRef } from "react";
import { cn } from "../../../lib/utils";
import { ListChecks } from "lucide-react";
import { evaluateFormula } from "../../../utils/timeFormula";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../components/statusBadge";

/**
 * ============================================================
 * MainMonitoringPanel —— 主要监控指标面板（填写模式）
 * ------------------------------------------------------------
 * 顶部标题栏 + 节点横向卡片流（flex nowrap）：
 *   - 内容超宽时出现横向滚动条，鼠标滚轮上下 → 水平移动
 *   - 每张卡片：序号 / 名称 / 描述 / formula 不可计算提示 / 标签 / 状态 / 时间
 *   - 点击卡片聚焦节点（focusNode 联动辅助/视频锚点 + banner）
 * ============================================================
 */
export default function MainMonitoringPanel({
    nodes,
    items,
    currentStep,
    formulaCtx,
    getNodeId,
    onFocusNode,
    setItemValue,
}) {
    const mainTableRef = useRef(null); // 横向滚动容器（滚轮 → 水平移动）

    // 滚轮横滚：内容横向溢出时 preventDefault + scrollBy smooth
    const onWheel = useCallback((e) => {
        const el = mainTableRef.current;
        if (!el) return;
        if (el.scrollWidth > el.clientWidth + 1) {
            e.preventDefault();
            el.scrollBy({ left: e.deltaY, behavior: "smooth" });
        }
    }, []);

    // callback ref：元素挂载/卸载自动绑定/解绑（避免视图切换后 handler 丢失）
    const setMainTableRef = useCallback(
        (el) => {
            if (mainTableRef.current) mainTableRef.current.removeEventListener("wheel", onWheel);
            mainTableRef.current = el;
            if (el) el.addEventListener("wheel", onWheel, { passive: false });
        },
        [onWheel]
    );

    return (
        <div className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-300 bg-white">
            {/* 标题栏 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 py-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <ListChecks size={13} className="text-primary-600" />
                    主要监控指标
                </div>
                <span className="text-[10px] text-slate-400">{nodes.length} 节点</span>
            </div>

            {/* 横向卡片流（flex row nowrap）：超宽出现横向滚动条，滚轮上下 → 水平移动 */}
            <div ref={setMainTableRef} className="min-h-0 flex-1 overflow-auto">
                <div className="flex  flex-col items-stretch gap-2 p-2">
                    {nodes.map((n, index) => {
                        const nid = getNodeId(n);
                        const mainKey = `main-${nid}`;
                        const mainItem = items[mainKey] || {};
                        const isActive = currentStep === nid;
                        return (
                            <div
                                key={mainKey}
                                id={`main-${nid}`}
                                onClick={() => onFocusNode(n)}
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
                                        {/* {nid} */}
                                        {index + 1}
                                    </span>
                                    <span className="truncate text-[13px] font-semibold text-slate-800" title={n.name}>
                                        {n.name}
                                    </span>
                                </div>
                                {/* 描述 */}
                                <div className="truncate text-[12px] text-slate-400" title={n.desc || "—"}>
                                    {n.desc || "—"}
                                </div>
                                {/* 最晚保障时间：YYYY-MM-DD HH:mm（T → 空格） */}
                                <div className="truncate text-[12px] text-blue-400">
                                    最晚保障时间 {mainItem.time ? String(mainItem.time).replace("T", " ") : "—"}
                                </div>
                                {/* formula 计算明细：多候选公式（function/functions）逐条展示时间或提示 */}
                                {n.formula &&
                                    (() => {
                                        const fr = evaluateFormula(n.formula, formulaCtx);
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
                                                            {dd.ok
                                                                ? `候选${i + 1}：${dd.value}`
                                                                : `候选${i + 1}：⚠ ${dd.reason}`}
                                                        </div>
                                                    ))}
                                                    {/* {fr.ok && (
                                                        <div className="truncate text-[10px] font-medium text-emerald-600">
                                                            → {fr.value}
                                                        </div>
                                                    )} */}
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
                                {/* 标签 */}
                                {/* <div className="flex flex-wrap gap-1">
                                    {n.responsible && (
                                        <span className="rounded bg-violet-50 px-1 py-0.5 text-[9px] text-violet-600">
                                            {n.responsible}
                                        </span>
                                    )}
                                    {n.auxiliaries?.length > 0 && (
                                        <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] text-slate-500">
                                            辅助 {n.auxiliaries.length}
                                        </span>
                                    )}
                                    {videoByNode[nid]?.length > 0 && (
                                        <span className="rounded bg-sky-50 px-1 py-0.5 text-[9px] text-sky-600">
                                            视频 {videoByNode[nid].length}
                                        </span>
                                    )}
                                </div> */}
                                {/* 完成情况（单击切换状态图标） */}
                                {/* <label className="absolute right-5 flex items-center gap-1.5"> */}
                                <label
                                    className={cn(
                                        "text-[14px] absolute right-2 top-1 flex items-center gap-1.5  border-b ",
                                        STATUS_COLORS[mainItem.status || ""] || "text-blue-500"
                                    )}
                                >
                                    <span>{STATUS_LABELS[mainItem.status || ""]}</span>
                                    {/* 状态图标：单击循环切换（待检查→正常→异常→不适用→…），hover 显示文字 */}
                                    <button
                                        className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-150"
                                        title={`状态：${STATUS_LABELS[mainItem.status || ""]}（单击切换）`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemValue(mainKey, "status", nextStatus(mainItem.status));
                                            onFocusNode(n);
                                        }}
                                    >
                                        {STATUS_ICONS[mainItem.status || ""]}
                                    </button>
                                </label>
                                {/*  实际完成时间 */}

                                <label className="flex  mt-auto  items-center gap-1.5 text-[12px] text-slate-500">
                                    实际完成时间
                                    <input
                                        type="datetime-local"
                                        className="input min-w-0 flex-1 px-1 py-1 text-[11px]"
                                        value={mainItem.time || ""}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            setItemValue(mainKey, "time", e.target.value);
                                            setItemValue(mainKey, "auto", false); // 手动输入 → 取消自动标记
                                        }}
                                    />
                                </label>
                            </div>
                        );
                    })}
                    {nodes.length === 0 && (
                        <div className="px-3 py-8 text-center text-slate-400">该航班类型的检查单暂未配置</div>
                    )}
                </div>
            </div>
        </div>
    );
}
