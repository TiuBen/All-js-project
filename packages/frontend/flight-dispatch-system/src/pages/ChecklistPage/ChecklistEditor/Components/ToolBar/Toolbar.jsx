import { useNavigate } from "react-router-dom";
import { Button } from "../../../../../components/ui/button";
import PanelSwitcher from "./Components/PanelSwitcher";
import DraftDropdown from "./Components/DraftDropdown";
// 类型下拉（含配色与切换动作）已下沉到 TemplateChooseDropdown，本文件不再关心类型
import TemplateChooseDropdown from "./Components/TemplateChooseDropdown";
// 草稿自动保存状态提示（自订阅 draftPending / draftSavedAt）
import DraftStatus from "./Components/DraftStatus";
import InfoDisplay from "./Components/InfoDisplay";
import { useChecklistStore, checkTemplateOfType } from "../../../../../store/checklistStore";
import { CheckCircle2, ExternalLink, Loader2, Map, Workflow } from "lucide-react";

/**
 * ============================================================
 * ChecklistToolbar —— 检查单页顶部固定区（行1）
 * ------------------------------------------------------------
 * 目录：ChecklistPage/ChecklistEditor/Components/ToolBar/Toolbar.jsx（本文件即工具栏本体）
 *      子组件（类型下拉 / 信息区 / 草稿箱 / 草稿状态 / 列显隐）都在同级的 Components/ 下
 * ------------------------------------------------------------
 * ★ **零 props**：数据与操作全部走 useChecklistStore
 *   自上而下订阅（均为细粒度 selector，store 不变则本组件不重渲染）：
 *     - saveStatus                    提交按钮
 *     - viewMode / thumbVisible       流程图切换 / 小地图开关
 *   按钮动作直接调用 store action：
 *     - toggleViewMode() / toggleThumbVisible()
 *     - createRecord() / updateRecord()  提交（★ 按当前态调**不同**的方法，见下）
 *                                     24h 锁定拦截与失败提示都在 action 内；
 *                                     成功后 replace 跳 /checklists/:checkedId 详情页
 *   ★ 提交按钮分流（新建 / 修改 是两件不同的事，不能混）：
 *     - 新建态（recordId 为空，URL 无 ?record）→ createRecord()  POST  新增一条
 *     - 修改态（有 recordId）                  → updateRecord()  PUT   只改那一条
 *   已下沉的子组件（本文件不订阅它们的内部状态）：
 *     - <TemplateChooseDropdown />    类型下拉：自订阅 template.id + switchChecklistType
 *     - <InfoDisplay />               航班 + 类型 + 状态徽章 + 返回按钮（配色表在 checklistStore）
 *     - <DraftStatus />               草稿自动保存提示：自订阅 draftPending / draftSavedAt
 *     - <PanelSwitcher />             列显隐分段控件：自订阅 panels/hasAux + togglePanel
 *   唯一从外部拿的只有路由 navigate（草稿跳转 / 独立展示）。
 * ============================================================
 */
export default function ChecklistToolbar() {
    const navigate = useNavigate();

    // ===== 订阅 store（细粒度 selector，均为原始值 / 稳定常量引用）=====
    const flight = useChecklistStore((s) => s.flight); // 仅"独立展示"跳转用
    const saveStatus = useChecklistStore((s) => s.saveStatus);
    const viewMode = useChecklistStore((s) => s.viewMode);
    const thumbVisible = useChecklistStore((s) => s.thumbVisible);
    // 当前是新建态还是修改某条记录（决定提交调哪个方法）
    const recordId = useChecklistStore((s) => s.recordId);
    // action：create() 时定义一次，引用永久稳定
    const toggleViewMode = useChecklistStore((s) => s.toggleViewMode);
    const toggleThumbVisible = useChecklistStore((s) => s.toggleThumbVisible);
    const createRecord = useChecklistStore((s) => s.createRecord);
    const updateRecord = useChecklistStore((s) => s.updateRecord);

    /**
     * 草稿箱选中某份草稿 → 带「航班键 + 检查单类型」进编辑器 URL
     * 一条草稿 = 航班 × 类型，两者都要带上，装载时才取到**这一份**（而不是该航班最近那份）。
     */
    const handleSelectDraft = (d) => {
        const ct = checkTemplateOfType(d.templateId);
        navigate(`/checklists/flight/${d.flightId}${ct ? `?checkTemplate=${ct}` : ""}`);
    };

    /**
     * 提交 → 成功即跳检查单详情（/checklists/:checkedId）
     * ★ 两个方法各司其职（不再让 store 隐式猜）：
     *   有 recordId = 修改态 → updateRecord()（PUT，只改那一条）
     *   没有      = 新建态 → createRecord()（POST，新增一条）
     * 落库后返回记录，记录 id 就是详情页身份；用 replace 顶掉编辑器这一条历史，
     * 返回键直接回航班列表而不是回到已提交的编辑态。
     */
    const handleSubmit = async () => {
        const record = recordId ? await updateRecord() : await createRecord();
        if (record?.id) navigate(`/checklists/${record.id}`, { replace: true });
    };

    return (
        <div className="shrink-0 space-y-2">
            {/* 行1：标题 + 字段区 + 操作按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                {/* 航班 / 检查单信息区（含返回按钮）：零 props，自行订阅 store */}
                <InfoDisplay />

                {/* 航班信息字段区 —— 待修改（占位，后续合并重构） */}
                <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/40 p-2 text-center text-[11px] text-amber-600">
                    航班信息字段区（待修改）
                </div>

                {/* 草稿自动保存状态：零 props，自行订阅 draftPending / draftSavedAt */}
                <DraftStatus />
                <div className="flex flex-wrap items-center gap-2">
                    {/* 检查单类型下拉：零 props，自行订阅当前类型并调 switchChecklistType */}
                    <TemplateChooseDropdown />

                    {/* 列显隐分段控件：零 props，自订阅 panels/hasAux + togglePanel */}
                    <PanelSwitcher />

                    <Button variant={viewMode === "flow" ? "default" : "outline"} size="sm" onClick={toggleViewMode}>
                        <Workflow size={14} /> 流程图
                    </Button>

                    <Button variant={thumbVisible ? "default" : "outline"} size="sm" onClick={toggleThumbVisible}>
                        <Map size={14} /> {thumbVisible ? "隐藏小地图" : "显示小地图"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/flowchart/${flight?.id}`)}>
                        <ExternalLink size={14} /> 独立展示
                    </Button>

                    <DraftDropdown onSelect={handleSelectDraft} />
                    {/* 提交：新建态落一条新记录，修改态只改那一条（文案随态变化，避免误判） */}
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={saveStatus === "saving"}
                        title={recordId ? `更新第 ${recordId} 号记录` : "新建一条检查单记录"}
                    >
                        {saveStatus === "saving" ? (
                            <Loader2 className="animate-spin" size={14} />
                        ) : (
                            <CheckCircle2 size={14} />
                        )}
                        {recordId ? "保存修改" : "提交"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
