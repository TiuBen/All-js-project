import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { flightsApi, checklistsApi } from "../../api";
import { useChecklistStore } from "../../store/checklistStore";
import { useDraftStore, MAX_DRAFTS } from "../../store/draftStore";
import { useTabsStore } from "../../store/tabsStore";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import FlowChart from "../../components/flowchart/FlowChart";
import DraggableThumb from "./components/DraggableThumb";
import ChecklistTreeView from "../../components/checklist/ChecklistTreeView";
import FlightInfoCard from "./components/FlightInfoCard";
import MainMonitoringPanel from "./components/MainMonitoringPanel";
import AuxiliaryPanel from "./components/AuxiliaryPanel";
import VideoPanel from "./components/VideoPanel";
import PanelSwitcher from "./components/PanelSwitcher";
import ResizableColumns from "./components/ResizableColumns";
import ChecklistToolbar from "./components/ChecklistToolbar";
import useTimeFormulas from "./useTimeFormulas";
import { cn } from "../../lib/utils";
import { AlertCircle, ArrowLeft, Loader2, ListChecks, MapPin, Bell, X } from "lucide-react";

// 东八区：本地 = UTC + 8 小时
const TZ_OFFSET_HOURS = 8;

// 已提交记录的可修改时限（小时）：检查时间距今超过 24h → 锁定只读，禁止再修改/提交
const LOCK_HOURS = 24;

// 检查单类型配置（下拉菜单 5 类 + 默认类型规则）——独立配置文件可编辑
import {
    TYPE_BUTTONS,
    TYPE_BY_LABEL,
    resolveDefaultType,
    resolveTemplateIdByRecord,
} from "./checklistTypeConfig";

