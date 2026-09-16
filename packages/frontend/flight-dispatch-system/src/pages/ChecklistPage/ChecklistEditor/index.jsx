import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
// ahooks 的 useLocalStorageState：布局偏好（视图模式 / 小地图 / 三栏可见性）本地持久化
import { useLocalStorageState } from "ahooks";
import { useChecklistStore } from "../../../store/checklistStore";
import { useDraftStore } from "../../../store/draftStore";
import { useRecordsStore } from "../../../store/recordsStore";
import { Card, CardContent } from "../../../components/ui/card";
import ChecklistToolbar from "../ToolBar";
import ResizableColumns from "../CommonComponents/ResizableColumns";
import PanelSwitcher from "../CommonComponents/PanelSwitcher";
import MainMonitoringPanel from "./Components/MainMonitoringPanel";
import AuxiliaryPanel from "./Components/AuxiliaryPanel";
import VideoPanel from "./Components/VideoPanel";
import TimeFormulaEngine from "./Components/TimeFormulaEngine";
import { MainFlowView, FlowThumbView } from "./Components/FlowStatusView";
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

// 检查单页布局偏好（视图模式 / 小地图 / 三栏可见性）：本地持久化
const UI_PREFS_KEY = "checklist_ui_prefs";
const DEFAULT_UI_PREFS = { viewMode: "form", thumbVisible: false, panels: ["main", "aux", "video"] };

