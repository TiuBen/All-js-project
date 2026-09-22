import { useChecklistStore } from "../../../../store/checklistStore";
import ResizableColumns from "../Components/OtherComponents/ResizableColumns";
import MainMonitoringPanel from "../Components/CheckComponents/MainMonitoringPanel";
import AuxiliaryPanel from "../Components/CheckComponents/AuxiliaryPanel";
import VideoPanel from "../Components/CheckComponents/VideoPanel";
// 本检查单专属数据：模板 + 视频监管（静态 import，编译期确定、零网络）
import passengerBypassFlight from "./TemplateJson/passengerBypassFlight";
import { PASSENGER_VIDEO_FOCUS } from "./TemplateJson/passengerVideoFocus";

/**
 * ============================================================
 * PassengerBypassFlight —— 客运过站航班 检查单面板组
 * ------------------------------------------------------------
 * 「穷举法」：一个检查单类型 = 一个组件，由 Template/index.js 的
 * `PANEL_BY_CATEGORY` 按 category 查表选中，编译期确定。
 *
 * ★ 本文件唯一职责：**声明这一类型用哪份数据**，再把它交给三个面板
 *   <MainMonitoringPanel source={passengerBypassFlight} />   → 主监控节点取 source.schema
 *   <AuxiliaryPanel     source={passengerBypassFlight} />   → 辅助项取选中节点的 auxiliaries
 *   <VideoPanel         source={PASSENGER_VIDEO_FOCUS} />   → 客运那一份 38 条（含廊桥/桥载专属项）
 *
 *   三个面板其余状态全部自己从 store 订阅，不在这里透传。
 * ============================================================
 */
export default function PassengerBypassFlight() {
    // 可见列（main / aux / video）：由工具栏分段控件切换，状态在 store（持久化）
    const panels = useChecklistStore((s) => s.panels);

    return (
        <ResizableColumns
            className="min-h-0 flex-1"
            columns={[
                // falsy 项会被 ResizableColumns 过滤掉，不计入列数
                panels.includes("main") && { key: "main", content: <MainMonitoringPanel source={passengerBypassFlight} /> },
                panels.includes("aux") && { key: "aux", content: <AuxiliaryPanel source={passengerBypassFlight} /> },
                panels.includes("video") && { key: "video", content: <VideoPanel source={PASSENGER_VIDEO_FOCUS} /> },
            ]}
        />
    );
}
