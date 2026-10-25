/**
 * ============================================================
 * MainList —— 主监控节点列表（填写模式）
 * ------------------------------------------------------------
 * MainCheckItem：模仿 MutilTypeInput 的「自缓存」思路 ——
 * 卡片自己按 node.uuid 读写 cache.store（Comp 版），父组件不接
 * 填写状态、不传回调；刷新 / 重开后自动恢复 state 和 time。
 *
 * Main 节点的填写值（草稿里只用到两个字段，text/images 恒为空）：
 *   { state, time }
 *   - state：待检查 / 正常 / 异常 / 不适用，
 *     右上角「状态文字 + 图标」单击循环切换（nextStatus）
 *   - time ：实际完成时间（datetime-local，非受控，加载后回填一次）
 *
 * 高亮 / 聚焦：一律自己从 checklistEditorPage.store 取
 * （selectedMainNode 对象身份对比），不从父级层层透传。
 * ============================================================
 */
import { memo, useEffect, useRef } from "react";

import {
    STATUS_COLORS,
    STATUS_ICONS,
    STATUS_LABELS,
    nextStatus,
} from "../MutilTypeInput/statusBadge";

import useCacheStore from "./cache.store";
import { useChecklistStore } from "./checklistEditorPage.store";

/**
 * MainCheckItem —— 主要监控指标「单个节点卡片」（填写模式）
 */
const MainCheckItem = memo(function MainCheckItem({ node, index, onSelect }) {
    const uuid = node.uuid; // 节点身份 = uuid（也是本地草稿的 key）
    const itemKey = `main-${uuid}`;

    const timeRef = useRef(null);
    // 记录「已经向 time input 回填过哪个 uuid」：
    // 非受控只在草稿加载完成后回填一次，之后 DOM 自己管值，不被覆盖
    const appliedUuidRef = useRef(null);

    // 高亮 / 聚焦：一律自己从 store 取
    const isActive = useChecklistStore((s) => s.selectedMainNode === node);
    const setSelectedCheckNode = useChecklistStore((s) => s.setSelectedCheckNode);

    // 填写值（state / time）按 uuid 订阅，多个卡片互不牵连重渲染
    const item = useCacheStore((s) => s.items[uuid]);
    const initItem = useCacheStore((s) => s.initItem);
    const setState = useCacheStore((s) => s.setState);
    const setTime = useCacheStore((s) => s.setTime);
    const flushItem = useCacheStore((s) => s.flushItem);

    const state = item?.state ?? "";
    const time = item?.time ?? "";
    const loaded = item?.loaded ?? false;

    // --------------------------------------------------------
    // 挂载 / 切节点：恢复本地草稿
    // --------------------------------------------------------
    useEffect(() => {
        if (!uuid) return;

        appliedUuidRef.current = null;
        initItem(uuid);
    }, [uuid, initItem]);

    // --------------------------------------------------------
    // 草稿加载完成后回填 time（每个 uuid 只回填一次）
    // --------------------------------------------------------
    useEffect(() => {
        if (!loaded || !timeRef.current) return;
        if (appliedUuidRef.current === uuid) return;

        timeRef.current.value = time;
        appliedUuidRef.current = uuid;
    }, [loaded, uuid, time]);

    // --------------------------------------------------------
    // 卸载兜底：把还没落库的内容立即写入（尽力而为）
    // --------------------------------------------------------
    useEffect(() => {
        return () => {
            if (uuid) flushItem(uuid);
        };
    }, [uuid, flushItem]);

    return (
        <div
            id={itemKey}
            onClick={() => {
                setSelectedCheckNode(node);
                onSelect?.(uuid);
            }}
            className={`relative flex min-w-60 shrink-0 cursor-pointer flex-col gap-1.5 rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-primary-50/40 ${
                isActive ? "border-amber-300 bg-amber-50/70" : ""
            }`}
        >
            {/* 序号 + 名称 + 状态（右上角单击循环切换） */}
            <div className="flex items-start gap-2">
                <span
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        isActive ? "bg-amber-400 text-white" : "bg-primary-50 text-primary-700"
                    }`}
                >
                    {index + 1}
                </span>

                <span className="text-wrap text-[14px] font-semibold text-slate-800" title={node.name}>
                    {node?.name}
                    <div className="text-wrap text-[11px] text-slate-400" title={node?.desc || "—"}>
                        {node?.desc || "—"}
                    </div>
                </span>

                {/* 状态：单击循环切换（待检查→正常→异常→不适用→…），hover 显示提示 */}
                <label
                    className={`ml-auto flex shrink-0 items-center gap-1 border-b text-[11px] ${
                        STATUS_COLORS[state] || "text-blue-500"
                    }`}
                    title={`状态：${STATUS_LABELS[state] || "待检查"}（单击切换）`}
                >
                    <span>{STATUS_LABELS[state] || "待检查"}</span>
                    <button
                        type="button"
                        disabled={!loaded}
                        onClick={(e) => {
                            e.stopPropagation(); // 不触发卡片选中
                            setState(uuid, nextStatus(state));
                        }}
                        className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-125 disabled:opacity-40"
                        title={`状态：${STATUS_LABELS[state] || "待检查"}（单击切换）`}
                    >
                        {STATUS_ICONS[state]}
                    </button>
                </label>
            </div>

            {/* 实际完成时间：非受控；点输入框不触发卡片选中 */}
            <label className="mt-auto flex items-center gap-1.5 text-[12px] text-slate-500">
                实际完成时间
                <input
                    ref={timeRef}
                    type="datetime-local"
                    defaultValue=""
                    disabled={!loaded}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        if (loaded) setTime(uuid, e.target.value);
                    }}
                    className="input min-w-0 flex-1 px-[0.25rem] py-[0.2rem] text-[11px]"
                />
            </label>
        </div>
    );
});

/**
 * MainList —— 主监控节点列表。
 * 选中高亮由 store 的 selectedMainNode 驱动，这里不透传选中态；
 * onSelect 只负责通知父级「用户点了哪个主项」（用于联动辅助列等）。
 */
function MainList({ mains, onSelect }) {
    return (
        <div className="flex min-h-0 flex-col gap-2">
            {(mains ?? []).map((item, index) => (
                <MainCheckItem key={item.uuid} node={item} index={index} onSelect={onSelect} />
            ))}
        </div>
    );
}

export default MainList;
