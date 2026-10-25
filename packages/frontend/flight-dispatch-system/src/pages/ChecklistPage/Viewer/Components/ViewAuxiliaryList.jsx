import { useState } from "react";
import { ChevronRight, PenLine, MonitorPlay } from "lucide-react";

import { AuxiliaryItem } from "../../Editor/Components/AuxiliaryList";
import { STATUS_COLORS } from "../../Editor/Components/statusBadge";
import ViewItem from "./ViewItem";
import { nodeKeyOf } from "../../../../utils/checklistCache";
import useMutilTypeInputStore from "../../../../store/cache.store";

/**
 * ============================================================
 * ViewAuxiliaryList —— 查看页「辅助项目」列（手风琴，双态，自己维持自己）
 * ------------------------------------------------------------
 * mode = "view"（展示态，默认）：ViewItem 纯展示，数据来自 itemMap。
 * mode = "edit"（修改态）：AuxiliaryItem（填写页同款卡片，可改状态 / 时间 /
 *   文字 / 图片），数据走 cache.store，保存时由 checklistViewer.store 统一 collect。
 *
 * 共同行为（与 ViewVideoList 同一套）：
 *   - 按组折叠：组标题（主项名）单击展开子项；**多组可同时展开，互不收起**
 *   - 标题联动状态色：组内任一子项 abnormal → 标题变红 +「有异常项」角标
 *   - 自身不滚 —— 放在查看页的外层滚动容器里随页面一起滚
 *
 * ★ 与填写页的差别：填写页的辅助列**跟着选中的主项走**（一次只显示一个主项的
 *   辅助项）；查看页**不选主项**，把全部主项的辅助项按组列出 —— 看记录时
 *   要的就是"一屏看全"，所以这里收的是整份 schema（mains），不是单个 main。
 * ★ 展开状态是本地 DOM 态（openIds），不进 store：换记录时组件不重挂载也无所谓，
 *   重新点一下就行，没有需要保住的业务状态。
 * ============================================================
 * @param {Array}  mains     模板主项数组（template.schema，内部含 auxiliaries）
 * @param {Object} itemMap   记录项索引 → { uuid: {state,time,text,images} }
 * @param {'view'|'edit'} mode
 * @param {string} keyPrefix 记录维度的缓存键前缀（record-<id>::）
 */
export default function ViewAuxiliaryList({ mains = [], itemMap = {}, mode = "view", keyPrefix, className = "" }) {
    // 展开的组（Set<main.uuid>）：点谁开谁，互不影响
    const [openIds, setOpenIds] = useState(() => new Set());
    const toggle = (uuid) =>
        setOpenIds((prev) => {
            const next = new Set(prev);
            next.has(uuid) ? next.delete(uuid) : next.add(uuid);
            return next;
        });

    // 修改态订阅 cache.store（AuxiliaryItem 自己订阅值，这里只为组标题的异常判定）
    const cacheItems = useMutilTypeInputStore((s) => s.items);
    // 展示态读 itemMap（后端记录），修改态读缓存
    const valueOf = (nodeUuid) => (mode === "view" ? itemMap[nodeUuid] : cacheItems[nodeKeyOf(keyPrefix, nodeUuid)]);

    // 只保留真有辅助项的主项
    const groups = mains.filter((m) => m.auxiliaries?.length);
    const total = groups.reduce((n, m) => n + m.auxiliaries.length, 0);

    return (
        <div className={`flex h-full min-h-0 min-w-0 flex-col rounded-lg border border-slate-300 bg-white ${className}`.trim()}>
            {/* 标题栏：shrink-0 + 列表自己滚 → 标题永远固定在上方，不会被内容盖住 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <PenLine size={13} className="text-sky-600" />
                    辅助项目
                    <span className="text-[12px] font-normal text-slate-400">{total} 项</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MonitorPlay size={11} /> 点击标题展开 / 收起
                </span>
            </div>

            {/* 列表容器：min-h-0 才拿得到剩余高度，滚动在这里 */}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {groups.length ? (
                    groups.map((main) => {
                        const hasAbnormal = main.auxiliaries.some((aux) => valueOf(aux.uuid)?.state === "abnormal");
                        const expanded = openIds.has(main.uuid);

                        return (
                            <div key={main.uuid} className="overflow-hidden rounded-md border border-slate-200">
                                {/* 组标题：单击展开 / 收起；有异常 → 标题变红 */}
                                <button
                                    type="button"
                                    onClick={() => toggle(main.uuid)}
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
                                        {main.name}
                                    </span>
                                    {hasAbnormal && (
                                        <span className={`text-[10px] font-medium ${STATUS_COLORS.abnormal}`}>
                                            有异常项
                                        </span>
                                    )}
                                    <span className="ml-auto text-[10px] font-normal text-slate-400">
                                        {main.auxiliaries.length} 项
                                    </span>
                                </button>

                                {/* 子项：展开才渲染 */}
                                {expanded && (
                                    <div className="space-y-2 border-t border-slate-100 p-2">
                                        {mode === "view"
                                            ? main.auxiliaries.map((aux) => (
                                                  <ViewItem
                                                      key={aux.uuid}
                                                      name={aux.name}
                                                      desc={aux.desc}
                                                      item={itemMap[aux.uuid]}
                                                  />
                                              ))
                                            : main.auxiliaries.map((aux) => (
                                                  <AuxiliaryItem key={aux.uuid} node={aux} keyPrefix={keyPrefix} />
                                              ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                        该模板暂无辅助项目
                    </div>
                )}
            </div>
        </div>
    );
}
