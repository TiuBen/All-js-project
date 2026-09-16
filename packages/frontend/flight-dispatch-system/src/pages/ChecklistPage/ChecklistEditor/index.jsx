import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useChecklistStore } from "../../../store/checklistStore";
import { Card, CardContent } from "../../../components/ui/card";
import ChecklistToolbar from "../ToolBar";
// 检查单面板组：「穷举法」一类型一组件，统一放 Template/ 目录，
// 各自文件顶部静态 import 自己的模板与视频监管数据（utils/*）。
// barrel 暴露 resolvePanelGroup(category) —— 新增类型只需在 Template/ 下加文件 + 补映射
import resolvePanelGroup from "./Template";
import TimeFormulaEngine from "./Components/TimeFormulaEngine";
import { MainFlowView, FlowThumbView } from "./Components/FlowStatusView";
import SaveErrorToast from "./Components/SaveErrorToast";
import useTimeFormulas from "./useTimeFormulas";
import useUiPrefs from "./useUiPrefs";
import useDraftFlush from "./useDraftFlush";
import useSubmitChecklist from "./useSubmitChecklist";

/**
 * ============================================================
 * ChecklistEditor —— 检查单填写/编辑页（ChecklistPage 子页面）
 * ------------------------------------------------------------
 * 本组件只负责"与检查单类型无关"的编排，不做具体业务：
 *   - 顶部工具栏（类型下拉 / 流程图 / 草稿箱 / 提交）
 *   - 流程图全屏视图 / 右下角缩略图小窗
 *   - 24h 锁定拦截（提交动作内）、草稿落盘兜底
 *
 * 已下沉的私有逻辑（各自一个 hook / 组件）：
 *   - 布局偏好持久化 → useUiPrefs
 *   - 草稿落盘兜底   → useDraftFlush
 *   - 提交 + 失败提示 → useSubmitChecklist / Components/SaveErrorToast
 *   - 公式上下文     → useTimeFormulas
 *
 * ★ 三列检查表由「穷举法」的面板组组件渲染
 *   按 template.category 经 resolvePanelGroup 取
 *   CargoBypassFlight / CargoInitFlight / PassengerInitFlight /
 *   PassengerBypassFlight / ShunhangFlight 之一。
 *   每个组件**静态 import** 自己那份模板与视频监管数据，编译期确定。
 *
 * ★ 重渲染约定（改动本文件务必遵守）
 *   本组件**不订阅 items / header / videoItems**，只用细粒度 selector 取
 *   template / currentStep / saveStatus 与若干稳定 action。
 *   原因：一旦订阅 items，"编辑某一项"就会让整个编辑页（工具栏 + 三列 + 流程图）
 *   全部重渲染，memo 卡片也随 formulaCtx 重建而集体失效。
 *   各项数据由真正需要它的组件自己去订阅：
 *     - 主监控单项         → useMainItem(nodeId)（卡片自订阅自己那一项）
 *     - 辅助监控单项       → useAuxItem(itemKey)（行自订阅自己那一项）
 *     - 视频监管单项       → useVideoCheckItem(vCheckId)
 *     - 流程图 / 小地图    → Components/FlowStatusView
 *     - 公式自动计算       → Components/TimeFormulaEngine
 *     - 草稿落盘           → store/checklistStore 内部（改一项时防抖写 localStorage）
 *   注意：三个面板（Main/Auxiliary/Video）都**不订阅 items**，
 *   否则"填一项 → 面板重渲染 → map 重跑 → 整列卡片都走一次 render"。
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
    const navigate = useNavigate();

    // ===== 细粒度订阅：只取"会影响整页布局/标题"的状态，内容类状态一概不订阅 =====
    // store 里的 action 在 create 时定义一次，引用永久稳定，用 selector 取也不会引发重渲染
    const template = useChecklistStore((s) => s.template);
    const currentStep = useChecklistStore((s) => s.currentStep);
    const saveStatus = useChecklistStore((s) => s.saveStatus);
    const setCurrentStep = useChecklistStore((s) => s.setCurrentStep);
    const setDraftPersistEnabled = useChecklistStore((s) => s.setDraftPersistEnabled);

    // ===== 私有逻辑（hook）=====
    const { viewMode, thumbVisible, setViewMode, setThumbVisible } = useUiPrefs();
    const { saveError, clearSaveError, submit } = useSubmitChecklist({
        flight,
        isLocked,
        setRecordStatus,
        setCheckedAt,
    });
    // 页面隐藏 / 关闭 / 卸载 → 立刻把防抖中的草稿落盘
    useDraftFlush();

    // 三列面板的 DOM 句柄：交给面板组做锚点滚动（辅助栏滚到对应项 / 视频栏滚顶）
    const auxPanelRef = useRef(null);
    const videoPanelRef = useRef(null);

    // 当前检查单的节点结构：全部模板均为新结构（顶层 schema 数组）
    const nodes = useMemo(() => template?.schema || [], [template]);

    // 公式求值上下文（引用稳定，不随 items 变化）—— 卡片 memo 的前提之一
    const { formulaCtx, getNodeId } = useTimeFormulas({ template, nodes, flight });

    // ===== 当前检查单类型对应的面板组组件（穷举法，按 category 查表）=====
    const PanelGroup = resolvePanelGroup(template?.category);

    // 已提交的记录不再产生草稿（store 内部据此短路落盘）
    // 注：本 effect 全文件只保留这一处（曾误留副本在 handleSubmit 之后，已删）
    useEffect(() => {
        setDraftPersistEnabled(recordStatus !== "submitted");
    }, [recordStatus, setDraftPersistEnabled]);

    // 点击类型菜单项：仅清填写数据（保留 flight/header）→ 加载对应模板
    const switchType = useCallback(
        async (tplId) => {
            if (!flight) return;
            useChecklistStore.setState({
                items: {},
                videoItems: {},
                currentStep: null,
                recordId: null,
            });
            setRecordStatus(null);
            setLoadedRecord(null);
            await useChecklistStore.getState().loadTemplate(tplId);
        },
        [flight, setLoadedRecord, setRecordStatus]
    );

    // 聚焦节点：只更新步骤高亮，供流程图 / 小地图 / 三列卡片复用。
    // 三列表单里的"辅助栏锚点滚动 / 视频栏滚顶"由各面板组自己负责
    // （它更清楚自己那一份视频监管数据与 DOM 结构）。
    // useCallback：引用稳定，否则 memo 卡片会因回调变化而全部重渲染
    const focusNode = useCallback((n) => setCurrentStep(getNodeId(n)), [getNodeId, setCurrentStep]);

    // 流程图 / 小地图点击节点 → 高亮该节点并回到检查项视图
    const selectFromFlow = useCallback(
        (n) => {
            focusNode(n);
            setViewMode("form");
        },
        [focusNode, setViewMode]
    );

    return (
        <div className="flex h-[calc(100vh-90px)] flex-col gap-2 overflow-hidden">
            {/* ===== 公式时间自动计算（无 UI，只订阅 items，不牵动本组件） ===== */}
            <TimeFormulaEngine
                template={template}
                nodes={nodes}
                formulaCtx={formulaCtx}
                getNodeId={getNodeId}
            />

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
                    onSubmit={submit}
                    recordStatus={recordStatus}
                    checkedAt={checkedAt}
                    onSelectDraft={(d) => {
                        setRecordStatus(null);
                        // 带上草稿的模板 id，恢复页面时加载对应模板（始发/过站/客运模板各不相同）
                        navigate(
                            `/checklist/${d.flightId}?tpl=${encodeURIComponent(d.templateId || "")}`
                        );
                    }}
                    // 三列（主要 / 辅助 / 视频）固定全开，由各检查单面板组组件渲染，
                    // 因此不再需要"列可见性"切换控件；仅提示可拖拽分隔条调宽度
                    panelSwitcher={
                        <span className="shrink-0 text-[11px] text-slate-400">
                            三列 · 拖拽分隔条可调宽度
                        </span>
                    }
                />
            </div>

            {/* ===== 保存失败提示（常驻，不自动消失，可手动关闭） ===== */}
            <SaveErrorToast message={saveError} onClose={clearSaveError} />

            {viewMode === "flow" ? (
                /* ============ 流程图全屏视图（状态映射由容器自行订阅 items） ============ */
                <Card className="min-h-0 flex-1 overflow-hidden">
                    <CardContent>
                        <MainFlowView
                            nodes={nodes}
                            getNodeId={getNodeId}
                            currentStep={currentStep}
                            onSelect={selectFromFlow}
                        />
                    </CardContent>
                </Card>
            ) : (
                /* ============ 检查项目视图：按检查单类型渲染对应的面板组（穷举法） ============ */
                /* 组件内部自带：模板（静态 import）+ 视频监管数据 + 三列 ResizableColumns；
                   本文件只负责工具栏 / 流程图 / 小地图等与类型无关的部分 */
                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                    <PanelGroup
                        flight={flight}
                        template={template}
                        currentStep={currentStep}
                        formulaCtx={formulaCtx}
                        getNodeId={getNodeId}
                        onFocusNode={focusNode}
                        auxPanelRef={auxPanelRef}
                        videoPanelRef={videoPanelRef}
                    />
                </div>
            )}

            {/* ===== 右下角缩略图小窗（可拖动 / 可关闭；状态映射由容器自行订阅 items） ===== */}
            {thumbVisible && (
                <FlowThumbView
                    nodes={nodes}
                    getNodeId={getNodeId}
                    currentStep={currentStep}
                    onSelectNode={selectFromFlow}
                    onOpenFull={() => navigate(`/flowchart/${flight.id}`)}
                    onClose={() => setThumbVisible(false)}
                />
            )}
        </div>
    );
}
