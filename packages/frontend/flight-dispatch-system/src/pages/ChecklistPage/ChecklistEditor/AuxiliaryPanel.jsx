import { ListChecks } from "lucide-react";
import { cn } from "../../../lib/utils";
import { evaluateFormula } from "../../../utils/timeFormula";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../components/statusBadge";

/**
 * ============================================================
 * AuxiliaryPanel —— 辅助监控指标面板（填写模式）
 * ------------------------------------------------------------
 * 展示当前激活节点的全部辅助监控指标（type: time）：
 *   - 状态下拉 / 描述 / formula 不可计算提示 / 时间输入 / 备注
 *   - 首个辅助项带锚点（aux-anchor-${activeNodeId}，focusNode 滚动定位）
 * ============================================================
 */
export default function AuxiliaryPanel({ activeNode, activeNodeId, items, formulaCtx, panelRef, setItemValue }) {
    return (
        <div className="flex h-full min-w-0 flex-col rounded-lg border border-slate-300 bg-white">
            {/* 标题栏 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <ListChecks size={13} className="text-primary-600" />
                    辅助监控指标
                    <span className="text-[12px] font-normal text-slate-400 ">
                        {activeNode?.auxiliaries?.length || 0} 项
                    </span>
                </div>
                {activeNode && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[12px] font-medium text-amber-800">
                        {activeNodeId}. {activeNode.name}
                    </span>
                )}
            </div>

            {/* 辅助项列表 */}
            <div ref={panelRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {activeNode ? (
                    activeNode.auxiliaries?.length ? (
                        activeNode.auxiliaries.map((a, ai) => {
                            const aKey = `aux-${a.id ?? a.row}`;
                            const aItem = items[aKey] || {};
                            return (
                                <div
                                    key={aKey}
                                    id={ai === 0 ? `aux-anchor-${activeNodeId}` : undefined}
                                    className="scroll-mt-2 rounded-lg border border-slate-200 p-2 hover:bg-primary-50/40 "
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[13px]  text-slate-600 font-bold">↳ {a.name}</span>
                                        <span className=" italic text-[12px] text-slate-500 ">{a.desc || "—"}</span>
                                        {/* 状态：label 包裹（文字+图标均可点击切换），hover 显示文字 */}
                                        <label
                                            className={cn(
                                                "ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 text-[12px]",
                                                STATUS_COLORS[aItem.status || ""] || "text-blue-500"
                                            )}
                                            title={`状态：${STATUS_LABELS[aItem.status || ""]}（单击切换）`}
                                        >
                                            <span>{STATUS_LABELS[aItem.status || ""]}</span>
                                            <button
                                                className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-150"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setItemValue(aKey, "status", nextStatus(aItem.status));
                                                }}
                                            >
                                                {STATUS_ICONS[aItem.status || ""]}
                                            </button>
                                        </label>
                                    </div>
                                    {/* 系统计算时间（formula 只读结果） / 不可计算提示 */}
                                    {a.formula &&
                                        (() => {
                                            const fr = evaluateFormula(a.formula, formulaCtx);
                                            if (fr.ok && fr.kind === "time") {
                                                return (
                                                    <div className="mt-1 text-[12px] text-slate-400">
                                                        系统计算时间：
                                                        <b className="tabular-nums text-emerald-600">{fr.value}</b>
                                                    </div>
                                                );
                                            }
                                            return !fr.ok ? (
                                                <div className="mt-0.5 text-[14px] text-amber-600" title={fr.reason}>
                                                    ⚠ {fr.reason}
                                                </div>
                                            ) : null;
                                        })()}
                                    {/* 实际时间（年月日 + 时分）+ 备注 */}
                                    <div className="mt-1.5 flex flex-row items-start  gap-2">
                                        <label className="flex flex-row items-center shrink-0 gap-2 text-[14px] text-blue-500">
                                            实际时间
                                            <input
                                                type="datetime-local"
                                                className="input flex-1 px-1.5 py-0.5 "
                                                value={aItem.time || ""}
                                                onChange={(e) => {
                                                    setItemValue(aKey, "time", e.target.value);
                                                    setItemValue(aKey, "auto", false); // 手动输入 → 取消自动标记
                                                }}
                                            />
                                        </label>
                                        <textarea
                                            className="input flex-1 resize-y px-1.5 py-0.5 "
                                            rows={2}
                                            placeholder="备注（可换行）"
                                            value={aItem.note || ""}
                                            onChange={(e) => setItemValue(aKey, "note", e.target.value)}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                            该节点无辅助监控指标
                        </div>
                    )
                ) : (
                    <div className="py-6 text-center text-sm text-slate-400">点击左侧节点查看</div>
                )}
            </div>
        </div>
    );
}
