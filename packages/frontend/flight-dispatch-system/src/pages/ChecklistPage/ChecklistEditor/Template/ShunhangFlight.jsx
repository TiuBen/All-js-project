import { useChecklistStore } from "../../../../store/checklistStore";
import ResizableColumns from "../Components/OtherComponents/ResizableColumns";
import MainMonitoringPanel from "../Components/CheckComponents/MainMonitoringPanel";
import AuxiliaryPanel from "../Components/CheckComponents/AuxiliaryPanel";
import VideoPanel from "../Components/CheckComponents/VideoPanel";
// 本检查单专属数据：模板 + 视频监管（静态 import，编译期确定、零网络）
import shunhangFlight from "./EditorTemplateJson/shunhangFlight";
import { SHUNHANG_VIDEO_FOCUS } from "./EditorTemplateJson/shunhangVideoFocus";

/**
 * ============================================================
 * ShunhangFlight —— 顺航检查单 面板组
 * ------------------------------------------------------------
 * 「穷举法」：一个检查单类型 = 一个组件，由 Template/index.js 的
 * `PANEL_BY_CATEGORY` 按 category 查表选中，编译期确定。
 *
 * ★ 本文件唯一职责：**声明这一类型用哪份数据**，再把它交给三个面板
 *   <MainMonitoringPanel source={shunhangFlight} />       → 主监控节点（当前为空占位）
 *   <AuxiliaryPanel     source={shunhangFlight} />       → 辅助项（当前为空占位）
 *   <VideoPanel         source={SHUNHANG_VIDEO_FOCUS} /> → 顺航独立的 42 条视频监管
 *
 * ★ 本类型的特殊之处：**模板是占位模板，schema 为空**
 *   后端 data/checklists 里顺航只有视频监管数据（4 组 42 条），没有节点保障
 *   模板。为避免 `loadTemplate("顺航检查单")` 查表得 null 抛错（CSS 前缀航班
 *   默认落到顺航），在 EditorTemplateJson/shunhangFlight.js 手建了占位模板。当前表现：
 *   主/辅助列为空态，视频列正常展示 42 条顺航专属条目。
 *   拿到真实节点清单后只填 `EditorTemplateJson/shunhangFlight.js` 的 schema，本文件无需改动。
 *
 *   三个面板其余状态全部自己从 store 订阅，不在这里透传。
 * ============================================================
 */
export default function ShunhangFlight() {
    // 可见列（main / aux / video）：由工具栏分段控件切换，状态在 store（持久化）
    const panels = useChecklistStore((s) => s.panels);

    return (
        <ResizableColumns
            className="min-h-0 flex-1"
            columns={[
                // falsy 项会被 ResizableColumns 过滤掉，不计入列数
                panels.includes("main") && { key: "main", content: <MainMonitoringPanel source={shunhangFlight} /> },
                panels.includes("aux") && { key: "aux", content: <AuxiliaryPanel source={shunhangFlight} /> },
                panels.includes("video") && { key: "video", content: <VideoPanel source={SHUNHANG_VIDEO_FOCUS} /> },
            ]}
        />
    );
}
