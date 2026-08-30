import { Camera, MonitorPlay } from "lucide-react";
import { cn } from "../../../lib/utils";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "./statusBadge";

/**
 * ============================================================
 * VideoPanel —— 视频监管检查重点面板（填写模式）
 * ------------------------------------------------------------
 * 展示当前激活节点的全部视频监管项（type: video）：
 *   - 分组标题 / 描述 / 状态下拉 / 备注（截图信息）
 *   - 首个视频项带锚点（video-anchor-${activeNodeId}，focusNode 滚动定位）
 * ============================================================
 */
export default function VideoPanel({ activeNodeId, videoByNode, videoItems, panelRef, setVideoValue }) {
    const videos = (activeNodeId && videoByNode[activeNodeId]) || [];

    return (
        <div className="flex flex-col min-w-0 o rounded-lg border border-slate-300 bg-white">
            {/* 标题栏 */}
            <div className="flex items-center justify-between border-b border-slate-200  px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <Camera size={13} className="text-sky-600" />
                    视频监管检查重点
                    <span className="text-[10px] font-normal text-slate-400">{videos.length} 项</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MonitorPlay size={11} /> 截图 / 人工评价
                </span>
            </div>

            {/* 视频项列表 */}
            <div ref={panelRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {videos.length ? (
                    videos.map((v, vi) => {
                        const vKey = `video-${v.uuid}`;
                        const vItem = videoItems[vKey] || {};
                        return (
                            <div
                                key={vKey}
                                id={vi === 0 ? `video-anchor-${activeNodeId}` : undefined}
                                className="scroll-mt-2 rounded-lg border border-sky-100  hover:bg-sky-50/40 p-2"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                        {/* {v.groupTitle && (
                                            <div className="text-[13px] font-medium text-sky-600">{v.groupTitle}</div>
                                        )} */}
                                        <div className="mt-0.5 text-[13px]  leading-snug text-slate-600">{v.desc}</div>
                                    </div>
                                    {/* 状态：label 包裹（文字+图标均可点击切换），hover 显示文字 */}
                                    <label
                                        className={cn(
                                            "flex shrink-0 cursor-pointer items-center gap-1.5 text-[12px]",
                                            STATUS_COLORS[vItem.status || ""] || "text-blue-500"
                                        )}
                                        title={`状态：${STATUS_LABELS[vItem.status || ""]}（单击切换）`}
                                    >
                                        <span>{STATUS_LABELS[vItem.status || ""]}</span>
                                        <button
                                            className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-150"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setVideoValue(vKey, "status", nextStatus(vItem.status));
                                            }}
                                        >
                                            {STATUS_ICONS[vItem.status || ""]}
                                        </button>
                                    </label>
                                </div>

                                <textarea
                                    className="input mt-1.5 w-full resize-y px-1.5 py-0.5 "
                                    rows={2}
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
    );
}
