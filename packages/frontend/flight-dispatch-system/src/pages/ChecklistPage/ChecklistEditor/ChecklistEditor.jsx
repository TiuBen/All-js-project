import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useChecklistStore, typeOfCheckTemplate } from "../../../store/checklistStore";
// 草稿（填写数据 + IndexedDB 落盘）在 checklistDraft：flush / 开关都在这里
import { flushDraft, setPersistEnabled } from "../../../store/checklistDraft";
import { Card, CardContent } from "../../../components/ui/card";
import ChecklistToolbar from "./Components/ToolBar/Toolbar";
// 检查单面板组：「穷举法」一类型一组件，各自顶部静态 import 自己的数据
import CargoBypassFlight from "./Template/CargoBypassFlight";
import CargoInitFlight from "./Template/CargoInitFlight";
import PassengerInitFlight from "./Template/PassengerInitFlight";
import PassengerBypassFlight from "./Template/PassengerBypassFlight";
import ShunhangFlight from "./Template/ShunhangFlight";
import TimeFormulaEngine from "./Components/OtherComponents/TimeFormulaEngine";
import { MainFlowView, FlowThumbView } from "./Components/OtherComponents/FlowStatusView";
import SaveErrorToast from "./Components/OtherComponents/SaveErrorToast";
import { Loader2 } from "lucide-react";

/**
 * 检查单类型（category）→ 面板组组件
 * ------------------------------------------------------------
 * key 与模板的 category（= 类型名 = 落库 checklist_category）一一对应；
 * 未命中时（理论上不应发生）回退货运过站航班。
 * 新增检查单类型：建 Template/EditorTemplateJson/Xxx.js + Template/Xxx.jsx，然后在下面补一行。
 */
const PANEL_BY_CATEGORY = {
    客运始发航班: PassengerInitFlight,
    客运过站航班: PassengerBypassFlight,
    货运始发航班: CargoInitFlight,
    货运过站航班: CargoBypassFlight,
    顺航检查单: ShunhangFlight,
};

/**
 * ============================================================
 * ChecklistEditor —— 检查单填写/编辑页（ChecklistPage 子页面）
 * ------------------------------------------------------------
 * ★ **零 props**：本文件只做"与检查单类型无关、且与具体字段无关"的编排
 *   - 工具栏（类型下拉 / 流程图 / 草稿箱 / 提交）→ <ChecklistToolbar /> 零 props
 *   - 流程图全屏视图 / 右下角缩略图小窗
 *   - 草稿落盘兜底（本文件内联的 useEffect）
 *
 * ★ 全站「非受控」：编辑器本身**只订阅 template.category 一个业务状态**
 *   （用来决定渲染哪个面板组）。填写数据、选中节点、写入 action、公式上下文、
 *   记录状态、布局偏好全部由各面板 / 卡片 / 工具栏**自己订阅 store**，这里一概不传：
 *     - 主监控卡片     → useMainItem + setItemValue（checklistDraft）+ selectedCheckNode
 *     - 辅助监控行     → useAuxItem + setItemValue（checklistDraft）
 *     - 视频监管行     → useVideoCheckItem + useVideoCheckSetter（uuid，checklistDraft）
 *     - 流程图 / 小地图 → 挂载时才订阅草案 version
 *     - 公式自动计算   → TimeFormulaEngine（渲染 null）
 *     - 保存失败提示   → SaveErrorToast（自行订阅 saveError）
 *     - 草稿落盘       → checklistDraft 内部（内存 + IndexedDB）
 *   这样"填一项"只让那一项重渲染，编辑器本身保持静止。
 *
 * ★ 三列检查表由「穷举法」的面板组组件渲染
 *   按 template.category 查上面那张 PANEL_BY_CATEGORY 表取之一（均为零 props）。
 * ============================================================
 */
