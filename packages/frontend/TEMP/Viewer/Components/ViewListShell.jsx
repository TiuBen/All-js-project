import { VIEW_LIST, VIEW_STATUS, VIEW_STATUS_ORDER } from "../../../../utils/ViewColor";

/**
 * ============================================================
 * ViewListShell —— 查看页三个 CheckList 的公共外壳
 * ------------------------------------------------------------
 * 三个列表长得一样，只有"数据 + 一行怎么画"不同，所以把外壳抽出来：
 *   统计条（列表名 + 总项数 + 异常/不适用/待检查/正常 计数）
 *   + 可滚动的一维列表容器
 *
 * ★ 不做任何滚动吸附（sticky / fixed）：列表就是老老实实往下滚，
 *   分组标题也随内容滚走 —— 查看页要的是"通读一遍"，不需要常驻标题。
 * ★ 配色全部来自 utils/ViewColor.js，本文件不写死颜色。
 * ============================================================
 * @param {string} props.listKey main | auxiliary | video（取 VIEW_LIST 的标题与主色）
 * @param {Object} props.icon    标题前的小图标（lucide 组件）
 * @param {number} props.count   列表总项数（模板项数，不是已填项数）
 * @param {Object} props.stats   countViewStatus() 的结果
 * @param {string} [props.empty] 空态文案（count 为 0 时显示）
 * @param {React.ReactNode} props.children 行（<li> 数组）
 * ============================================================
 */
export default function ViewListShell({ listKey, icon: Icon, count, stats, empty, children }) {
    const L = VIEW_LIST[listKey];

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            {/* 统计条 */}
            <div
                className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-slate-200 px-3 py-2 text-xs"
                style={{ background: L.soft }}
            >
                <span className="flex items-center gap-1.5 font-semibold" style={{ color: L.accent }}>
                    {Icon && <Icon size={13} />}
                    {L.label}
                    <span className="font-normal text-slate-400">{count} 项</span>
                </span>
                {stats.total > 0 &&
                    VIEW_STATUS_ORDER.map(
                        (k) =>
                            stats[k] > 0 && (
                                <span key={k} className="flex items-center gap-1" style={{ color: VIEW_STATUS[k].color }}>
                                    <span
                                        className="inline-block h-1.5 w-1.5 rounded-full"
                                        style={{ background: VIEW_STATUS[k].dot }}
                                    />
                                    {VIEW_STATUS[k].label} {stats[k]}
                                </span>
                            )
                    )}
            </div>

            {/* 一维列表 */}
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
                {count === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                        {empty}
                    </div>
                ) : (
                    <ul className="space-y-1.5">{children}</ul>
                )}
            </div>
        </div>
    );
}
