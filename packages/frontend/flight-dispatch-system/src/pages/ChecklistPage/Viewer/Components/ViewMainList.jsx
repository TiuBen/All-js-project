import { Clock3, MonitorPlay } from "lucide-react";

import { MainCheckItem } from "../../Editor/Components/MainList";
import ViewItem from "./ViewItem";

/**
 * ============================================================
 * ViewMainList —— 查看页「主要项目」列（双态，自己维持自己）
 * ------------------------------------------------------------
 * mode = "view"（展示态，默认）：
 *   每项 = ViewItem 纯展示，数据来自 itemMap（后端记录的 items 按节点
 *   uuid 建的索引）—— 不经过 cache.store、没有任何输入控件。
 * mode = "edit"（修改态，点「修改」进入）：
 *   每项 = MainCheckItem（填写页同款卡片），数据走 cache.store
 *   （keyPrefix + 节点 uuid），保存时由 checklistViewer.store 统一 collect。
 *
 * ★ 复用 MainCheckItem 的**命名导出**，不用整块 MainList：
 *   查看页的标题栏（「主要项目 + N 项 + 只读/修改中」）是查看页自己的口径，
 *   套一层 MainList 会出现两张卡片边框。
 * ★ 本组件只读 props、不订阅任何 store —— 修改态的数据由每张
 *   MainCheckItem 自己按缓存键订阅，改一项只重渲染那一张卡。
 * ============================================================
 * @param {Array}  mains     模板主项数组（template.schema）
 * @param {Object} itemMap   记录项索引 → { uuid: {state,time,text,images} }
 * @param {'view'|'edit'} mode
 * @param {string} keyPrefix 记录维度的缓存键前缀（record-<id>::）
 */
export default function ViewMainList({ mains = [], itemMap = {}, mode = "view", keyPrefix, className = "" }) {
    const editing = mode === "edit";

    return (
        <div className={`flex h-full min-h-0 min-w-0 flex-col rounded-lg border border-slate-300 bg-white ${className}`.trim()}>
            {/* 标题栏：shrink-0 + 列表自己滚 → 标题永远固定在上方，不会被内容盖住 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <Clock3 size={13} className="text-sky-600" />
                    主要项目
                    <span className="text-[12px] font-normal text-slate-400">{mains.length} 项</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MonitorPlay size={11} /> {editing ? "修改中" : "只读"}
                </span>
            </div>

            {/* 列表容器：min-h-0 才拿得到剩余高度，滚动在这里 */}
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
                {mains.length ? (
                    editing ? (
                        mains.map((node, index) => (
                            <MainCheckItem key={node.uuid} node={node} index={index} keyPrefix={keyPrefix} />
                        ))
                    ) : (
                        mains.map((node) => (
                            <ViewItem key={node.uuid} name={node.name} desc={node.desc} item={itemMap[node.uuid]} />
                        ))
                    )
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                        该模板暂无主要项目
                    </div>
                )}
            </div>
        </div>
    );
}
