import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import PanelSwitcher from "./Components/PanelSwitcher";
import DraftDropdown from "./Components/DraftDropdown";
// 类型下拉（含配色与切换动作）已下沉到 TemplateChooseDropdown，本文件不再关心类型
import TemplateChooseDropdown from "./Components/TemplateChooseDropdown";
// 草稿自动保存状态提示（自订阅 draftPending / draftSavedAt）
// import DraftStatus from "./Components/DraftStatus";
// import InfoDisplay from "./Components/InfoDisplay";
import { useChecklistStore, typeColorOf } from "../../../store/checklistEditorPage.store";
import { useDraftStore } from "../../../store/checklistDraft.store";
import { useSidebarStore } from "../../../store/sidebar.store";
import { TEMPLATE_KEY_BY_TYPE } from "../../../config/dataSource";
import { draftKeyOf } from "../../../utils/checklistCache";
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, Map, Workflow } from "lucide-react";

/**
 * ============================================================
 * EditorToolbar —— 检查单**填写页**顶部固定区（行1）
 * ------------------------------------------------------------
 * 目录：ChecklistPage/ChecklistToolbar/EditorToolbar.jsx（本文件）
 *      外层 ChecklistToolbar.jsx 按路由分流，只有 /checklists/flight/:flightUuid
 *      会渲染到这里；子组件（类型下拉 / 信息区 / 草稿箱 / 草稿状态 / 列显隐）
 *      都在同级的 Components/ 下
 * ------------------------------------------------------------
 * ★ **零 props**：数据与操作全部走 store，本文件只订阅自己要用到的
 *     viewMode / thumbVisible   流程图切换 / 小地图开关
 *     templateType              决定"当前草稿是哪一条"（航班 × 模板）与提交时的 checklist_category
 *   动作：
 *     - toggleThumbVisible()
 *     - DraftDropdown 里选中草稿 / 删除草稿
 *     - 提交 → draft.store 的 submitDraft()（★ 后端未接线，只打印数据）
 *   已下沉的子组件（本文件不订阅它们的内部状态）：
 *     - <TemplateChooseDropdown />  类型下拉：自订阅 templateType + 切模板（含草稿整理）
 *     - <PanelSwitcher />           列显隐分段控件：自订阅三个布尔值 + setColVisible
 *     - <DraftDropdown />           草稿箱：自订阅草稿列表
 *   从外部拿的只有路由（当前 :flightUuid + navigate 跳转）。
 * ★ 只在**填写页**出现：外层 ChecklistToolbar 已经按 `recordId` 分流，
 *   这里拿不到 flightUuid 也不会发生（除非路由表被改坏）。
 * ============================================================
 */
