import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import DraftDropdown from "./Components/DraftDropdown";
import { TYPE_BUTTONS, withAlpha } from "../checklistTypeConfig";
import { useChecklistStore } from "../../../store/checklistStore";
import {
    ArrowLeft,
    Check,
    ChevronDown,
    CheckCircle2,
    ExternalLink,
    HardDrive,
    Loader2,
    Map,
    Workflow,
} from "lucide-react";

/**
 * ============================================================
 * ChecklistToolbar —— 检查单页顶部固定区（行1）
 * ------------------------------------------------------------
 * 目录：ChecklistPage/ToolBar/index.jsx（本文件即工具栏本体）
 *      子组件（草稿箱下拉等）放在 ToolBar/Components/ 下
 * ------------------------------------------------------------
 * 标题（航班号 + 检查单类型，同色）+ 操作按钮 + 检查单类型下拉菜单。
 * 独立组件：切换检查单类型只更新模板相关状态，避免整个页面重新渲染。
 *
 * @param {Object} props
 * @param {Object} props.flight         航班对象
 * @param {Object} props.activeBtn      当前检查单类型（TYPE_BUTTONS 项）
 * @param {Function} props.onSwitchType(tplId, flightType)  类型切换回调
 * @param {string} props.viewMode       视图模式（form | flow）
 * @param {Function} props.onToggleFlow 切换流程图视图
 * @param {boolean} props.thumbVisible  小地图开关
 * @param {Function} props.onToggleThumb
 * @param {string} props.saveStatus     提交状态（idle/saving/saved/error）
 * @param {Function} props.onSubmit     提交（落地后端）
 * @param {string|null} props.recordStatus 记录状态（draft/submitted/null）
 * @param {string|null} props.checkedAt    提交时间
 * @param {Function} props.onSelectDraft   草稿下拉选择
 * @param {ReactNode} props.panelSwitcher  三列面板切换器（主要/辅助/视频），渲染在"流程图"按钮前
 * ------------------------------------------------------------
 * 注：页面上没有"保存草稿"按钮 —— 草稿由 checklistStore 在改动某项时防抖写入
 *     浏览器 localStorage。这里只订阅 store 的草稿状态，展示一行轻量提示。
 * ============================================================
 */
export default function ChecklistToolbar({
    flight,
    activeBtn,
    onSwitchType,
    viewMode,
    onToggleFlow,
    thumbVisible,
    onToggleThumb,
    saveStatus,
    onSubmit,
    recordStatus,
    checkedAt,
    onSelectDraft,
    panelSwitcher,
}) {
    const navigate = useNavigate();
    const [typeMenuOpen, setTypeMenuOpen] = useState(false); // 类型下拉开关（组件内状态，切换类型不影响整页）
    // 草稿落盘状态直接从 store 订阅：工具栏不必让编辑器为它订阅、更不必每按键都重渲染
    const draftPending = useChecklistStore((s) => s.draftPending);
    const draftSavedAt = useChecklistStore((s) => s.draftSavedAt);

    return (
        <div className="shrink-0 space-y-2">
            {/* 行1：标题 + 字段区 + 操作按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div style={{ color: activeBtn?.color }}>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold">
                                <span>{flight.flightNo}</span> <span>{activeBtn?.label || "调度席检查单"}</span>
                            </h2>
                            {recordStatus && <BadgeWrap recordStatus={recordStatus} checkedAt={checkedAt} />}
                        </div>
                        <div>
                            {flight?.origin || "起飞机场"} → {flight?.destination || "目的地机场"} · 机型{" "}
                            {flight.aircraftType} · 日期 {flight.flightDate}
                        </div>
                    </div>
                </div>

                {/* 航班信息字段区 —— 待修改（占位，后续合并重构） */}
                <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/40 p-2 text-center text-[11px] text-amber-600">
                    航班信息字段区（待修改）
                </div>

                {/* 草稿自动保存状态：改动某项时由 store 防抖写入 localStorage，页面上没有"保存草稿"按钮 */}
                <span
                    className="flex items-center gap-1 text-[11px] text-slate-400"
                    title="草稿自动保存在浏览器本地，无需手动保存"
                >
                    {draftPending ? (
                        <>
                            <Loader2 className="animate-spin" size={12} /> 草稿保存中…
                        </>
                    ) : draftSavedAt ? (
                        <>
                            <Check size={12} className="text-emerald-500" />
                            草稿已保存{" "}
                            {new Date(draftSavedAt).toLocaleTimeString("zh-CN", { hour12: false }).slice(0, 5)}
                        </>
                    ) : (
                        <>
                            <HardDrive size={12} /> 草稿自动保存
                        </>
                    )}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                    {/* 检查单类型下拉菜单：顺航检查单/货运始发/货运过站/客运始发/客运过站（5 色，label = 落库的 checklist_category） */}
                    <div className="relative">
                        {typeMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setTypeMenuOpen(false)} />}
                        <button
                            onClick={() => setTypeMenuOpen((v) => !v)}
                            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors"
                            style={{
                                color: activeBtn?.color,
                                borderColor: withAlpha(activeBtn?.color, 0.35),
                                backgroundColor: withAlpha(activeBtn?.color, 0.08),
                            }}
                        >
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeBtn?.color }} />
                            {activeBtn?.label}
                            <ChevronDown size={12} />
                        </button>
                        {typeMenuOpen && (
                            <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                                {TYPE_BUTTONS.map((b) => {
                                    const isActiveItem = activeBtn?.label === b.label;
                                    return (
                                        <button
                                            key={b.label}
                                            onClick={() => {
                                                setTypeMenuOpen(false);
                                                onSwitchType(b.tplId, b.flightType, b.routeId);
                                            }}
                                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium transition-colors hover:bg-slate-50"
                                            style={{ color: b.color }}
                                        >
                                            {b.label}
                                            {/* 选中态用 ✔ 表示（不再靠加粗/变色区分） */}
                                            {isActiveItem && <Check size={13} className="ml-auto shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 三列面板切换器（主要/辅助/视频）—— 置于"流程图"按钮前 */}
                    {panelSwitcher}

                    <div className="flex rounded-lg border border-slate-200 p-0.5">
                        <button
                            onClick={onToggleFlow}
                            className={cn(
                                "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                viewMode === "flow" ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"
                            )}
                        >
                            <Workflow size={14} /> 流程图
                        </button>
                    </div>

                    <Button variant={thumbVisible ? "default" : "outline"} size="sm" onClick={onToggleThumb}>
                        <Map size={14} /> {thumbVisible ? "隐藏小地图" : "显示小地图"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/flowchart/${flight.id}`)}>
                        <ExternalLink size={14} /> 独立展示
                    </Button>

                    <DraftDropdown onSelect={onSelectDraft} />
                    <Button size="sm" onClick={onSubmit} disabled={saveStatus === "saving"}>
                        {saveStatus === "saving" ? (
                            <Loader2 className="animate-spin" size={14} />
                        ) : (
                            <CheckCircle2 size={14} />
                        )}
                        提交
                    </Button>
                </div>
            </div>
        </div>
    );
}

/** 记录状态徽章（草稿 / 已提交+时间） */
function BadgeWrap({ recordStatus, checkedAt }) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                recordStatus === "submitted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            )}
        >
            {recordStatus === "submitted" ? (
                <>
                    ✓ 已提交
                    {checkedAt && (
                        <span className="ml-1.5 opacity-80">
                            {new Date(checkedAt).toLocaleString("zh-CN", { hour12: false }).slice(0, 16)}
                        </span>
                    )}
                </>
            ) : (
                "草稿"
            )}
        </span>
    );
}
