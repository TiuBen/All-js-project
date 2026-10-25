import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../../../utils/cn";
import { Button } from "../../../../components/ui/button";
// useChecklistStore + 类型配色（typeColorOf 等）都来自 store，一份 import 拿全
import { useChecklistStore, typeColorOf } from "../../../../store/checklist.store";

/**
 * ============================================================
 * InfoDisplay —— 工具栏左侧的「航班 + 检查单」信息区
 * ------------------------------------------------------------
 * ★ **零 props、零 children**：信息与返回按钮全部自理
 *     flight                    航班号 / 航线 / 机型 / 日期
 *     recordStatus / checkedAt  状态徽章（草稿 / 已提交 + 时间）
 *
 * ★ 类型配色表（TYPE_COLORS / typeColorOf 等）定义在 **checklist.store.js**。
 *
 * ============================================================
 */
export default function InfoDisplay() {
    const navigate = useNavigate();
    const flight = useChecklistStore((s) => s.flight);
    const tplId = useChecklistStore((s) => s.template?.id);
    const recordStatus = useChecklistStore((s) => s.recordStatus);
    const checkedAt = useChecklistStore((s) => s.checkedAt);
    const recordId = useChecklistStore((s) => s.recordId);

    return (
        <div className="flex items-center gap-2">
            {/* 返回到检查单草稿页 */}
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
            </Button>
            <div style={{ color: typeColorOf(tplId) }}>
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">
                        <span>{flight?.flightNo}</span> <span>{tplId}</span>
                    </h2>
                    {/* 新建 / 修改态：提交按钮据此调不同方法，先在这里讲明白 */}
                    <span
                        className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                            recordId ? "bg-indigo-50 text-indigo-700" : "bg-sky-50 text-sky-700"
                        )}
                        title={
                            recordId
                                ? `正在修改第 ${recordId} 号记录（提交 = 更新这一条）`
                                : "新建：提交会新增一条检查单记录"
                        }
                    >
                        {recordId ? `修改 #${recordId}` : "新建"}
                    </span>
                    {/* 状态徽章（草稿 / 已提交+时间）：直接内联，不再拆独立组件 */}
                    {recordStatus && (
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                                recordStatus === "submitted"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                            )}
                        >
                            {recordStatus === "submitted" ? (
                                <>
                                    ✓ 已提交
                                    {checkedAt && (
                                        <span className="ml-1.5 opacity-80">
                                            {new Date(checkedAt)
                                                .toLocaleString("zh-CN", { hour12: false })
                                                .slice(0, 16)}
                                        </span>
                                    )}
                                </>
                            ) : (
                                "草稿"
                            )}
                        </span>
                    )}
                </div>
                <div>
                    {flight?.origin || "起飞机场"} → {flight?.destination || "目的地机场"} · 机型 {flight?.aircraftType}{" "}
                    · 日期 {flight?.flightDate}
                </div>
            </div>
        </div>
    );
}