/**
 * ============================================================
 * ChecklistEditor —— 检查单填写/编辑页（ChecklistPage 子页面）
 * ------------------------------------------------------------
 * 负责检查单编辑态的全部交互：
 *   - 顶部工具栏（类型下拉 / 面板切换 / 流程图 / 草稿箱 / 提交）
 *   - 三列面板（主要 / 辅助 / 视频，可拖拽调整宽度）
 *   - 流程图全屏视图 / 右下角缩略图小窗
 *   - 24h 锁定拦截、落地时间本地/UTC 联动
 *
 * ★ 重渲染约定（改动本文件务必遵守）
 *   本组件**不订阅 items / header / videoItems**，只用细粒度 selector 取
 *   template / videoFocus / currentStep / saveStatus 与若干稳定 action。
 *   原因：一旦订阅 items，"编辑某一项"就会让整个编辑页（工具栏 + 三列 + 流程图）
 *   全部重渲染，memo 卡片也随 formulaCtx 重建而集体失效。
 *   各项数据由真正需要它的组件自己去订阅：
 *     - 主/辅助面板       → useChecklistStore(s => s.items)
 *     - 视频监管单项       → useVideoCheckItem(vCheckId)
 *     - 流程图 / 小地图    → Components/FlowStatusView
 *     - 公式自动计算       → Components/TimeFormulaEngine
 *     - 草稿落盘           → store/checklistStore 内部（改一项时防抖写 localStorage）
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

    // ===== 细粒度订阅：只取"会影响整页布局/标题"的状态，内容类状态一概不订阅 =====
    // store 里的 action 在 create 时定义一次，引用永久稳定，用 selector 取也不会引发重渲染
    const template = useChecklistStore((s) => s.template);
    const videoFocus = useChecklistStore((s) => s.videoFocus);
    const currentStep = useChecklistStore((s) => s.currentStep);
    const saveStatus = useChecklistStore((s) => s.saveStatus);
    const setHeaderField = useChecklistStore((s) => s.setHeaderField);
    const setItemValue = useChecklistStore((s) => s.setItemValue);
    const setCurrentStep = useChecklistStore((s) => s.setCurrentStep);
    const setDraftPersistEnabled = useChecklistStore((s) => s.setDraftPersistEnabled);

    // 草稿箱的删除入口（提交成功后清掉该航班草稿）
    const removeDraft = useDraftStore((s) => s.removeDraft);

    // ===== 布局偏好：本地持久化（不同步到其他标签页）=====
    const [uiPrefs, setUiPrefs] = useLocalStorageState(UI_PREFS_KEY, {
        defaultValue: DEFAULT_UI_PREFS,
    });
    const prefs = uiPrefs || DEFAULT_UI_PREFS;
    const viewMode = prefs.viewMode || "form"; // form | flow
    const thumbVisible = !!prefs.thumbVisible; // 右下角缩略图（默认不显示，点"显示小地图"开启）

    // 逐字段 setter：值未变化时返回原对象 → ahooks 内部 Object.is 判定相等，跳过 setState 与落盘
    const setViewMode = useCallback(
        (next) =>
            setUiPrefs((p) => {
                const cur = p || DEFAULT_UI_PREFS;
                const value = typeof next === "function" ? next(cur.viewMode || "form") : next;
                return value === cur.viewMode ? cur : { ...cur, viewMode: value };
            }),
        [setUiPrefs]
    );
    const setThumbVisible = useCallback(
        (next) =>
            setUiPrefs((p) => {
                const cur = p || DEFAULT_UI_PREFS;
                const value = typeof next === "function" ? next(!!cur.thumbVisible) : next;
                return value === !!cur.thumbVisible ? cur : { ...cur, thumbVisible: value };
            }),
        [setUiPrefs]
    );

    const [banner, setBanner] = useState(null); // 顶部提示（常驻，不自动消失）
    const [saveError, setSaveError] = useState(null); // 保存失败提示（常驻，可关闭）
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

    // 公式求值上下文（引用稳定，不随 items 变化）—— 卡片 memo 的前提之一
    const { formulaCtx, getNodeId } = useTimeFormulas({ template, nodes, flight });

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

    // 当前激活的节点（辅助栏标题/列表由此驱动）
    const activeNode = useMemo(
        () => nodes.find((n) => getNodeId(n) === currentStep) || nodes[0] || null,
        [nodes, currentStep]
    );
    const activeNodeId = activeNode ? getNodeId(activeNode) : null;

    // ===== 三列面板显示切换（Segmented Control 多选：主要 / 辅助 / 视频） =====
    // 是否有辅助监控节点（客运模板无辅助项 → "辅助"按钮禁用，自动降为 2 列）
    const hasAux = useMemo(() => nodes.some((n) => (n.auxiliaries || []).length > 0), [nodes]);
    // 默认三列全开 1:1:1；无辅助节点时自动去掉"辅助"
    const panels = prefs.panels && prefs.panels.length ? prefs.panels : DEFAULT_UI_PREFS.panels;
    const setPanels = useCallback(
        (updater) =>
            setUiPrefs((p) => {
                const cur = p || DEFAULT_UI_PREFS;
                const prev = cur.panels && cur.panels.length ? cur.panels : DEFAULT_UI_PREFS.panels;
                const next = typeof updater === "function" ? updater(prev) : updater;
                return next === prev ? cur : { ...cur, panels: next };
            }),
        [setUiPrefs]
    );
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
        await useChecklistStore.getState().loadTemplate(tplId);
        // 模板为旧结构（flightTypes）且目标类型不存在时回退第一个可用类型
        const tpl = useChecklistStore.getState().template;
        if (tpl?.flightTypes && !tpl.flightTypes[flightType]) {
            const first = Object.keys(tpl.flightTypes)[0];
            if (first) setActiveType(first);
        }
    };

    // 聚焦节点：更新步骤 + banner（常驻）+ 辅助栏滚动锚定（保留主要/辅助联动）
    // useCallback：引用稳定，否则 memo 卡片会因回调变化而全部重渲染
    const focusNode = useCallback(
        (n) => {
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
        },
        [getNodeId, setCurrentStep, videoTotal]
    );

    /**
     * 提交（落地到后端）—— 页面上唯一的显式保存动作
     * 未提交过程中的内容由 store 内部防抖自动落本地草稿，不再需要"保存草稿"按钮
     */
    const handleSubmit = async () => {
        // 24h 锁定：已提交超时后禁止再修改/提交（前端拦截，后端同样拒绝）
        if (isLocked) {
            setSaveError(`该检查单已提交超过 ${LOCK_HOURS} 小时，不可再修改`);
            return;
        }
        try {
            const rec = await useChecklistStore.getState().save({ status: "submitted" });
            // 时间基准：updated_at（表结构已无 checked_at）
            setCheckedAt(rec.updated_at || rec.created_at || new Date().toISOString());
            setRecordStatus(rec.status);
            setSaveError(null);
            // 保存/提交成功 → 记录页数据可能已变化（如切换模板类型后 checklist_category 更新），
            // 主动失效其缓存（refreshKey+1），回到填写记录页时自动从后端拉取最新
            useRecordsStore.getState().refresh();
            // 提交成功后立即从草稿箱移除，并重置落盘签名（重新编辑时首笔改动要能再次落盘）
            if (flight) {
                removeDraft(flight.id);
                useChecklistStore.getState().resetDraftTracking();
            }
            // 一航班一检查单的关联（fips/manual_fips.checklist_uuid）由后端在 create/update 时自动同步，无需前端额外标记
        } catch (err) {
            console.error("save failed:", err);
            setSaveError(err.message || "保存失败，请重试");
        }
    };

    // 已提交的记录不再产生草稿（store 内部据此短路落盘）
    useEffect(() => {
        setDraftPersistEnabled(recordStatus !== "submitted");
    }, [recordStatus, setDraftPersistEnabled]);

    // 页面隐藏 / 关闭 / 组件卸载 → 立刻把防抖中的草稿落盘（来不及等到 800ms 也不丢）
    useEffect(() => {
        const flush = () => useChecklistStore.getState().flushDraft();
        const onVisibility = () => {
            if (document.visibilityState === "hidden") flush();
        };
        window.addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.removeEventListener("pagehide", flush);
            document.removeEventListener("visibilitychange", onVisibility);
            flush();
        };
    }, []);

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
            {/* ===== 公式时间自动计算（无 UI，只订阅 items，不牵动本组件） ===== */}
            <TimeFormulaEngine template={template} nodes={nodes} formulaCtx={formulaCtx} getNodeId={getNodeId} />

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
                    onSubmit={handleSubmit}
                    recordStatus={recordStatus}
                    checkedAt={checkedAt}
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
                /* ============ 流程图全屏视图（状态映射由容器自行订阅 items） ============ */
                <Card className="min-h-0 flex-1 overflow-hidden">
                    <CardContent>
                        <MainFlowView
                            nodes={nodes}
                            getNodeId={getNodeId}
                            currentStep={currentStep}
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
                                        formulaCtx={formulaCtx}
                                        panelRef={auxPanelRef}
                                        setItemValue={setItemValue}
                                    />
                                ),
                            },
                            panels.includes("video") && {
                                key: "video",
                                content: (
                                    // 视频监管数据来自前端静态模块（videoFocus 按 category 本地解析，不请求后端）；
                                    // 每条视频项自行订阅 store（useVideoCheckItem / set_vCheckIdN），此处不传 videoItems
                                    <VideoPanel
                                        videoFocus={videoFocus}
                                        category={template?.category}
                                        panelRef={videoPanelRef}
                                    />
                                ),
                            },
                        ].filter(Boolean)}
                    />
                </div>
            )}

            {/* ===== 右下角缩略图小窗（可拖动 / 可关闭；状态映射由容器自行订阅 items） ===== */}
            {thumbVisible && (
                <FlowThumbView
                    nodes={nodes}
                    getNodeId={getNodeId}
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
