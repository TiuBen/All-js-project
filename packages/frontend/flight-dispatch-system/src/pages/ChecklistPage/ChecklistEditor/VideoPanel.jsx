import { Camera, MonitorPlay } from "lucide-react";
import { cn } from "../../../lib/utils";
import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, nextStatus } from "../components/statusBadge";

/**
 * ============================================================
 * VideoPanel —— 视频监管检查重点面板（填写模式）
 * ------------------------------------------------------------
 * 展示 videoFocus（独立视频监管重点模板）的全部内容，按 groups 分组：
 *   - 每个 group 是"视频监管检查重点（xxx）"大类，items 为子条目
 *   - 子条目含 applicable（全部/客运）：货运模板下隐藏"客运"限定条目
 *   - 每条：描述 / 状态下拉 / 备注（截图信息）
 *   - panelRef 挂内容区，供 focusNode 滚动到顶部
 * ============================================================
 * @param {Object|null} videoFocus  视频监管重点模板 { groups: [{ uuid, name, items: [{uuid, name, applicable}] }] }
 * @param {string} category         当前模板类别（"客运始发航班"等，含"客运"则展示 applicable=客运 条目）
 * @param {Object} videoItems       填写内容 { "video-{uuid}": { status, note } }
 */
export default function VideoPanel({ videoFocus, category, videoItems, panelRef, setVideoValue }) {
    const groups = videoFocus?.groups || [];

    // 过滤：非客运模板（category 不含"客运"）不展示"客运"限定条目
    const isPassenger = String(category || "").includes("客运");
    const visibleGroups = groups
        .map((g) => ({
            ...g,
            items: (g.items || []).filter((it) => !(it.applicable === "客运" && !isPassenger)),
        }))
        .filter((g) => g.items.length > 0);
    const total = visibleGroups.reduce((s, g) => s + g.items.length, 0);

    return (
        <div className="flex h-full min-w-0 flex-col rounded-lg border border-slate-300 bg-white">
            {/* 标题栏 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <Camera size={13} className="text-sky-600" />
                    视频监管检查重点
                    <span className="text-[12px] font-normal text-slate-400">{total} 项</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MonitorPlay size={11} /> 截图 / 人工评价
                </span>
            </div>

            {/* 视频项列表：按 groups 分组 */}
            <div ref={panelRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
                {visibleGroups.length ? (
                    visibleGroups.map((g) => (
                        <div key={g.uuid} className="space-y-2">
                            {/* 分组标题（大类） */}
                            <div className="sticky top-0 z-10 flex items-center gap-1 rounded-md bg-sky-50/95 px-2 py-1 text-[12px] font-bold text-sky-700 backdrop-blur">
                                <MonitorPlay size={11} className="shrink-0" />
                                {g.name}
                                <span className="ml-auto text-[10px] font-normal text-sky-400">
                                    {g.items.length} 项
                                </span>
                            </div>
                            {/* 子条目 */}
                            {g.items.map((it) => {
                                const vKey = `video-${it.uuid}`;
                                const vItem = videoItems[vKey] || {};
                                return (
                                    <div
                                        key={vKey}
                                        className="rounded-lg border border-sky-100 p-2 hover:bg-sky-50/40"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 text-[13px] leading-snug text-slate-600">
                                                {it.name}
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
                            })}
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                        该模板暂无视频监管项
                    </div>
                )}
            </div>
        </div>
    );
}
