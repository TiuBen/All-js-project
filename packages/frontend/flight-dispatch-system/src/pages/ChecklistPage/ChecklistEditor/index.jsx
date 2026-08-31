import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useChecklistStore } from "../../../store/checklistStore";
import { useDraftStore, MAX_DRAFTS } from "../../../store/draftStore";
import { useRecordsStore } from "../../../store/recordsStore";
import { Card, CardContent } from "../../../components/ui/card";
import FlowChart from "../../../components/flowchart/FlowChart";
import DraggableThumb from "../components/DraggableThumb";
import PanelSwitcher from "../components/PanelSwitcher";
import ResizableColumns from "../components/ResizableColumns";
import ChecklistToolbar from "./ChecklistToolbar";
import MainMonitoringPanel from "./MainMonitoringPanel";
import AuxiliaryPanel from "./AuxiliaryPanel";
import VideoPanel from "./VideoPanel";
import useTimeFormulas from "./useTimeFormulas";
import {
    TYPE_BUTTONS,
    TYPE_BY_LABEL,
    resolveDefaultType,
} from "../checklistTypeConfig";
import { AlertCircle, X } from "lucide-react";

// 东八区：本地 = UTC + 8 小时
const TZ_OFFSET_HOURS = 8;

// 已提交记录的可修改时限（小时）：检查时间距今超过 24h → 锁定只读，禁止再修改/提交
const LOCK_HOURS = 24;

/**
 * ============================================================
 * ChecklistEditor —— 检查单填写/编辑页（ChecklistPage 子页面）
 * ------------------------------------------------------------
 * 负责检查单编辑态的全部交互：
 *   - 顶部工具栏（类型下拉 / 面板切换 / 流程图 / 草稿箱 / 保存提交）
 *   - 三列面板（主要 / 辅助 / 视频，可拖拽调整宽度）
 *   - 流程图全屏视图 / 右下角缩略图小窗
 *   - 24h 锁定拦截、草稿自动同步、落地时间本地/UTC 联动
 * ============================================================
 * @param {Object} props
 * @param {Object} props.flight           航班对象
 * @param {string|null} props.recordStatus 记录状态（submitted / draft / null）
 * @param {string|null} props.checkedAt    最后修改/提交时间
 * @param {boolean} props.isLocked         已提交且超 24h → 禁止修改/提交
 * @param {Function} props.setRecordStatus 更新记录状态（入口持有，供切换类型/保存时清空或更新）
 * @param {Function} props.setCheckedAt    更新时间基准（保存后回写 updated_at）
 * @param {Function} props.setLoadedRecord 更新已加载记录（切换类型时清空）
 * @param {Object} props.activeBtn         当前检查单类型（TYPE_BUTTONS 项）
 * ============================================================
 */
