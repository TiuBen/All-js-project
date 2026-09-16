import { memo } from "react";
import { Camera, MonitorPlay } from "lucide-react";
import VideoCheckItem from "./VideoCheckItem";

/**
 * ============================================================
 * VideoPanel —— 视频监管检查重点面板（填写模式）
 * ------------------------------------------------------------
 * 数据源：videoFocus（前端静态模块 pages/ChecklistPage/utils，
 *         按检查单 category 本地解析，不再请求后端），按 groups 分组：
 *   - 每个 group 是"视频监管检查重点（xxx）"大类，items 为子条目
 *   - 子条目含 applicable（全部/客运）：货运模板下隐藏"客运"限定条目
 *
 * 本组件只负责分组标题与空态，单条目的展示/交互下沉到
 * 同目录的 VideoCheckItem（自行订阅 store，见其注释）。
 * 因此本面板**不订阅 videoItems**，改一条不会引起整面板重渲染。
 * ============================================================
 * @param {Object|null} videoFocus 视频监管重点数据 { groups: [{ id, name, items: [{ id, applicable, name }] }] }
 * @param {string} category        当前模板类别（"客运始发航班"等，含"客运"才展示 applicable=客运 条目）
 * @param {Ref} panelRef           挂内容区，供 focusNode 滚动到顶部
 */
export default memo(function VideoPanel({ videoFocus, category, panelRef }) {
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
                        <div key={g.id} className="space-y-2">
                            {/* 分组标题（大类） */}
                            <div className="sticky top-0 z-10 flex items-center gap-1 rounded-md bg-sky-50/95 px-2 py-1 text-[12px] font-bold text-sky-700 backdrop-blur">
                                <MonitorPlay size={11} className="shrink-0" />
                                {g.name}
                                <span className="ml-auto text-[10px] font-normal text-sky-400">
                                    {g.items.length} 项
                                </span>
                            </div>
                            {/* 子条目：每项独立订阅自己的数据（vCheckId） */}
                            {g.items.map((it) => (
                                <VideoCheckItem key={it.id} checkId={it.id} name={it.name} />
                            ))}
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
});
