/**
 * ============================================================
 * RecordsPage —— 填写记录页
 * ------------------------------------------------------------
 * 与「航班列表」同构：左侧 Sidebar（搜索 + 日期 + 操作）+ 右侧表格。
 * 两个组件**零 props**：数据与动作全部走 records.store。
 * ------------------------------------------------------------
 * ★ **日期口径 = 创建日（created_at 的北京日，后端回显 createdDate）**
 *   表格按"这份检查单是哪天填写的"归档，左侧日历的红/绿数字徽标、
 *   以及后端 list 的 date / from-to 过滤口径完全一致；
 *   之后再做修改不会把记录挪到别的日期下（区分"创建日期"与"最后更新"两列）。
 * ★ 异常数 = items + video_supervision 里 status === 'abnormal' 的项数
 *   （records.store 的 countAbnormal，与日历徽标的红/绿判定同源）
 * ★ 行内/左栏的操作各对应一种后端语义（互不覆盖，同一航班可有多份检查单）：
 *   查看 → 详情页 /checklists/:id
 *   修改 → 编辑器 ?record=<id> → 提交走 PUT，只改这一条
 *   删除 → DELETE /api/checklist/:id，只删这一条
 * ============================================================
 */
import { useEffect } from "react";
import { Card, CardHeader, CardTitle } from "../../components/ui/card";
import ContentLayout from "../../Layout/ContentLayout";
import RecordsSidebar from "./components/RecordsSidebar";
import RecordsTable from "./components/RecordsTable";
import { Loader2 } from "lucide-react";
import { useAppStore, dateFilterKeyOf } from "../../store/app.store";
import { useRecordsStore } from "../../store/records.store";

export default function RecordsPage() {
    // ===== 全部从 records.store 订阅 =====
    const visible = useRecordsStore((s) => s.visible);
    const abnormalCount = useRecordsStore((s) => s.abnormalCount);
    const loading = useRecordsStore((s) => s.loading);
    const error = useRecordsStore((s) => s.error);
    const selectedId = useRecordsStore((s) => s.selectedId);
    const fetchRecords = useRecordsStore((s) => s.fetchRecords);
    const fetchDayMarkers = useRecordsStore((s) => s.fetchDayMarkers);
    const refreshKey = useRecordsStore((s) => s.refreshKey);

    // 日期筛选（与航班列表页共用同一处全局状态）
    const dateKey = useAppStore(dateFilterKeyOf);
    const mode = useAppStore((s) => s.mode);
    const selectedDate = useAppStore((s) => s.selectedDate);
    const rangeFrom = useAppStore((s) => s.rangeFrom);
    const rangeTo = useAppStore((s) => s.rangeTo);

    // 日期变化、手动刷新、提交记录后（records.store.refresh() 提 key）都重新拉取
    useEffect(() => {
        // 后端未启动时请求失败 → store 已写 error 态，这里只兜住未处理 rejection
        fetchRecords().catch(() => {});
        fetchDayMarkers();
    }, [fetchRecords, fetchDayMarkers, refreshKey, dateKey]);

    // 选中行的显示名（换日期后由下方清空：换了日期还留着上一条的选中态是不对的）
    const selected = useRecordsStore((s) =>
        s.selectedId == null ? null : (s.visible.find((r) => r.id === s.selectedId) ?? null)
    );
    const selectedLabel = selected?.callsign || selected?.id;

    // 当前日期筛选说明（表头副标题）
    const dateLabel = mode === "single" ? selectedDate : `${rangeFrom || "—"} ~ ${rangeTo || "—"}`;

    return (
        <ContentLayout
            sidebar={<RecordsSidebar />}
        >
            {/* 右侧：检查单填写记录表格 */}
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <CardHeader className="shrink-0">
                    <div className="flex items-center gap-3">
                        <CardTitle>
                            填写记录{" "}
                            {visible.length > 0 && (
                                <span className="ml-1 text-xs font-normal text-slate-400">
                                    共 {visible.length} 条
                                </span>
                            )}
                        </CardTitle>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            创建日 {dateLabel}
                        </span>
                        {abnormalCount > 0 && (
                            <span className="rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                                含异常 {abnormalCount} 条
                            </span>
                        )}
                        {selectedId != null && selectedLabel && (
                            <span className="text-sm font-semibold text-green-700">已选中：{selectedLabel}</span>
                        )}
                        {loading && <Loader2 className="animate-spin text-slate-400" size={16} />}
                    </div>
                </CardHeader>

                {error && (
                    <div className="mx-3 mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600">
                        加载失败：{error}
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-auto">
                    <RecordsTable />
                </div>
            </Card>
        </ContentLayout>
    );
}