export default function ChecklistEditor() {
    const navigate = useNavigate();
    const { flightId: routeFlightId } = useParams(); // 航班键（manual_fips.uuid）
    // URL 上的检查单类型（?checkTemplate=1~5）与记录 id（?record=）——
    // 与身份同样放在 URL 里，装载时一并生效（刷新 / 直链都还原同一个会话）
    const [searchParams] = useSearchParams();
    const tplParam = searchParams.get("checkTemplate");
    // ★ ?record=<id> = 修改模式（改这一条）；不带 = 新建模式（提交新增一条）
    const recordParam = searchParams.get("record");

    // ===== store 订阅（全部细粒度 selector，只取自己渲染真正需要的）=====
    const flight = useChecklistStore((s) => s.flight); // 装载守卫 / 独立展示 / 小窗跳转
    const category = useChecklistStore((s) => s.template?.category); // 决定面板组
    const flightId = useChecklistStore((s) => s.flight?.id); // 独立展示 / 小窗跳转
    const recordStatus = useChecklistStore((s) => s.recordStatus); // 决定是否还产生草稿
    const viewMode = useChecklistStore((s) => s.viewMode); // form | flow
    const thumbVisible = useChecklistStore((s) => s.thumbVisible);
    const setViewMode = useChecklistStore((s) => s.setViewMode);
    const setThumbVisible = useChecklistStore((s) => s.setThumbVisible);
    const openFlight = useChecklistStore((s) => s.openFlight);
    const openRecordForEdit = useChecklistStore((s) => s.openRecordForEdit);

    // ===== URL 即身份：按 :flightId + ?checkTemplate / ?record 装载会话 =====
    // 编辑器是 store 驱动、零 props —— 若只换 URL 不重装 store，页面会继续显示上一个
    // 航班的数据，填写层也留着别人的 items（草稿会落到错误的键上）。
    // 两条装载路径（对应两种提交语义，互不越界）：
    //   ?record=<id> → openRecordForEdit：拉该条记录 + 灌填写层，提交走 PUT（改这一条）
    //   无 ?record   → openFlight：换航班重装 / 同航班换类型换草稿，提交走 POST（新增一条）
    //   （传了 record 就不再看 checkTemplate —— 类型由记录自己决定）
    useEffect(() => {
        if (recordParam) openRecordForEdit(recordParam, routeFlightId);
        else if (routeFlightId) openFlight(routeFlightId, typeOfCheckTemplate(tplParam) || undefined);
    }, [routeFlightId, tplParam, recordParam, openFlight, openRecordForEdit]);

    // ===== 草稿落盘兜底：页面隐藏 / 关闭 / 卸载 → 立刻落盘 IndexedDB =====
    // 草稿平时由 checklistDraft 在改动某项时防抖写入（800ms）；这三个时机的计时器
    // 可能还没到点，所以强制 flush 一次，保证最后那一下编辑不丢。
    useEffect(() => {
        const flush = () => flushDraft();
        const onVisibility = () => {
            if (document.visibilityState === "hidden") flush();
        };
        window.addEventListener("pagehide", flush);
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            window.removeEventListener("pagehide", flush);
            document.removeEventListener("visibilitychange", onVisibility);
            flush(); // 卸载时补一次
        };
    }, []);

    // ===== 当前检查单类型对应的面板组组件（穷举法，直接查上面那张表）=====
    const PanelGroup = PANEL_BY_CATEGORY[category] || CargoBypassFlight;

    // 已提交的记录不再产生草稿（checklistDraft 内部据此短路落盘）
    useEffect(() => {
        setPersistEnabled(recordStatus !== "submitted");
    }, [recordStatus]);

    // 装载中（store 里还没有航班）→ 不渲染面板组：避免"上一个航班的模板 + 空数据"的错觉
    if (!flight) {
        return (
            <div className="flex h-[calc(100vh-90px)] items-center justify-center text-sm text-slate-400">
                <Loader2 className="mr-2 animate-spin" size={18} /> 正在加载检查单…
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-90px)] flex-col gap-2 overflow-hidden">
            {/* ===== 公式时间自动计算（无 UI，只订阅 items，不牵动本组件） ===== */}
            <TimeFormulaEngine />

            {/* ===== 顶部固定区：标题 + 航班信息字段 + 操作按钮（零 props，自行订阅 store） ===== */}
            <div className="shrink-0 space-y-2">
                <ChecklistToolbar />
            </div>

            {/* ===== 保存失败提示（常驻，不自动消失，可手动关闭；自行订阅 store） ===== */}
            <SaveErrorToast />

            {viewMode === "flow" ? (
                /* ============ 流程图全屏视图（状态映射由容器自行订阅 items） ============ */
                <Card className="min-h-0 flex-1 overflow-hidden">
                    <CardContent>
                        <MainFlowView onSelect={() => setViewMode("form")} />
                    </CardContent>
                </Card>
            ) : (
                /* ============ 检查项目视图：按检查单类型渲染对应的面板组（穷举法） ============ */
                /* 面板组自带：模板（静态 import）+ 视频监管数据 + 三列 ResizableColumns；
                   三列面板与卡片各自订阅 store，本文件不传任何 props */
                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
                    <PanelGroup />
                </div>
            )}

            {/* ===== 右下角缩略图小窗（可拖动 / 可关闭；状态映射由容器自行订阅 items） ===== */}
            {thumbVisible && (
                <FlowThumbView
                    onSelectNode={() => setViewMode("form")}
                    onOpenFull={() => navigate(`/flowchart/${flightId}`)}
                    onClose={() => setThumbVisible(false)}
                />
            )}
        </div>
    );
}
