import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { flightsApi, checklistsApi } from "../../api";
import { useChecklistStore } from "../../store/checklistStore";
import { useTabsStore } from "../../store/tabsStore";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";
import ChecklistEditor from "./ChecklistEditor";
import ChecklistViewer from "./ChecklistViewer";
import {
    TYPE_BUTTONS,
    TYPE_BY_LABEL,
    resolveDefaultType,
    resolveTemplateIdByRecord,
} from "./checklistTypeConfig";

// 已提交记录的可修改时限（小时）：检查时间距今超过 24h → 锁定只读，禁止再修改/提交
const LOCK_HOURS = 24;

/**
 * ============================================================
 * ChecklistPage —— 检查单页入口（路由分发）
 * ------------------------------------------------------------
 * 职责：
 *   1. 加载航班 + 已有记录（一航班一检查单：优先复用已有关联记录）+ 模板
 *   2. 判定查看/编辑态：?view=1（记录页"查看"）或已提交超 24h → ChecklistViewer
 *      否则 → ChecklistEditor
 * 说明：
 *   - 状态基准时间 = updated_at（表结构已无 checked_at），由后端 COALESCE(updated_at, created_at) 兜底
 *   - 24h 锁定：isLocked 在此计算并下发给 Editor（拦截修改/提交）与 Viewer（禁用修改按钮）
 * ============================================================
 */
export default function ChecklistPage() {
    const { flightId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setActiveTab } = useTabsStore(); // 跳转航班列表时同步顶部导航高亮

    const { template, templateLoading, flight, setFlight, loadTemplate, reset, hydrateFromRecord } =
        useChecklistStore();

    const [flightLoading, setFlightLoading] = useState(true);
    // 查看模式（从记录页点"查看"进入：?recordId=xx&view=1），树形只读展示；点"修改"切回编辑
    const [viewOnly, setViewOnly] = useState(() => searchParams.get("view") === "1");
    const [loadedRecord, setLoadedRecord] = useState(null); // 已加载的记录（查看模式用）
    const [checkedAt, setCheckedAt] = useState(null); // 时间基准：updated_at（最后修改/提交时间）
    const [recordStatus, setRecordStatus] = useState(null); // 记录状态（draft / submitted / null）

    // 加载航班 + 模板 + 已有记录（一航班一检查单：优先复用已有关联记录，绝不新建第二条）
    useEffect(() => {
        reset();
        setFlightLoading(true);
        (async () => {
            try {
                const f = await flightsApi.get(flightId);
                setFlight(f);

                // 1) 先取已有记录：
                //    - URL 带 recordId（记录页"查看/修改"进入）→ 取该记录
                //    - 否则航班已关联检查单（fips/manual_fips.checklist_uuid）→ 复用，避免新建第二条
                const recordId = searchParams.get("recordId");
                let rec = null;
                if (recordId) {
                    rec = await checklistsApi.getRecord(recordId);
                } else if (f.checklistId) {
                    rec = await checklistsApi
                        .getRecord(f.checklistId)
                        .catch((e) => {
                            console.warn("加载已有关联检查单失败（忽略）:", e.message);
                            return null;
                        });
                }
                if (rec) {
                    setLoadedRecord(rec);
                    hydrateFromRecord(rec);
                    // 时间基准：updated_at（最后修改/提交时间）——表结构已无 checked_at
                    setCheckedAt(rec.updated_at || rec.created_at || null);
                    setRecordStatus(rec.status || null);
                    // 已提交且超过 24h → 强制只读查看（不可再修改）
                    if (
                        rec.status === "submitted" &&
                        (rec.updated_at || rec.created_at) &&
                        Date.now() - new Date(rec.updated_at || rec.created_at).getTime() >
                            LOCK_HOURS * 3600 * 1000
                    ) {
                        setViewOnly(true);
                    }
                }

                // 2) 模板 id 解析优先级：
                //    ① URL tpl 参数（草稿恢复）
                //    ② 记录 header.template（category + checklistName → 精确模板，保证查看/修改与保存时一致）
                //    ③ 航班 category / 前缀规则兜底（客运→客运始发航班；货运按前缀，CSS→顺航，其他→货运过站）
                const tplParam = searchParams.get("tpl");
                let tplId = tplParam;
                if (!tplId && rec) tplId = resolveTemplateIdByRecord(rec.header?.template, f);
                if (!tplId) {
                    if (f.category === "客运航班") {
                        tplId = "客运始发航班";
                    } else {
                        const defaultBtn = TYPE_BY_LABEL[resolveDefaultType(f.flightNo)];
                        tplId = defaultBtn?.tplId || "货运过站航班";
                    }
                }
                await loadTemplate(tplId);
            } catch (err) {
                console.error("load failed:", err);
            } finally {
                setFlightLoading(false);
            }
        })();
        return () => reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flightId]);

    // 当前检查单类型：按模板 id 匹配（每个类型对应独立中文模板文件）；无匹配回退货运过站航班
    const activeBtn = TYPE_BUTTONS.find((b) => template && template.id === b.tplId) || TYPE_BUTTONS[2];

    // 已提交且最后修改时间距今超过 24h → 锁定（不可再修改/提交）
    const isLocked =
        recordStatus === "submitted" &&
        !!checkedAt &&
        Date.now() - new Date(checkedAt).getTime() > LOCK_HOURS * 3600 * 1000;

    if (flightLoading || templateLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
                <Loader2 className="animate-spin" size={28} />
                <span className="text-sm">加载检查单...</span>
            </div>
        );
    }

    if (!flight) {
        return (
            <div className="py-16 text-center text-sm text-slate-400">
                未找到航班信息
                <div className="mt-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setActiveTab("flights");
                            navigate("/");
                        }}
                    >
                        返回航班列表
                    </Button>
                </div>
            </div>
        );
    }

    // ===== 查看模式（只读树形展示，点"修改"进入编辑） =====
    if (viewOnly) {
        return (
            <ChecklistViewer
                flight={flight}
                loadedRecord={loadedRecord}
                template={template}
                recordStatus={recordStatus}
                checkedAt={checkedAt}
                isLocked={isLocked}
                activeBtn={activeBtn}
                onEdit={() => {
                    setViewOnly(false);
                    navigate(
                        `/checklist/${flight.id}?recordId=${
                            loadedRecord?.id ?? searchParams.get("recordId")
                        }`,
                        { replace: true }
                    );
                }}
            />
        );
    }

    // ===== 编辑模式（填写/保存/提交） =====
    return (
        <ChecklistEditor
            flight={flight}
            recordStatus={recordStatus}
            checkedAt={checkedAt}
            isLocked={isLocked}
            setRecordStatus={setRecordStatus}
            setCheckedAt={setCheckedAt}
            setLoadedRecord={setLoadedRecord}
            activeBtn={activeBtn}
        />
    );
}
