import { useState } from "react";
import { Camera, ChevronRight, MonitorPlay } from "lucide-react";

import { STATUS_COLORS } from "../../Editor/Components/statusBadge";
import { VideoCheckItem } from "../../Editor/Components/VideoList";
import ViewItem from "./ViewItem";
import { nodeKeyOf } from "../../../../utils/checklistCache";
import useMutilTypeInputStore from "../../../../store/cache.store";

/**
 * ============================================================
 * ViewVideoList —— 查看页「视频监管检查重点」（手风琴，双态）
 * ------------------------------------------------------------
 * mode = "view"（展示态，默认）：
 *   子项 = ViewItem 纯展示，数据来自 itemMap（后端记录的 items 按节点
 *   uuid 建的索引）—— 不经过 cache.store，无任何输入控件。
 * mode = "edit"（修改态，点「修改」进入）：
 *   子项 = VideoCheckItem（填写页同款，可改状态 / 时间 / 文字 / 图片），
 *   数据走 cache.store（keyPrefix + 节点 uuid），保存时统一 collect。
 *
 * 共同行为：
 *   - 按组折叠：标题单击展开子项；**多组可同时展开，互不收起**
 *   - 标题联动状态色：组内任一子项 abnormal → 标题变红 +「有异常项」角标
 *   - 自身不滚 —— 放在查看页的外层滚动容器里随页面一起滚
 *
 * ★ 本文件是 ViewerVideoList.jsx 搬家后的唯一版本（改名为 ViewVideoList，
 *   与 ViewMainList / ViewAuxiliaryList 同目录同口径）；ChecklistViewer 只认这三个。
 * ============================================================
 * @param {Array}  groups    视频监管分组数据（CARGO/SHUNHANG/PASSENGER_VIDEO_FOCUS.groups）
 * @param {Object} itemMap   记录项索引 → { uuid: {state,time,text,images} }
 * @param {'view'|'edit'} mode
 * @param {string} keyPrefix 记录维度的缓存键前缀（record-<id>::）
 */
export default function ViewVideoList({ groups = [], itemMap = {}, mode = "view", keyPrefix, className = "" }) {
    // 展开的组（Set<group.uuid>）：点谁开谁，互不影响
    const [openIds, setOpenIds] = useState(() => new Set());
    const toggle = (uuid) =>
        setOpenIds((prev) => {
            const next = new Set(prev);
            next.has(uuid) ? next.delete(uuid) : next.add(uuid);
            return next;
        });

    // 修改态订阅 cache.store（VideoCheckItem 自己订阅值，这里只为组标题的异常判定）
    const cacheItems = useMutilTypeInputStore((s) => s.items);
    // 展示态读 itemMap（后端记录），修改态读缓存
    const valueOf = (nodeUuid) => (mode === "view" ? itemMap[nodeUuid] : cacheItems[nodeKeyOf(keyPrefix, nodeUuid)]);

    const total = groups.reduce((n, g) => n + (g.items || []).length, 0);

    return (
        <div className={`flex h-full min-h-0 min-w-0 flex-col rounded-lg border border-slate-300 bg-white ${className}`.trim()}>
            {/* 标题栏：shrink-0 + 列表自己滚 → 标题永远固定在上方，不会被内容盖住 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <Camera size={13} className="text-sky-600" />
                    视频监管检查重点
                    <span className="text-[12px] font-normal text-slate-400">{total} 项</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MonitorPlay size={11} /> 点击标题展开 / 收起
                </span>
            </div>

            {/* 列表容器：min-h-0 才拿得到剩余高度，滚动在这里 */}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {groups.length ? (
                    groups.map((g) => {
                        const hasAbnormal = (g.items || []).some((it) => valueOf(it.uuid)?.state === "abnormal");
                        const expanded = openIds.has(g.uuid);

                        return (
                            <div key={g.uuid} className="overflow-hidden rounded-md border border-slate-200">
                                {/* 组标题：单击展开 / 收起；有异常 → 标题变红 */}
                                <button
                                    type="button"
                                    onClick={() => toggle(g.uuid)}
                                    className="flex w-full cursor-pointer items-center gap-1.5 bg-slate-50/80 px-2.5 py-1.5 text-left transition-colors hover:bg-slate-100"
                                    title={expanded ? "点击收起" : "点击展开"}
                                >
                                    <ChevronRight
                                        size={13}
                                        className={`shrink-0 text-slate-400 transition-transform ${
                                            expanded ? "rotate-90" : ""
                                        }`}
                                    />
                                    <span
                                        className={`text-[12px] font-bold ${
                                            hasAbnormal ? STATUS_COLORS.abnormal : "text-sky-700"
                                        }`}
                                    >
                                        {g.name}
                                    </span>
                                    {hasAbnormal && (
                                        <span className={`text-[10px] font-medium ${STATUS_COLORS.abnormal}`}>
                                            有异常项
                                        </span>
                                    )}
                                    <span className="ml-auto text-[10px] font-normal text-slate-400">
                                        {(g.items || []).length} 项
                                    </span>
                                </button>

                                {/* 子项：展开才渲染 */}
                                {expanded && (
                                    <div className="space-y-2 border-t border-slate-100 p-2">
                                        {mode === "view"
                                            ? (g.items || []).map((it) => (
                                                  <ViewItem key={it.uuid} name={it.name} item={itemMap[it.uuid]} />
                                              ))
                                            : (g.items || []).map((it) => (
                                                  <VideoCheckItem
                                                      key={it.uuid}
                                                      nodeKey={nodeKeyOf(keyPrefix, it.uuid)}
                                                      label={it.name}
                                                  />
                                              ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                        该模板暂无视频监管项
                    </div>
                )}
            </div>
        </div>
    );
}