export default function ChecklistPage() {
    const { flightId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setActiveTab } = useTabsStore(); // 跳转航班列表时同步顶部导航高亮

    const store = useChecklistStore();
    const {
        template,
        videoFocus,
        templateLoading,
        flight,
        header,
        items,
        videoItems,
        inspector,
        currentStep,
        saveStatus,
        loadTemplate,
        setFlight,
        setHeaderField,
        setInspector,
        setItemValue,
        setItems,
        setVideoValue,
        setCurrentStep,
        hydrateFromRecord,
        save,
        reset,
    } = store;

    // 草稿箱（localStorage 自动持久化）
    const upsertDraft = useDraftStore((s) => s.upsertDraft);
    const removeDraft = useDraftStore((s) => s.removeDraft);
    const drafts = useDraftStore((s) => s.drafts);

    const [flightLoading, setFlightLoading] = useState(true);
    const [viewMode, setViewMode] = useState("form"); // form | flow
    const [savedFlash, setSavedFlash] = useState(false);
    const [checkedAt, setCheckedAt] = useState(null);
    const [recordStatus, setRecordStatus] = useState(null);
    const [banner, setBanner] = useState(null); // 顶部提示（常驻，不自动消失）
    const [saveError, setSaveError] = useState(null); // 保存失败提示（常驻，可关闭）
    const [thumbVisible, setThumbVisible] = useState(false); // 右下角缩略图（默认不显示，点"显示小地图"开启）
    // 当前检查单类型（决定节点集）：货运常规/始发/过站、客运始发/过站…
    const [activeType, setActiveType] = useState("常规航班");
    // 查看模式（从记录页点"查看"进入：?recordId=xx&view=1），树形只读展示；点"修改"切回编辑
    const [viewOnly, setViewOnly] = useState(() => searchParams.get("view") === "1");
    const [loadedRecord, setLoadedRecord] = useState(null); // 已加载的记录（查看模式用）
    const auxPanelRef = useRef(null);
    const videoPanelRef = useRef(null);

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
                    setCheckedAt(rec.checked_at || rec.updated_at || null);
                    setRecordStatus(rec.status || null);
                    // 已提交且超过 24h → 强制只读查看（不可再修改）
                    if (
                        rec.status === "submitted" &&
                        (rec.checked_at || rec.updated_at) &&
                        Date.now() - new Date(rec.checked_at || rec.updated_at).getTime() >
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
                const tpl = useChecklistStore.getState().template;
                if (tpl?.flightTypes) {
                    // 旧结构模板：客运默认首个类型（航空器始发）
                    setActiveType(Object.keys(tpl.flightTypes)[0] || "常规航班");
                } else if (tplParam) {
                    // 草稿恢复：取该模板对应的类型；共用模板（如 cargo-checklist）用前缀规则兜底
                    const sameTpl = TYPE_BUTTONS.filter((b) => b.tplId === tplParam);
                    if (sameTpl.length === 1) {
                        setActiveType(sameTpl[0].flightType);
                    } else {
                        const defaultLabel = resolveDefaultType(f.flightNo);
                        setActiveType(TYPE_BY_LABEL[defaultLabel]?.flightType || "过站航班");
                    }
                } else if (f.category !== "客运航班") {
                    // 货运（新结构 schema）：按配置的前缀规则选默认类型（CSS → 顺航；其他 → 过站货航）
                    const defaultLabel = resolveDefaultType(f.flightNo);
                    setActiveType(TYPE_BY_LABEL[defaultLabel]?.flightType || "过站航班");
                }
            } catch (err) {
                console.error("load failed:", err);
            } finally {
                setFlightLoading(false);
            }
        })();
        return () => reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flightId]);

    // 当前检查单的节点结构（新结构：顶层 schema 数组优先；兼容旧：flightTypes[activeType]）
    const nodes = useMemo(() => {
        if (!template || !flight) return [];
        return template.schema || template.flightTypes?.[activeType] || [];
    }, [template, flight, activeType]);

    // v3 公式时间计算：formulaCtx + 自动计算 effect（手动优先）
    const { formulaCtx, getNodeId } = useTimeFormulas({ template, nodes, items, header, flight, setItems });

    // 视频监管项总数：来自 videoFocus（独立视频监管重点模板，groups 结构）
    // 货运模板下隐藏 applicable="客运" 的限定条目
    const videoTotal = useMemo(() => {
        const groups = videoFocus?.groups || [];
        return groups.reduce(
            (s, g) =>
                s +
                (g.items || []).filter((it) => !(it.applicable === "客运" && template?.category !== "客运航班")).length,
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

    // ===== 检查单类型切换（下拉菜单：顺航/始发货航/过站货航/始发客运/过站客运） =====
    // 当前选中项：按模板 id 匹配（每个类型对应独立中文模板文件）；无匹配回退过站货航
    const activeBtn = TYPE_BUTTONS.find((b) => template && template.id === b.tplId) || TYPE_BUTTONS[2];

    // 点击菜单项：仅清填写数据（保留 flight/header）→ 加载对应模板 → 切换 activeType
    const switchType = async (tplId, flightType) => {
        if (!flight) return;
        useChecklistStore.setState({ items: {}, videoItems: {}, currentStep: null, recordId: null });
        setActiveType(flightType);
        setBanner(null);
        setRecordStatus(null);
        setLoadedRecord(null);
        await loadTemplate(tplId);
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

    // 已提交且检查时间距今超过 24h → 锁定（不可再修改/提交）
    const isLocked =
        recordStatus === "submitted" &&
        !!checkedAt &&
        Date.now() - new Date(checkedAt).getTime() > LOCK_HOURS * 3600 * 1000;

    const handleSave = async (status = "draft") => {
        // 24h 锁定：已提交超时后禁止再修改/提交（前端拦截，后端同样拒绝）
        if (isLocked) {
            setSaveError(`该检查单已提交超过 ${LOCK_HOURS} 小时，不可再修改`);
            return;
        }
        try {
            const rec = await save({ status });
            setSavedFlash(true);
            setCheckedAt(rec.checked_at || rec.updated_at || new Date().toISOString());
            setRecordStatus(rec.status);
            setSaveError(null);
            setTimeout(() => setSavedFlash(false), 2000);
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
                                isLocked
                                    ? `该检查单已提交超过 ${LOCK_HOURS} 小时，不可再修改`
                                    : undefined
                            }
                            onClick={() => {
                                setViewOnly(false);
                                navigate(
                                    `/checklist/${flight.id}?recordId=${
                                        loadedRecord?.id ?? searchParams.get("recordId")
                                    }`,
                                    { replace: true }
                                );
                            }}
                        >
                            <ListChecks size={14} /> 修改
                        </Button>
                        {isLocked && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <AlertCircle size={13} /> 已锁定（提交超 {LOCK_HOURS} 小时）
                            </span>
                        )}
                    </div>
                </div>

                {/* 树形只读展示 */}
                <div className="min-h-0 flex-1 overflow-hidden">
                    {loadedRecord ? (
                        <ChecklistTreeView template={template} record={loadedRecord} flight={flight} />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                            <Loader2 className="mr-2 animate-spin" size={18} /> 正在加载记录…
                        </div>
                    )}
                </div>
            </div>
        );
    }

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

            {/* ===== 顶部 banner（常驻，不自动消失，可手动关闭）—— 悬浮在窗体顶部居中 ===== */}
            {/* {banner && (
                <div className="fixed left-1/2 top-0 z-[60] w-[500px] max-w-[92vw] -translate-x-1/2">
                    <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/95 p-2  shadow-lg backdrop-blur">
                        <MapPin size={18} className=" shrink-0 text-amber-500" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2  font-semibold text-amber-800">
                                {banner.title}
                                {banner.responsible && (
                                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                                        {banner.responsible}
                                    </span>
                                )}
                            </div>
                            <div className=" text-sm text-amber-700">{banner.desc}</div>
                            <div className=" flex flex-wrap  text-sm text-amber-600">
                                {banner.auxCount > 0 && <span>● 辅助监控指标 {banner.auxCount} 项（见辅助列）</span>}
                                {banner.videoCount > 0 && (
                                    <span>● 视频监管检查重点 {banner.videoCount} 项（见视频列）</span>
                                )}
                                {banner.auxCount === 0 && banner.videoCount === 0 && (
                                    <span>● 无辅助项，请直接检查主项</span>
                                )}
                            </div>
                        </div>
                        <button
                            className="rounded p-1 text-amber-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
                            title="关闭提示"
                            onClick={() => setBanner(null)}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
            )} */}

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