export default function ChecklistEditor({
    flight,
    recordStatus,
    checkedAt,
    isLocked,
    setRecordStatus,
    setCheckedAt,
    setLoadedRecord,
    activeBtn,
}) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const store = useChecklistStore();
    const {
        template,
        videoFocus,
        header,
        items,
        videoItems,
        inspector,
        currentStep,
        saveStatus,
        setHeaderField,
        setInspector,
        setItemValue,
        setVideoValue,
        setCurrentStep,
        setItems,
        save,
    } = store;

    // 草稿箱（localStorage 自动持久化）
    const upsertDraft = useDraftStore((s) => s.upsertDraft);
    const removeDraft = useDraftStore((s) => s.removeDraft);
    const drafts = useDraftStore((s) => s.drafts);

    const [viewMode, setViewMode] = useState("form"); // form | flow
    const [savedFlash, setSavedFlash] = useState(false);
    const [banner, setBanner] = useState(null); // 顶部提示（常驻，不自动消失）
    const [saveError, setSaveError] = useState(null); // 保存失败提示（常驻，可关闭）
    const [thumbVisible, setThumbVisible] = useState(false); // 右下角缩略图（默认不显示，点"显示小地图"开启）
    // 当前检查单类型（决定节点集）：货运常规/始发/过站、客运始发/过站…
    const [activeType, setActiveType] = useState("常规航班");
    const auxPanelRef = useRef(null);
    const videoPanelRef = useRef(null);
    // 类型初始化只执行一次（模板加载完成后），避免 switchType 触发 loadTemplate 时被重置
    const typeInited = useRef(false);

    // 模板就绪后初始化 activeType（原入口加载 effect 内逻辑）：
    //   旧结构模板（flightTypes）→ 取首个类型；草稿恢复（tpl 参数）→ 按模板反查类型；否则按前缀规则兜底
    useEffect(() => {
        if (!template || !flight || typeInited.current) return;
        typeInited.current = true;
        const tplParam = searchParams.get("tpl");
        if (template.flightTypes) {
            // 旧结构模板：客运默认首个类型（航空器始发）
            setActiveType(Object.keys(template.flightTypes)[0] || "常规航班");
        } else if (tplParam) {
            // 草稿恢复：取该模板对应的类型；共用模板用前缀规则兜底
            const sameTpl = TYPE_BUTTONS.filter((b) => b.tplId === tplParam);
            if (sameTpl.length === 1) {
                setActiveType(sameTpl[0].flightType);
            } else {
                const defaultLabel = resolveDefaultType(flight.flightNo);
                setActiveType(TYPE_BY_LABEL[defaultLabel]?.flightType || "过站航班");
            }
        } else if (flight.category !== "客运航班") {
            // 货运（新结构 schema）：按配置的前缀规则选默认类型（CSS → 顺航；其他 → 过站货航）
            const defaultLabel = resolveDefaultType(flight.flightNo);
            setActiveType(TYPE_BY_LABEL[defaultLabel]?.flightType || "过站航班");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template, flight]);

    // 当前检查单的节点结构（新结构：顶层 schema 数组优先；兼容旧：flightTypes[activeType]）
    const nodes = useMemo(() => {
        if (!template || !flight) return [];
        return template.schema || template.flightTypes?.[activeType] || [];
    }, [template, flight, activeType]);

    // v3 公式时间计算：formulaCtx + 自动计算 effect（手动优先）
    const { formulaCtx, getNodeId } = useTimeFormulas({ template, nodes, items, header, flight, setItems });

    // 视频监管项总数：来自 videoFocus（独立视频监管重点模板，groups 结构）
    // 非客运模板（category 不含"客运"）下隐藏 applicable="客运" 的限定条目
    const videoTotal = useMemo(() => {
        const groups = videoFocus?.groups || [];
        const isPassenger = String(template?.category || "").includes("客运");
        return groups.reduce(
            (s, g) =>
                s +
                (g.items || []).filter((it) => !(it.applicable === "客运" && !isPassenger)).length,
            0
        );
    }, [videoFocus, template?.category]);

    // 状态映射（流程图高亮）
    const statusMap = useMemo(() => {
        const map = {};
        nodes.forEach((n) => {
            const nid = getNodeId(n);
            const st = items[`main-${nid}`]?.status;
            if (st === "ok") map[nid] = "done";
            else if (st === "abnormal" || st === "na") map[nid] = "current";
        });
        return map;
    }, [nodes, items]);

    // 当前激活的节点
    const activeNode = useMemo(
        () => nodes.find((n) => getNodeId(n) === currentStep) || nodes[0] || null,
        [nodes, currentStep]
    );
    const activeNodeId = activeNode ? getNodeId(activeNode) : null;

    // ===== 三列面板显示切换（Segmented Control 多选：主要 / 辅助 / 视频） =====
    // 是否有辅助监控节点（客运模板无辅助项 → "辅助"按钮禁用，自动降为 2 列）
    const hasAux = useMemo(() => nodes.some((n) => (n.auxiliaries || []).length > 0), [nodes]);
    // 默认三列全开 1:1:1；无辅助节点时自动去掉"辅助"
    const [panels, setPanels] = useState(["main", "aux", "video"]);
    useEffect(() => {
        setPanels((prev) => {
            if (hasAux && !prev.includes("aux")) return [...prev, "aux"];
            if (!hasAux && prev.includes("aux")) return prev.filter((p) => p !== "aux");
            return prev;
        });
    }, [hasAux]);
    // 多选切换（至少保留一个面板）
    const togglePanel = (key) =>
        setPanels((prev) =>
            prev.includes(key) ? (prev.length > 1 ? prev.filter((p) => p !== key) : prev) : [...prev, key]
        );

    // 点击菜单项：仅清填写数据（保留 flight/header）→ 加载对应模板 → 切换 activeType
    const switchType = async (tplId, flightType) => {
        if (!flight) return;
        useChecklistStore.setState({ items: {}, videoItems: {}, currentStep: null, recordId: null });
        setActiveType(flightType);
        setBanner(null);
        setRecordStatus(null);
        setLoadedRecord(null);
        await store.loadTemplate(tplId);
        // 模板为旧结构（flightTypes）且目标类型不存在时回退第一个可用类型
        const tpl = useChecklistStore.getState().template;
        if (tpl?.flightTypes && !tpl.flightTypes[flightType]) {
            const first = Object.keys(tpl.flightTypes)[0];
            if (first) setActiveType(first);
        }
    };

    // 聚焦节点：更新步骤 + banner（常驻）+ 辅助栏滚动锚定（保留主要/辅助联动）
    const focusNode = (n) => {
        const nid = getNodeId(n);
        setCurrentStep(nid);
        setBanner({
            title: `节点 ${nid} · ${n.name}`,
            desc: n.desc || "无时间要求",
            auxCount: n.auxiliaries?.length || 0,
            videoCount: videoTotal,
            responsible: n.responsible,
        });
        // 辅助项滚动到锚点（主要监控不自动滚动，用户手动用滚轮平移；辅助面板隐藏时跳过）
        if (auxPanelRef.current) {
            const el = document.getElementById(`aux-anchor-${nid}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        // 第三栏（视频）：视频监管项为全局分组列表，滚动到面板顶部
        if (videoPanelRef.current) {
            videoPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSave = async (status = "draft") => {
        // 24h 锁定：已提交超时后禁止再修改/提交（前端拦截，后端同样拒绝）
        if (isLocked) {
            setSaveError(`该检查单已提交超过 ${LOCK_HOURS} 小时，不可再修改`);
            return;
        }
        try {
            const rec = await save({ status });
            setSavedFlash(true);
            // 时间基准：updated_at（表结构已无 checked_at）
            setCheckedAt(rec.updated_at || rec.created_at || new Date().toISOString());
            setRecordStatus(rec.status);
            setSaveError(null);
            setTimeout(() => setSavedFlash(false), 2000);
            // 保存/提交成功 → 记录页数据可能已变化（如切换模板类型后 checklist_category 更新），
            // 主动失效其缓存（refreshKey+1），回到填写记录页时自动从后端拉取最新
            useRecordsStore.getState().refresh();
            // 提交成功后立即从草稿箱移除（务必放在其他可能抛错的调用之前）
            if (status === "submitted" && flight) {
                removeDraft(flight.id);
            }
            // 一航班一检查单的关联（fips/manual_fips.checklist_uuid）由后端在 create/update 时自动同步，无需前端额外标记
        } catch (err) {
            console.error("save failed:", err);
            setSaveError(err.message || "保存失败，请重试");
        }
    };

    // ===== 自动同步到草稿箱（字段变化时，debounce 800ms 入 localStorage） =====
    useEffect(() => {
        if (!flight || !flight.id) return;
        if (recordStatus === "submitted") return; // 已提交的记录不同步草稿
        // 仅在实际填写了内容（status/time/note 任一有值）时才写入草稿，避免"打开页面就产生空草稿"
        const hasContent = Object.values(items).some((v) => v && (v.status || v.time || v.note));
        if (!hasContent) return;
        // 草稿箱已满（5 个）且当前航班不在箱内时，不再自动写入，避免静默挤掉最早的草稿
        const currentDrafts = useDraftStore.getState().drafts;
        const alreadyInBox = currentDrafts.some((d) => d.flightId === flight.id);
        if (currentDrafts.length >= MAX_DRAFTS && !alreadyInBox) return;
        const t = setTimeout(() => {
            // 记录当前使用的模板 id（顺航检查单 / 货运始发航班 / 客运始发航班 …），恢复草稿时按它加载对应模板
            const tplId = template?.id || (flight.category === "客运航班" ? "客运始发航班" : "货运过站航班");
            upsertDraft({
                flightId: flight.id,
                flightNo: flight.flightNo,
                templateId: tplId,
                header,
                items,
                videoSupervision: videoItems,
                inspector,
                status: "draft",
            });
        }, 800);
        return () => clearTimeout(t);
    }, [flight, header, items, videoItems, inspector, recordStatus, upsertDraft, template?.id]);

    // ===== 落地时间联动（东8区）=====
    const setLandingFromLocal = (val) => {
        // val 形如 2026-08-06T14:30
        if (!val) {
            setHeaderField("landingTimeLocal", "");
            setHeaderField("landingTimeUtc", "");
            return;
        }
        const local = dayjs(val);
        const utc = local.subtract(TZ_OFFSET_HOURS, "hour");
        setHeaderField("landingTimeLocal", local.format("YYYY-MM-DDTHH:mm"));
        setHeaderField("landingTimeUtc", utc.format("YYYY-MM-DDTHH:mm"));
    };
    const setLandingFromUtc = (val) => {
        if (!val) {
            setHeaderField("landingTimeLocal", "");
            setHeaderField("landingTimeUtc", "");
            return;
        }
        const utc = dayjs(val);
        const local = utc.add(TZ_OFFSET_HOURS, "hour");
        setHeaderField("landingTimeUtc", utc.format("YYYY-MM-DDTHH:mm"));
        setHeaderField("landingTimeLocal", local.format("YYYY-MM-DDTHH:mm"));
    };

    return (
        <div className="flex h-[calc(100vh-90px)] flex-col gap-2 overflow-hidden">
            {/* ===== 顶部固定区：标题 + 航班信息字段 + 操作按钮（均固定不滚） ===== */}
            <div className="shrink-0 space-y-2">
                <ChecklistToolbar
                    flight={flight}
                    activeBtn={activeBtn}
                    onSwitchType={switchType}
                    viewMode={viewMode}
                    onToggleFlow={() => setViewMode((v) => (v === "flow" ? "form" : "flow"))}
                    thumbVisible={thumbVisible}
                    onToggleThumb={() => setThumbVisible((v) => !v)}
                    saveStatus={saveStatus}
                    onSaveDraft={() => handleSave("draft")}
                    onSubmit={() => handleSave("submitted")}
                    recordStatus={recordStatus}
                    checkedAt={checkedAt}
                    savedFlash={savedFlash}
                    draftFull={drafts.length >= MAX_DRAFTS && !drafts.some((d) => d.flightId === flight.id)}
                    onSelectDraft={(d) => {
                        setRecordStatus(null);
                        // 带上草稿的模板 id，恢复页面时加载对应模板（始发/过站/客运模板各不相同）
                        navigate(`/checklist/${d.flightId}?tpl=${encodeURIComponent(d.templateId || "")}`);
                    }}
                    // Segmented Control 多选：主要 / 辅助 / 视频（客运无辅助节点时"辅助"禁用）—— 渲染在工具栏"流程图"按钮前
                    panelSwitcher={
                        <div className="flex shrink-0 items-center gap-2">
                            <PanelSwitcher
                                options={[
                                    { key: "main", label: "主要" },
                                    {
                                        key: "aux",
                                        label: "辅助",
                                        disabled: !hasAux,
                                        disabledTitle: "该模板无辅助监控节点",
                                    },
                                    { key: "video", label: "视频" },
                                ]}
                                value={panels}
                                onChange={togglePanel}
                            />
                            <span className="text-[11px] text-slate-400">{panels.length} 列 · 拖拽分隔条可调宽度</span>
                        </div>
                    }
                />
            </div>

            {/* ===== 保存失败提示（常驻，不自动消失，可手动关闭） ===== */}
            {saveError && (
                <div className="fixed left-1/2 top-0 z-[70] w-[440px] max-w-[92vw] -translate-x-1/2">
                    <div className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50/95 p-2.5 shadow-lg backdrop-blur">
                        <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
                        <div className="flex-1 text-sm text-red-700">{saveError}</div>
                        <button
                            className="rounded p-1 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
                            title="关闭提示"
                            onClick={() => setSaveError(null)}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )}

            {viewMode === "flow" ? (
                /* ============ 流程图全屏视图 ============ */
                <Card className="min-h-0 flex-1 overflow-hidden">
                    <CardContent>
                        <FlowChart
                            nodes={nodes}
                            statusMap={statusMap}
                            currentStep={currentStep}
                            size="full"
                            onSelect={(n) => {
                                focusNode(n);
                                setViewMode("form");
                            }}
                        />
                    </CardContent>
                </Card>
            ) : (
                /* ============ 检查项目视图：多选切换（主要/辅助/视频）+ 可拖拽多列布局 ============ */
                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                    {/* 可拖拽多列：默认 1:1:1，列数随 panels 增减 */}
                    <ResizableColumns
                        className="min-h-0 flex-1"
                        columns={[
                            panels.includes("main") && {
                                key: "main",
                                content: (
                                    <MainMonitoringPanel
                                        nodes={nodes}
                                        items={items}
                                        currentStep={currentStep}
                                        formulaCtx={formulaCtx}
                                        getNodeId={getNodeId}
                                        onFocusNode={focusNode}
                                        setItemValue={setItemValue}
                                    />
                                ),
                            },
                            panels.includes("aux") && {
                                key: "aux",
                                content: (
                                    <AuxiliaryPanel
                                        activeNode={activeNode}
                                        activeNodeId={activeNodeId}
                                        items={items}
                                        formulaCtx={formulaCtx}
                                        panelRef={auxPanelRef}
                                        setItemValue={setItemValue}
                                    />
                                ),
                            },
                            panels.includes("video") && {
                                key: "video",
                                content: (
                                    <VideoPanel
                                        videoFocus={videoFocus}
                                        category={template?.category}
                                        videoItems={videoItems}
                                        panelRef={videoPanelRef}
                                        setVideoValue={setVideoValue}
                                    />
                                ),
                            },
                        ].filter(Boolean)}
                    />
                </div>
            )}

            {/* ===== 右下角缩略图小窗（可拖动 / 可关闭） ===== */}
            {thumbVisible && (
                <DraggableThumb
                    nodes={nodes}
                    statusMap={statusMap}
                    currentStep={currentStep}
                    onSelectNode={(n) => {
                        focusNode(n);
                        setViewMode("form");
                    }}
                    onOpenFull={() => navigate(`/flowchart/${flight.id}`)}
                    onClose={() => setThumbVisible(false)}
                />
            )}
        </div>
    );
}
