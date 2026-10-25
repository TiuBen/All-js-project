import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { Button } from "../../../components/ui/button";
import ContentLayout from "../../../Layout/ContentLayout";
import ChecklistToolbar from "../ChecklistToolbar/ChecklistToolbar";
import ViewMainList from "./Components/ViewMainList";
import ViewAuxiliaryList from "./Components/ViewAuxiliaryList";
import ViewVideoList from "./Components/ViewVideoList";
import { useChecklistStore, templateOf, videoFocusOf } from "../../../store/checklistEditorPage.store";
import { useChecklistViewerStore } from "../../../store/checklistViewer.store";

/**
 * ============================================================
 * ChecklistViewer —— 检查单记录查看 / 修改页（一条已提交的 records_checklist）
 * ------------------------------------------------------------
 * 路由：/checklists/:recordId（「填写记录」页的 查看 / 修改 都跳这里）
 *
 * ★ 本文件只做三件事：拉记录 → 按类型取静态模板 → 把三栏摆出来。
 *   记录 / 修改态 / 保存等会话逻辑全在 store/checklistViewer.store.js，
 *   顶部按钮全在 ChecklistToolbar（它自己认路由，切到查看页自动换一套）。
 *
 * ★ 三栏各由 Viewer/Components 下的**自己那份**列表组件渲染（双态）：
 *     ViewMainList      main 项：展示态 ViewItem / 修改态 MainCheckItem
 *     ViewAuxiliaryList 全部主项的辅助项按组铺开：ViewItem / AuxiliaryItem
 *     ViewVideoList     视频监管手风琴：ViewItem / VideoCheckItem
 *   三者都只认 props（schema / itemMap / mode / keyPrefix），不订阅会话状态，
 *   也不再从 Editor 的列表组件整块借用（只复用其中的单卡片）。
 *
 * ★ 布局：外层整体垂直滚动；main / aux 两栏 grid 拉伸等高；视频手风琴在最下方。
 * ============================================================
 */
export default function ChecklistViewer() {
    const navigate = useNavigate();
    const { recordId } = useParams();

    const record = useChecklistViewerStore((s) => s.record);
    const loading = useChecklistViewerStore((s) => s.loading);
    const error = useChecklistViewerStore((s) => s.error);
    const mode = useChecklistViewerStore((s) => s.mode);
    const keyPrefix = useChecklistViewerStore((s) => s.keyPrefix);
    const load = useChecklistViewerStore((s) => s.load);

    // 三栏显隐：与填写页共用同一套 store（PanelSwitcher 在工具栏里自订阅，这里只读）
    const mainColVisible = useChecklistStore((s) => s.mainColVisible);
    const auxColVisible = useChecklistStore((s) => s.auxColVisible);
    const videoColVisible = useChecklistStore((s) => s.videoColVisible);

    useEffect(() => {
        load(recordId);
    }, [recordId, load]);

    const templateType = record?.checklist_category ?? "";
    // 模板 / 视频监管的取法统一在 store（templateOf / videoFocusOf），这里不再抄一份 map
    const mains = templateOf(templateType)?.schema ?? [];
    const videoGroups = templateType ? videoFocusOf(templateType).groups : [];

    // 展示态的数据源：记录 items 按节点 uuid 建索引（纯展示不经 cache.store）
    const itemMap = useMemo(() => {
        const map = {};
        for (const it of record?.items ?? []) {
            if (it.node_uuid) map[it.node_uuid] = it;
        }
        return map;
    }, [record]);

    // ==================== 加载态 / 错误态（此时还没有记录，工具栏无从显示） ====================
    if (loading) {
        return (
            <ContentLayout className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-slate-400" size={22} />
                <span className="text-xs text-slate-400">正在载入检查单记录…</span>
            </ContentLayout>
        );
    }

    if (error || !record) {
        return (
            <ContentLayout className="flex flex-col items-center justify-center gap-3">
                <span className="text-sm text-red-500">载入失败：{error ?? "记录不存在"}</span>
                <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                    返回
                </Button>
            </ContentLayout>
        );
    }

    // ==================== 正常态 ====================
    return (
        <ContentLayout className="flex flex-col gap-2">
            {/* 记录信息 + 三栏显隐 + 修改/保存（工具栏自己认路由 + 自订阅 store） */}
            <ChecklistToolbar />
            {/* 三栏并排、**每栏各自定高**：标题栏固定不动，只有标题栏下面的列表在滚。
                ⚠️ 滚动**不能**写在这三个外层 div 上（overflow-y-auto 会把标题栏一起滚走，
                   内容从标题底下穿过去）；滚动下沉到每个 ViewXXXList 的列表容器里。
                ⚠️ 外层 div 必须带 min-h-0：flex 项默认 min-height:auto，不加就收缩不到
                   剩余高度，里面的 overflow-y-auto 永远没东西可滚。 */}
            <div className="flex min-h-0 flex-row gap-2 flex-1 mt-2">
                <div className={`${!mainColVisible ? "hidden" : ""}  flex-1 min-h-0`}>
                    {mainColVisible && (
                        <ViewMainList mains={mains} itemMap={itemMap} mode={mode} keyPrefix={keyPrefix} />
                    )}
                </div>
                <div className={`${!auxColVisible ? "hidden" : ""} flex-1 min-h-0`}>
                    {auxColVisible && (
                        <ViewAuxiliaryList mains={mains} itemMap={itemMap} mode={mode} keyPrefix={keyPrefix} />
                    )}
                </div>
                <div className={`${!videoColVisible ? "hidden" : ""} flex-1 min-h-0`}>
                    {videoColVisible && (
                        <ViewVideoList groups={videoGroups} itemMap={itemMap} mode={mode} keyPrefix={keyPrefix} />
                    )}
                </div>
            </div>
        </ContentLayout>
    );
}
