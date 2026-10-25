/**
 * ============================================================
 * Editor —— 检查单填写页（三列：主监控 / 辅助项 / 视频监管）
 * ------------------------------------------------------------
 * 模板类型切换：templateType 存在 checklistEditorPage.store（Comp 版），
 * 按类型映射到对应静态模板（../MutilTypeInput/Const 桶文件 index.js）。
 *
 * 列结构（同原版 Editor.jsx）：
 *   MainList      主监控列：节点卡片（状态 + 完成时间，自缓存）
 *   AuxiliaryList 辅助列：选中主项的 auxiliaries（state/text/time/images 自缓存）
 *   VideoPanel    视频监管列
 *
 * ★ 三个外部组件（ContentLayout / ChecklistToolbar / VideoPanel）
 *   的引用路径按你项目里的实际位置自行调整。
 * ============================================================
 */
import { useEffect, useState } from "react";

import MainList from "./MainList";
import AuxiliaryList from "./AuxiliaryList";
import { useChecklistStore, TYPE_ORDER } from "./checklistEditorPage.store";

import {
    cargoBypassFlight,
    cargoInitFlight,
    passengerBypassFlight,
    passengerInitFlight,
    shunhangFlight,
    CARGO_VIDEO_FOCUS,
    SHUNHANG_VIDEO_FOCUS,
    PASSENGER_VIDEO_FOCUS,
} from "../MutilTypeInput/index";

// ↓↓↓ 引用自己解决：这三个组件按你项目里的实际路径改 ↓↓↓
import ChecklistToolbar from "./Components/ToolBar/Toolbar";
import ContentLayout from "../../../Layout/ContentLayout";
import VideoPanel from "./Components/VideoPanel";

/**
 * 模板类型 → 检查单静态模板
 * ★ 键 = TYPE_ORDER = checklistEditorPage.store 的 templateType（落库 checklist_category）
 */
const TEMPLATE_BY_TYPE = {
    货运过站航班: cargoBypassFlight,
    顺航检查单: shunhangFlight,
    货运始发航班: cargoInitFlight,
    客运始发航班: passengerInitFlight,
    客运过站航班: passengerBypassFlight,
};

function Editor() {
    const [selectedMainUuid, setSelectedMainUuid] = useState(null);

    // 列显隐 / 模板类型：一律从 store 取
    const mainColVisible = useChecklistStore((s) => s.mainColVisible);
    const auxColVisible = useChecklistStore((s) => s.auxColVisible);
    const videoColVisible = useChecklistStore((s) => s.videoColVisible);
    const templateType = useChecklistStore((s) => s.templateType);
    const setTemplateType = useChecklistStore((s) => s.setTemplateType);

    const template = TEMPLATE_BY_TYPE[templateType] ?? cargoBypassFlight;

    // 切模板后原选中节点不属于新 schema，重置选择
    useEffect(() => {
        setSelectedMainUuid(null);
    }, [templateType]);

    // 根据 uuid 找到当前选中的 main 对象（没选 / 选的是别的模板的 → null）
    const selectedMain = template.schema.find((m) => m.uuid === selectedMainUuid) ?? null;

    const selectedVideo = templateType.includes("货运")
        ? CARGO_VIDEO_FOCUS
        : templateType.includes("顺航")
        ? SHUNHANG_VIDEO_FOCUS
        : PASSENGER_VIDEO_FOCUS;

    return (
        <ContentLayout>
            <ChecklistToolbar />

            {/* 模板类型切换（接上你自己的 TemplateChooseDropdown 后可删掉这个 select） */}
            <div className="mb-2 flex items-center gap-2 text-[12px]">
                <span className="shrink-0 text-slate-400">模板类型</span>
                <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="rounded border border-slate-200 bg-white px-2 py-1"
                >
                    {TYPE_ORDER.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </select>
            </div>

            {/* min-h-0 是必须的：flex 项默认 min-height:auto，会拒绝收缩到内容高度以下
                → 这一行会被最长的列撑高，列高 = 内容高，overflow-y-auto 永远没东西可滚。
                加 min-h-0 后本行高度 = 剩余空间（确定值），列才能各自内部滚动。 */}
            <div className="flex min-h-0 flex-row gap-2 flex-1">
                <div className={`${!mainColVisible ? "hidden" : ""} flex-1 overflow-y-auto`}>
                    <MainList mains={template.schema} onSelect={(uuid) => setSelectedMainUuid(uuid)} />
                </div>

                <div className={`${!auxColVisible ? "hidden" : ""} flex-1 overflow-y-auto`}>
                    <AuxiliaryList main={selectedMain} />
                </div>

                <div className={`${!videoColVisible ? "hidden" : ""} flex-1 overflow-y-auto`}>
                    <VideoPanel groups={selectedVideo.groups} />
                </div>
            </div>
        </ContentLayout>
    );
}

export default Editor;
