import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { flightsApi, checklistsApi } from "../../api";
import { useChecklistStore } from "../../store/checklistStore";
import { useDraftStore } from "../../store/draftStore";
import { useTabsStore } from "../../store/tabsStore";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge, flightTypeVariant } from "../../components/ui/badge";
import FlowChart from "../../components/flowchart/FlowChart";
import DraggableThumb from "../../components/checklist/DraggableThumb";
import DraftDropdown from "./components/DraftDropdown";
import FlightInfoCard from "./components/FlightInfoCard";
import { cn } from "../../lib/utils";
import {
    ArrowLeft,
    Save,
    Loader2,
    Workflow,
    ListChecks,
    ExternalLink,
    MonitorPlay,
    Camera,
    CheckCircle2,
    Circle,
    CircleDot,
    Map,
    MapPin,
    Bell,
    X,
} from "lucide-react";

const STATUS_OPTIONS = [
    { value: "", label: "待检查" },
    { value: "ok", label: "正常" },
    { value: "abnormal", label: "异常" },
    { value: "na", label: "不适用" },
];

// 东八区：本地 = UTC + 8 小时
const TZ_OFFSET_HOURS = 8;

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
    const auxPanelRef = useRef(null);
    const videoPanelRef = useRef(null);
    const mainTableRef = useRef(null); // 主要监控指标滚动容器（滚轮 → 水平移动）

    // 主要监控指标：当内容横向溢出时，鼠标滚轮上下滚动 → 水平移动（幅度 0.4 + smooth 平滑）
    // 用 callback ref：元素每次挂载/卸载都会自动绑定/解绑（避免视图切换后 handler 丢失）
    const onMainWheel = useCallback((e) => {
        const el = mainTableRef.current;
        if (!el) return;
        if (el.scrollWidth > el.clientWidth + 1) {
            e.preventDefault();
            el.scrollBy({ left: e.deltaY, behavior: "smooth" });
        }
    }, []);

    const setMainTableRef = useCallback(
        (el) => {
            if (mainTableRef.current) {
                mainTableRef.current.removeEventListener("wheel", onMainWheel);
            }
            mainTableRef.current = el;
            if (el) {
                el.addEventListener("wheel", onMainWheel, { passive: false });
            }
        },
        [onMainWheel]
    );

    // 加载航班 + 模板 + 已有记录
    useEffect(() => {
        reset();
        setFlightLoading(true);
        (async () => {
            try {
                const f = await flightsApi.get(flightId);
                setFlight(f);
                const tplId = f.category === "客运航班" ? "passenger-checklist" : "cargo-checklist";
                await loadTemplate(tplId);

                const recordId = searchParams.get("recordId");
                if (recordId) {
                    const rec = await checklistsApi.getRecord(recordId);
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
    }, [flightId]);

    // 当前检查单的节点结构
    const nodes = useMemo(() => {
        if (!template || !flight) return [];
        return template.flightTypes?.[flight.flightType || "常规航班"] || [];
    }, [template, flight]);

    const getSeq = (n) => n?.source?.seq ?? n?.seq;

    // 视频监管项已嵌套在 auxiliary.auxiliary[] 中（串联结构）
    const videoByNode = useMemo(() => {
        const map = {};
        nodes.forEach((n) => {
            const list = [];
            (n.auxiliaries || []).forEach((a) => {
                (a.auxiliary || []).forEach((v) => {
                    list.push({
                        uuid: v.uuid,
                        groupTitle: v.group || "",
                        desc: v.desc,
                        row: v.source?.row,
                        auxName: a.name,
                    });
                });
            });
            if (list.length) map[getSeq(n)] = list;
        });
        return map;
    }, [nodes]);

    // 状态映射（流程图高亮）
    const statusMap = useMemo(() => {
        const map = {};
        nodes.forEach((n) => {
            const seq = getSeq(n);
            const st = items[`main-${seq}`]?.status;
            if (st === "ok") map[seq] = "done";
            else if (st === "abnormal" || st === "na") map[seq] = "current";
        });
        return map;
    }, [nodes, items]);

    // 当前激活的节点
    const activeNode = useMemo(
        () => nodes.find((n) => getSeq(n) === currentStep) || nodes[0] || null,
        [nodes, currentStep]
    );
    const activeSeq = activeNode ? getSeq(activeNode) : null;

    // 聚焦节点：更新步骤 + banner（常驻）+ 三栏各自滚动锚定
    const focusNode = (n) => {
        const seq = getSeq(n);
        setCurrentStep(seq);
        setBanner({
            title: `节点 ${seq} · ${n.name}`,
            desc: n.desc || "无时间要求",
            auxCount: n.auxiliaries?.length || 0,
            videoCount: videoByNode[seq]?.length || 0,
            responsible: n.responsible,
        });
        // 辅助项滚动到锚点（主要监控不自动滚动，用户手动用滚轮平移）
        if (auxPanelRef.current) {
            const el = document.getElementById(`aux-anchor-${seq}`);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        // 第三栏：视频项滚动到锚点
        if (videoPanelRef.current) {
            const el = document.getElementById(`video-anchor-${seq}`);
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

    const getStatusBadge = (status) => {
        if (!status) return <Circle size={15} className="text-slate-300" />;
        if (status === "ok") return <CheckCircle2 size={15} className="text-emerald-500" />;
        if (status === "abnormal") return <CircleDot size={15} className="text-red-500" />;
        return <Circle size={15} className="text-slate-400" />;
    };

    // ===== 落地时间联动（东8区）=====
    const landingLocal = header.landingTimeLocal || "";
    const landingUtc = header.landingTimeUtc || "";
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

    return (
        <div className="flex h-[calc(100vh-112px)] flex-col gap-2 overflow-hidden">
            {/* ===== 顶部固定区：标题 + 航班信息字段 + 操作按钮（均固定不滚） ===== */}
            <div className="shrink-0 space-y-2">
                {/* 行1：标题 + 字段区 + 操作按钮 */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                            <ArrowLeft size={18} />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">
                                    {flight.flightNo} <span className="font-normal text-slate-400">调度席检查单</span>
                                </h2>
                                <Badge variant={flightTypeVariant(flight.flightType)}>{flight.flightType}</Badge>
                                <Badge>{flight.category}</Badge>
                                {recordStatus && (
                                    <Badge variant={recordStatus === "submitted" ? "success" : "warning"}>
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
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-400">
                                {flight.origin} → {flight.destination} · 机型 {flight.aircraftType} · 日期{" "}
                                {flight.flightDate}
                            </div>
                        </div>
                    </div>

                    {/* 航班信息字段区 —— 待修改（占位，后续合并重构） */}
                    <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/40 p-2 text-center text-[11px] text-amber-600">
                        航班信息字段区（待修改）
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex rounded-lg border border-slate-200 p-0.5">
                            <button
                                onClick={() => setViewMode("form")}
                                className={cn(
                                    "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                    viewMode === "form"
                                        ? "bg-primary-600 text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                <ListChecks size={14} /> 检查项目
                            </button>
                            <button
                                onClick={() => setViewMode("flow")}
                                className={cn(
                                    "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                                    viewMode === "flow"
                                        ? "bg-primary-600 text-white"
                                        : "text-slate-600 hover:bg-slate-100"
                                )}
                            >
                                <Workflow size={14} /> 流程图
                            </button>
                        </div>
                        <Button
                            variant={thumbVisible ? "default" : "outline"}
                            size="sm"
                            onClick={() => setThumbVisible((v) => !v)}
                        >
                            <Map size={14} /> {thumbVisible ? "隐藏小地图" : "显示小地图"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/flowchart/${flight.id}`)}>
                            <ExternalLink size={14} /> 独立展示
                        </Button>
                        {/* 检查人已迁移到提交表单保存（不再在顶部工具栏显示） */}
                        {/* 草稿箱（在保存草稿按钮后） */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSave("draft")}
                            disabled={saveStatus === "saving"}
                        >
                            {saveStatus === "saving" ? (
                                <Loader2 className="animate-spin" size={14} />
                            ) : (
                                <Save size={14} />
                            )}
                            保存草稿
                        </Button>
                        <DraftDropdown
                            onSelect={(d) => {
                                setRecordStatus(null);
                                navigate(`/checklist/${d.flightId}`);
                            }}
                        />
                        <Button size="sm" onClick={() => handleSave("submitted")} disabled={saveStatus === "saving"}>
                            {saveStatus === "saving" ? (
                                <Loader2 className="animate-spin" size={14} />
                            ) : (
                                <CheckCircle2 size={14} />
                            )}
                            提交
                        </Button>
                        {savedFlash && <span className="text-xs text-emerald-600">✓ 已保存</span>}
                    </div>
                </div>
            </div>

            {/* ===== 顶部 banner（常驻，不自动消失，可手动关闭）—— 悬浮在窗体顶部居中 ===== */}
            {banner && (
                <div className="fixed left-1/2 top-0 z-[60] w-[620px] max-w-[92vw] -translate-x-1/2">
                    <div className="mt-2 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/95 px-4 py-3 shadow-lg backdrop-blur">
                        <Bell size={18} className="mt-0.5 shrink-0 text-amber-500" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                                <MapPin size={13} />
                                {banner.title}
                                {banner.responsible && (
                                    <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700">
                                        {banner.responsible}
                                    </span>
                                )}
                            </div>
                            <div className="mt-0.5 text-xs text-amber-700">{banner.desc}</div>
                            <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-amber-600">
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
                <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)]">
                    {/* ===== 第一行：主要监控指标（跨两列，占满顶部） ===== */}
                    <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white lg:col-span-2">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                <ListChecks size={13} className="text-primary-600" />
                                主要监控指标
                            </div>
                            <span className="text-[10px] text-slate-400">{nodes.length} 节点</span>
                        </div>
                        <div ref={setMainTableRef} className="max-h-[32vh] overflow-x-auto overflow-y-auto">
                            {/* nodes 横向排布（flex row nowrap）：超宽出现横向滚动条，滚轮上下 → 水平移动 */}
                            <div className="flex flex-nowrap items-stretch gap-2 p-2">
                                {nodes.map((n) => {
                                    const seq = getSeq(n);
                                    const mainKey = `main-${seq}`;
                                    const mainItem = items[mainKey] || {};
                                    const isActive = currentStep === seq;
                                    return (
                                        <div
                                            key={mainKey}
                                            id={`main-${seq}`}
                                            onClick={() => focusNode(n)}
                                            className={cn(
                                                "flex w-[240px] shrink-0 cursor-pointer flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-2.5 transition-colors hover:bg-primary-50/40",
                                                isActive && "border-amber-300 bg-amber-50/70"
                                            )}
                                        >
                                            {/* 序号 + 名称 */}
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={cn(
                                                        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                                                        isActive
                                                            ? "bg-amber-400 text-white"
                                                            : "bg-primary-50 text-primary-700"
                                                    )}
                                                >
                                                    {seq}
                                                </span>
                                                <span
                                                    className="truncate text-[13px] font-semibold text-slate-800"
                                                    title={n.name}
                                                >
                                                    {n.name}
                                                </span>
                                            </div>
                                            {/* 描述 */}
                                            <div className="truncate text-[11px] text-slate-400" title={n.desc || "—"}>
                                                {n.desc || "—"}
                                            </div>
                                            {/* 标签 */}
                                            <div className="flex flex-wrap gap-1">
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
                                                {videoByNode[seq]?.length > 0 && (
                                                    <span className="rounded bg-sky-50 px-1 py-0.5 text-[9px] text-sky-600">
                                                        视频 {videoByNode[seq].length}
                                                    </span>
                                                )}
                                            </div>
                                            {/* 完成情况 + 时间 */}
                                            <div className="mt-auto flex items-center gap-1.5 pt-1">
                                                <select
                                                    className="input min-w-0 flex-1 px-1 py-1 text-[11px]"
                                                    value={mainItem.status || ""}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => {
                                                        setItemValue(mainKey, "status", e.target.value);
                                                        focusNode(n);
                                                    }}
                                                >
                                                    {STATUS_OPTIONS.map((o) => (
                                                        <option key={o.value} value={o.value}>
                                                            {o.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <input
                                                    className="input w-[72px] shrink-0 px-1 py-1 text-[11px]"
                                                    placeholder="HH:mm"
                                                    value={mainItem.time || ""}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => setItemValue(mainKey, "time", e.target.value)}
                                                />
                                            </div>
                                            {/* 状态徽章 */}
                                            {mainItem.status && (
                                                <div className="flex items-center">
                                                    {getStatusBadge(mainItem.status)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {nodes.length === 0 && (
                                    <div className="px-3 py-8 text-center text-slate-400">
                                        该航班类型的检查单暂未配置
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ===== 第二行左列：辅助监控指标 ===== */}
                    <div className="min-h-0 min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                <ListChecks size={13} className="text-primary-600" />
                                辅助监控指标
                                <span className="text-[10px] font-normal text-slate-400">
                                    {activeNode?.auxiliaries?.length || 0} 项
                                </span>
                            </div>
                            {activeNode && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                                    {activeSeq}. {activeNode.name}
                                </span>
                            )}
                        </div>
                        <div
                            ref={auxPanelRef}
                            className="max-h-[45vh] space-y-2 overflow-y-auto p-2.5 lg:h-full lg:max-h-none"
                        >
                            {activeNode ? (
                                activeNode.auxiliaries?.length ? (
                                    activeNode.auxiliaries.map((a, ai) => {
                                        const aKey = `aux-${a.row}`;
                                        const aItem = items[aKey] || {};
                                        return (
                                            <div
                                                key={aKey}
                                                id={ai === 0 ? `aux-anchor-${activeSeq}` : undefined}
                                                className="scroll-mt-2 rounded-lg border border-slate-200 p-2.5"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-[13px] font-medium text-slate-700">
                                                        ↳ {a.name}
                                                    </span>
                                                    <select
                                                        className="input w-20 px-1.5 py-0.5 text-[11px]"
                                                        value={aItem.status || ""}
                                                        onChange={(e) => setItemValue(aKey, "status", e.target.value)}
                                                    >
                                                        {STATUS_OPTIONS.map((o) => (
                                                            <option key={o.value} value={o.value}>
                                                                {o.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mt-1 text-[11px] text-slate-500">{a.desc || "—"}</div>
                                                <div className="mt-1.5 flex items-center gap-1.5">
                                                    <input
                                                        className="input w-[72px] px-1.5 py-0.5 text-[11px]"
                                                        placeholder="时间"
                                                        value={aItem.time || ""}
                                                        onChange={(e) => setItemValue(aKey, "time", e.target.value)}
                                                    />
                                                    <textarea
                                                        className="input flex-1 resize-y px-1.5 py-0.5 text-[11px]"
                                                        rows={1}
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

                    {/* 第二行右列：视频监管检查重点 */}
                    <div className="min-h-0 min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                <Camera size={13} className="text-sky-600" />
                                视频监管检查重点
                                <span className="text-[10px] font-normal text-slate-400">
                                    {videoByNode[activeSeq]?.length || 0} 项
                                </span>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                                <MonitorPlay size={11} /> 截图 / 人工评价
                            </span>
                        </div>
                        <div
                            ref={videoPanelRef}
                            className="max-h-[45vh] space-y-2 overflow-y-auto p-2.5 lg:h-full lg:max-h-none"
                        >
                            {activeNode && videoByNode[activeSeq]?.length ? (
                                videoByNode[activeSeq].map((v, vi) => {
                                    const vKey = `video-${v.uuid}`;
                                    const vItem = videoItems[vKey] || {};
                                    return (
                                        <div
                                            key={vKey}
                                            id={vi === 0 ? `video-anchor-${activeSeq}` : undefined}
                                            className="scroll-mt-2 rounded-lg border border-sky-100 bg-sky-50/40 p-2.5"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    {v.groupTitle && (
                                                        <div className="text-[13px] font-medium text-sky-600">
                                                            {v.groupTitle}
                                                        </div>
                                                    )}
                                                    <div className="mt-0.5 text-[11px] leading-snug text-slate-600">
                                                        {v.desc}
                                                    </div>
                                                </div>
                                                <select
                                                    className="input w-[76px] shrink-0 px-1.5 py-0.5 text-[11px]"
                                                    value={vItem.status || ""}
                                                    onChange={(e) => setVideoValue(vKey, "status", e.target.value)}
                                                >
                                                    {STATUS_OPTIONS.map((o) => (
                                                        <option key={o.value} value={o.value}>
                                                            {o.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <textarea
                                                className="input mt-1.5 w-full resize-y px-1.5 py-0.5 text-[11px]"
                                                rows={1}
                                                placeholder="备注 / 截图信息（可换行）"
                                                value={vItem.note || ""}
                                                onChange={(e) => setVideoValue(vKey, "note", e.target.value)}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                                    该节点无视频监管项
                                </div>
                            )}
                        </div>
                    </div>
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
