import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { flightsApi, checklistsApi } from "../../api";
import { useChecklistStore } from "../../store/checklistStore";
import { useDraftStore } from "../../store/draftStore";
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
import ChecklistToolbar from "./components/ChecklistToolbar";
import useTimeFormulas from "./useTimeFormulas";
import { cn } from "../../lib/utils";
import {
    ArrowLeft,
    Loader2,
    ListChecks,
    MapPin,
    Bell,
    X,
} from "lucide-react";

// 东八区：本地 = UTC + 8 小时
const TZ_OFFSET_HOURS = 8;

// 检查单类型配置（下拉菜单 5 类 + 默认类型规则）——独立配置文件可编辑
import { TYPE_BUTTONS, TYPE_BY_LABEL, resolveDefaultType } from "./checklistTypeConfig";

export default function ChecklistPage() {
    const { flightId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setActiveTab } = useTabsStore(); // 跳转航班列表时同步顶部导航高亮

    const store = useChecklistStore();
    const {
        template,
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

    const [flightLoading, setFlightLoading] = useState(true);
    const [viewMode, setViewMode] = useState("form"); // form | flow
    const [savedFlash, setSavedFlash] = useState(false);
    const [checkedAt, setCheckedAt] = useState(null);
    const [recordStatus, setRecordStatus] = useState(null);
    const [banner, setBanner] = useState(null); // 顶部提示（常驻，不自动消失）
    const [thumbVisible, setThumbVisible] = useState(true); // 右下角缩略图
    // 当前检查单类型（决定节点集）：货运常规/始发/过站、客运始发/过站…
    const [activeType, setActiveType] = useState("常规航班");
    // 查看模式（从记录页点"查看"进入：?recordId=xx&view=1），树形只读展示；点"修改"切回编辑
    const [viewOnly, setViewOnly] = useState(() => searchParams.get("view") === "1");
    const [loadedRecord, setLoadedRecord] = useState(null); // 已加载的记录（查看模式用）
    const auxPanelRef = useRef(null);
    const videoPanelRef = useRef(null);

    // 加载航班 + 模板 + 已有记录
    useEffect(() => {
        reset();
        setFlightLoading(true);
        (async () => {
            try {
                const f = await flightsApi.get(flightId);
                setFlight(f);
                // 模板 id：按航班类别
                const tplId = f.category === "客运航班" ? "passenger-checklist" : "cargo-checklist";
                await loadTemplate(tplId);
                const tpl = useChecklistStore.getState().template;
                if (tpl?.flightTypes) {
                    // 旧结构模板：客运默认首个类型（航空器始发）
                    setActiveType(Object.keys(tpl.flightTypes)[0] || "常规航班");
                } else if (f.category !== "客运航班") {
                    // 货运（新结构 schema）：按配置的前缀规则选默认类型（CSS → 顺航；其他 → 过站货航）
                    const defaultLabel = resolveDefaultType(f.flightNo);
                    setActiveType(TYPE_BY_LABEL[defaultLabel]?.flightType || "过站航班");
                }

                const recordId = searchParams.get("recordId");
                if (recordId) {
                    const rec = await checklistsApi.getRecord(recordId);
                    setLoadedRecord(rec);
                    hydrateFromRecord(rec);
                    setCheckedAt(rec.checked_at || rec.updated_at || null);
                    setRecordStatus(rec.status || null);
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

    // 视频监管项：新结构在节点顶层 videoSupervision[]（type video）；兼容旧 auxiliaries[].auxiliary[]
    const videoByNode = useMemo(() => {
        const map = {};
        nodes.forEach((n) => {
            const list = [];
            (n.videoSupervision || []).forEach((v) => {
                list.push({ id: v.id, uuid: v.uuid, groupTitle: v.group || "", desc: v.desc });
            });
            if (!list.length) {
                (n.auxiliaries || []).forEach((a) => {
                    (a.auxiliary || []).forEach((v) => {
                        list.push({ id: v.id, uuid: v.uuid, groupTitle: v.group || "", desc: v.desc, auxName: a.name });
                    });
                });
            }
            if (list.length) map[getNodeId(n)] = list;
        });
        return map;
    }, [nodes]);

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

    // ===== 检查单类型切换（下拉菜单：顺航/始发货航/过站货航/始发客运/过站客运） =====
    // 当前选中项（按模板类别 + activeType 匹配；无匹配回退过站货航）
    const activeBtn =
        TYPE_BUTTONS.find(
            (b) =>
                template?.category === (b.tplId === "passenger-checklist" ? "客运航班" : "货运航班") &&
                activeType === b.flightType
        ) || TYPE_BUTTONS[2];

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

    // 聚焦节点：更新步骤 + banner（常驻）+ 辅助/视频栏滚动锚定
    const focusNode = (n) => {
        const nid = getNodeId(n);
        setCurrentStep(nid);
        setBanner({
            title: `节点 ${nid} · ${n.name}`,
            desc: n.desc || "无时间要求",
            auxCount: n.auxiliaries?.length || 0,
            videoCount: videoByNode[nid]?.length || 0,
            responsible: n.responsible,
        });
        // 辅助项滚动到锚点（主要监控不自动滚动，用户手动用滚轮平移）
        if (auxPanelRef.current) {
            const el = document.getElementById(`aux-anchor-${nid}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        // 第三栏：视频项滚动到锚点
        if (videoPanelRef.current) {
            const el = document.getElementById(`video-anchor-${nid}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    };

    const handleSave = async (status = "draft") => {
        try {
            const rec = await save({ status });
            setSavedFlash(true);
            setCheckedAt(rec.checked_at || rec.updated_at || new Date().toISOString());
            setRecordStatus(rec.status);
            setTimeout(() => setSavedFlash(false), 2000);
            if (flight) {
                await flightsApi.update(flight.id, { hasChecklist: true });
            }
            // 提交成功后从草稿箱移除
            if (status === "submitted" && flight) {
                removeDraft(flight.id);
            }
        } catch (err) {
            console.error("save failed:", err);
        }
    };

    // ===== 自动同步到草稿箱（字段变化时，debounce 800ms 入 localStorage） =====
    useEffect(() => {
        if (!flight || !flight.id) return;
        if (recordStatus === "submitted") return; // 已提交的记录不同步草稿
        // 仅在实际填写了内容（status/time/note 任一有值）时才写入草稿，避免"打开页面就产生空草稿"
        const hasContent = Object.values(items).some((v) => v && (v.status || v.time || v.note));
        if (!hasContent) return;
        const t = setTimeout(() => {
            const tplId = flight.category === "客运航班" ? "passenger-checklist" : "cargo-checklist";
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
    }, [flight, header, items, videoItems, inspector, recordStatus, upsertDraft]);

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
                    onToggleFlow={() => setViewMode("flow")}
                    thumbVisible={thumbVisible}
                    onToggleThumb={() => setThumbVisible((v) => !v)}
                    saveStatus={saveStatus}
                    onSaveDraft={() => handleSave("draft")}
                    onSubmit={() => handleSave("submitted")}
                    recordStatus={recordStatus}
                    checkedAt={checkedAt}
                    savedFlash={savedFlash}
                    onSelectDraft={(d) => {
                        setRecordStatus(null);
                        navigate(`/checklist/${d.flightId}`);
                    }}
                />
            </div>

            {/* ===== 顶部 banner（常驻，不自动消失，可手动关闭）—— 悬浮在窗体顶部居中 ===== */}
            {banner && (
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
                                {banner.auxCount > 0 && <span>● 辅助监控指标 {banner.auxCount} 项（见中间栏）</span>}
                                {banner.videoCount > 0 && (
                                    <span>● 视频监管检查重点 {banner.videoCount} 项（见右侧栏）</span>
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
                /* ============ 检查项目视图：品字布局（主要监控跨两列 / 辅助 + 视频并排） ============ */
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden rounded-lg   lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)]">
                    <MainMonitoringPanel
                        nodes={nodes}
                        items={items}
                        currentStep={currentStep}
                        videoByNode={videoByNode}
                        formulaCtx={formulaCtx}
                        getNodeId={getNodeId}
                        onFocusNode={focusNode}
                        setItemValue={setItemValue}
                    />
                    <AuxiliaryPanel
                        activeNode={activeNode}
                        activeNodeId={activeNodeId}
                        items={items}
                        formulaCtx={formulaCtx}
                        panelRef={auxPanelRef}
                        setItemValue={setItemValue}
                    />
                    <VideoPanel
                        activeNodeId={activeNodeId}
                        videoByNode={videoByNode}
                        videoItems={videoItems}
                        panelRef={videoPanelRef}
                        setVideoValue={setVideoValue}
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
