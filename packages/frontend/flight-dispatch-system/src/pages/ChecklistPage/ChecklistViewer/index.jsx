import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import ChecklistTreeView from "./ChecklistTreeView";
import { AlertCircle, ArrowLeft, ListChecks, Loader2 } from "lucide-react";

/**
 * ============================================================
 * ChecklistViewer —— 检查单只读查看器（ChecklistPage 子页面）
 * ------------------------------------------------------------
 * 场景：
 *   - 填写记录页点"查看"进入（URL 带 ?recordId=xx&view=1）
 *   - 已提交且最后修改时间超过 24h → 强制只读（不可再修改）
 * 结构：
 *   顶部标题栏（返回 / 航班号+检查单类型 / 状态徽章 / 修改按钮 / 锁定提示）
 *   + 树形只读展示（ChecklistTreeView）
 * ============================================================
 * @param {Object} props
 * @param {Object} props.flight           航班对象
 * @param {Object|null} props.loadedRecord 已加载的记录（含 header / items / videoSupervision / inspector）
 * @param {Object|null} props.template     检查单模板
 * @param {string|null} props.recordStatus 记录状态（submitted / draft / null）
 * @param {string|null} props.checkedAt    最后修改/提交时间（24h 锁定基准）
 * @param {boolean} props.isLocked         已提交且超 24h → 禁止修改
 * @param {Object} props.activeBtn         当前检查单类型（TYPE_BUTTONS 项：label / titleCls）
 * @param {Function} props.onEdit          点"修改"回调（解除只读并跳转编辑态）
 * ============================================================
 */
export default function ChecklistViewer({
    flight,
    loadedRecord,
    template,
    recordStatus,
    checkedAt,
    isLocked,
    activeBtn,
    onEdit,
}) {
    const navigate = useNavigate();

    return (
        <div className="flex h-[calc(100vh-112px)] flex-col gap-2 overflow-hidden">
            {/* 顶部标题栏 */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold">
                                <span className={cn("text-slate-900", activeBtn?.titleCls)}>{flight.flightNo}</span>{" "}
                                <span className={cn("font-normal", activeBtn?.titleCls || "text-slate-400")}>
                                    {activeBtn?.label || "调度席检查单"}
                                </span>
                            </h2>
                            {recordStatus === "submitted" && (
                                <Badge variant="success">
                                    ✓ 已提交
                                    {checkedAt && (
                                        <span className="ml-1.5 opacity-80">
                                            {new Date(checkedAt)
                                                .toLocaleString("zh-CN", { hour12: false })
                                                .slice(0, 16)}
                                        </span>
                                    )}
                                </Badge>
                            )}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                            {flight.origin} → {flight.destination} · 机型 {flight.aircraftType} · 日期{" "}
                            {flight.flightDate}
                            {loadedRecord?.inspector && (
                                <span className="ml-2">· 检查人 {loadedRecord.inspector}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        disabled={isLocked}
                        title={
                            isLocked ? `该检查单已提交超过 24 小时，不可再修改` : undefined
                        }
                        onClick={onEdit}
                    >
                        <ListChecks size={14} /> 修改
                    </Button>
                    {isLocked && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <AlertCircle size={13} /> 已锁定（提交超 24 小时）
                        </span>
                    )}
                </div>
            </div>

            {/* 树形只读展示 */}
            <div className="min-h-0 flex-1 overflow-hidden">
                {loadedRecord ? (
                    <ChecklistTreeView template={template} record={loadedRecord} />
                ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        <Loader2 className="mr-2 animate-spin" size={18} /> 正在加载记录…
                    </div>
                )}
            </div>
        </div>
    );
}