export default function EditorToolbar() {
    const navigate = useNavigate();
    const { flightUuid } = useParams();
    const [submitting, setSubmitting] = useState(false);

    // ===== 订阅 store（细粒度 selector，均为原始值 / 稳定常量引用）=====
    const flight = useChecklistStore((s) => s.flight); // 仅"独立展示"跳转用
    // const saveStatus = useChecklistStore((s) => s.saveStatus);
    const templateType = useChecklistStore((s) => s.templateType); // 提交时当 checklist_category
    const viewMode = useChecklistStore((s) => s.viewMode);
    const thumbVisible = useChecklistStore((s) => s.thumbVisible);
    // // 当前是新建态还是修改某条记录（决定提交调哪个方法）
    // const recordId = useChecklistStore((s) => s.recordId);
    // // action：create() 时定义一次，引用永久稳定
    const toggleThumbVisible = useChecklistStore((s) => s.toggleThumbVisible);
    // const createRecord = useChecklistStore((s) => s.createRecord);
    // const updateRecord = useChecklistStore((s) => s.updateRecord);

    // 当前草稿 = 航班 × 模板（草稿箱里那一条的身份）
    const currentDraftKey = draftKeyOf(flightUuid, TEMPLATE_KEY_BY_TYPE[templateType]);
    const submitDraft = useDraftStore((s) => s.submitDraft);

    // ===== 航班号（到港 / 离港拼接）=====
    // 首选：RawEcyilangTable 里点选的原始 ecyilang 行（a_flight_no_full / d_flight_no_full）；
    // 兜底：草稿里存的 flightNo（刷新后直接进 URL、还没点选过行的时候）
    const selectedFlight = useSidebarStore((s) => s.selectedFlight);
    const draftFlightNo = useDraftStore.getState().draftOf(currentDraftKey)?.flightNo ?? "";
    const aNo = selectedFlight?.a_flight_no_full || draftFlightNo || "";
    const dNo = selectedFlight?.d_flight_no_full || "";
    // 两条腿都有 → 「到号 / 离号」；只有一腿 → 只显示那一腿
    const flightNoText = [aNo, dNo].filter(Boolean).join(" / ") || "—";
    // 模板主色：类型中文名 → hex（与类型下拉 / 草稿箱同一张配色表）
    const typeColor = typeColorOf(templateType);

    /**
     * 草稿箱选中某份草稿 → 带「航班 + 检查单类型」进编辑器 URL
     * 一条草稿 = 航班 × 类型，两者都要带上，装载时才取到**这一份**（而不是该航班最近那份）。
     */
    const handleSelectDraft = (d) => {
        navigate(`/checklists/flight/${d.flightUuid}?template=${d.templateKey}`);
    };

    /**
     * 提交。★ 后端还没接线：submitDraft 只把整理好的数据打进控制台，本地草稿保留。
     * 接线后：submitDraft 里换成 POST，成功回调里 dropDraftWithData(currentDraftKey) 清草稿。
     */
    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            const record = await submitDraft({
                flightUuid: flightUuid,
                // 航班号只给后端 callsign 用：索引里有就用它（草稿箱列表也是这么显示的）
                flightNo: useDraftStore.getState().draftOf(currentDraftKey)?.flightNo ?? "",
                templateKey: TEMPLATE_KEY_BY_TYPE[templateType],
                templateType,
            });
            // 成功反馈：草稿已被清掉，记录进了「填写记录」页
            alert(`提交成功：检查单已入库（记录 #${record?.id}），本地草稿已清空`);
        } catch (err) {
            alert(`提交失败：${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="shrink-0 space-y-2">
            {/* 行1：标题 + 字段区 + 操作按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* 航班 / 检查单信息区：返回按钮 + 到/离航班号拼接 + 模板名（联动模板主色） */}
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div className="flex items-baseline gap-2" style={{ color: typeColor }}>
                        <h2 className="text-base font-bold">
                            {/* 到港号在前、离港号在后（与 RawEcyilangTable 的到/离行序一致） */}
                            <span>{flightNoText}</span>
                        </h2>
                    </div>
                </div>

                {/* 草稿自动保存状态：零 props，自行订阅 draftPending / draftSavedAt */}
                {/* <DraftStatus /> */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* 检查单类型下拉：零 props，自行订阅当前类型并调 switchChecklistType */}
                    <TemplateChooseDropdown />
                    {/* 列显隐分段控件：零 props，自订阅 panels/hasAux + togglePanel */}
                    <PanelSwitcher />
                    <Button
                        variant={viewMode === "flow" ? "default" : "outline"}
                        size="sm"
                        onClick={() => navigate(`/flowchart)`)}
                    >
                        <Workflow size={14} /> 流程图
                    </Button>
                    {/*TODO 在路由里加上后缀显示 */}
                    <Button variant={thumbVisible ? "default" : "outline"} size="sm" onClick={toggleThumbVisible}>
                        <Map size={14} /> {thumbVisible ? "隐藏小地图" : "显示小地图"}
                    </Button>
                    {/*TODO 纯独立显示的效果 */}
                    <Button variant="outline" size="sm" onClick={() => navigate(`/flowchart/${flight?.id}`)}>
                        <ExternalLink size={14} /> 独立展示
                    </Button>
                    <DraftDropdown onSelect={handleSelectDraft} currentKey={currentDraftKey} />
                    {/* 提交：★ 后端未接线，只把整理好的数据打进控制台（本地草稿保留） */}
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={submitting || !currentDraftKey}
                        title="提交这条检查单（后端未接线：数据会打印在浏览器控制台）"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                        提交
                    </Button>
                </div>
            </div>
        </div>
    );
}
