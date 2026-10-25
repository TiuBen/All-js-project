/**
 * ============================================================
 * MainList —— 主监控节点列表（填写模式）
 * ------------------------------------------------------------
 * MainCheckItem：模仿 MutilTypeInput 的「自缓存」思路 ——
 * 卡片自己按缓存键读写 cache.store（Comp 版），父组件不接
 * 填写状态、不传回调；刷新 / 重开后自动恢复 state 和 time。
 *
 * ★ 缓存键 = 「草稿键::节点 uuid」（keyPrefix + node.uuid）：
 *   keyPrefix 由 Editor 传下来（= 航班::模板），所以同一个节点在不同航班 /
 *   不同模板下各存各的，切模板 / 切草稿不会串数据。规则见 utils/checklistCache.js。
 *
 * Main 节点的填写值（草稿里只用到两个字段，text/images 恒为空）：
 *   { state, time }
 *   - state：待检查 / 正常 / 异常 / 不适用，
 *     右上角「状态文字 + 图标」单击循环切换（nextStatus）
 *   - time ：实际完成时间（datetime-local，非受控，加载后回填一次）
 *
 * 高亮 / 聚焦：一律自己从 checklistEditorPage.store 取
 * （selectedMainNode 对象身份对比），不从父级层层透传。
 * 选中动作也写回 store —— 辅助列靠同一个 selectedMainNode 决定显示哪个主项，
 * 所以点卡片不需要回调、也不需要父级转发。
 * ============================================================
 */
import { memo, useEffect, useRef } from "react";

import { STATUS_COLORS, STATUS_ICONS, STATUS_LABELS, nextStatus } from "./statusBadge";
import { nodeKeyOf } from "../../../../utils/checklistCache";

import useMutilTypeInputStore from "../../../../store/cache.store";
import { useChecklistStore } from "../../../../store/checklistEditorPage.store";
import { MonitorPlay, Clock3 } from "lucide-react";

/**
 * MainCheckItem —— 主要监控指标「单个节点卡片」（填写模式）
 * ★ 命名导出：查看页修改态（Viewer/Components/ViewMainList）要复用这张卡片，
 *   但不要它外面那层「面板卡 + 标题栏」——那边的标题栏是查看页自己的口径。
 * @param {Object}  node       模板节点（uuid 是它在模板里的身份）
 * @param {string}  keyPrefix  草稿键（航班::模板），本地缓存键的前缀
 */
export const MainCheckItem = memo(function MainCheckItem({ node, index, keyPrefix, disabled = false }) {
    // 本地缓存键 = 草稿前缀 + 节点 uuid（同一节点在不同草稿里各存各的）
    const itemKey = nodeKeyOf(keyPrefix, node.uuid);
    const domId = `main-${itemKey}`;

    const timeRef = useRef(null);
    // 记录「已经向 time input 回填过哪个缓存键」：
    // 非受控只在草稿加载完成后回填一次，之后 DOM 自己管值，不被覆盖
    const appliedKeyRef = useRef(null);

    // 高亮 / 聚焦：一律自己从 store 取
    const isActive = useChecklistStore((s) => s.selectedMainNode === node);
    const setSelectedCheckNode = useChecklistStore((s) => s.setSelectedCheckNode);

    // 填写值（state / time）按缓存键订阅，多个卡片互不牵连重渲染
    const item = useMutilTypeInputStore((s) => s.items[itemKey]);
    const initItem = useMutilTypeInputStore((s) => s.initItem);
    const setState = useMutilTypeInputStore((s) => s.setState);
    const setTime = useMutilTypeInputStore((s) => s.setTime);
    const flushItem = useMutilTypeInputStore((s) => s.flushItem);

    const state = item?.state ?? "";
    const time = item?.time ?? "";
    const loaded = item?.loaded ?? false;

    // --------------------------------------------------------
    // 挂载 / 切节点（或切草稿，键变了）：恢复本地草稿
    // --------------------------------------------------------
    useEffect(() => {
        if (!itemKey) return;

        appliedKeyRef.current = null;
        initItem(itemKey);
    }, [itemKey, initItem]);

    // --------------------------------------------------------
    // 草稿加载完成后回填 time（每个缓存键只回填一次）
    // --------------------------------------------------------
    useEffect(() => {
        if (!loaded || !timeRef.current) return;
        if (appliedKeyRef.current === itemKey) return;

        timeRef.current.value = time;
        appliedKeyRef.current = itemKey;
    }, [loaded, itemKey, time]);

    // --------------------------------------------------------
    // 卸载兜底：把还没落库的内容立即写入（尽力而为）
    // --------------------------------------------------------
    useEffect(() => {
        return () => {
            if (itemKey) flushItem(itemKey);
        };
    }, [itemKey, flushItem]);

    return (
        <div
            id={domId}
            onClick={() => {
                setSelectedCheckNode(node);
            }}
            className={`space-y-2 relative flex min-w-60 shrink-0 cursor-pointer flex-col gap-1.5 rounded-lg border border-gray-300 bg-white p-2 transition-colors hover:bg-primary-50/40 ${
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
                    <span className="text-wrap text-[11px] font-semibold text-blue-400 ml-2">
                        {node?.auxiliaries?.length > 0 && `${node.auxiliaries.length}个辅助`}
                    </span>

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
                        disabled={disabled || !loaded}
                        onClick={(e) => {
                            e.stopPropagation(); // 不触发卡片选中
                            setState(itemKey, nextStatus(state));
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
                    disabled={disabled || !loaded}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                        if (!disabled && loaded) setTime(itemKey, e.target.value);
                    }}
                    className="input min-w-0 flex-1 px-[0.25rem] py-[0.2rem] text-[11px]"
                />
            </label>
        </div>
    );
});

/**
 * MainList —— 主监控节点列表（**不接 props**）。
 * 数据全部自查 store，Editor 里就一个 `<MainList />`：
 *   templateType  当前模板类型（中文名，同时当标题）
 *   mains         该模板的主项数组
 *   draftKey      草稿键，透传给每张卡片拼本地缓存键
 * ★ 切航班 / 切模板 = store 里这三个值变 → 这里跟着重渲染，页面不用管。
 */
export default function MainList() {
    const title = useChecklistStore((s) => s.templateType);
    const mains = useChecklistStore((s) => s.mains);
    const keyPrefix = useChecklistStore((s) => s.draftKey);

    return (
        <div className="flex gap-2 h-full min-w-0 flex-col rounded-lg border border-slate-300 bg-white ">
            {/* 标题栏 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <Clock3 size={13} className="text-sky-600" />
                    {title}
                    <span className="text-[12px] font-normal text-slate-400">{mains?.length ?? 0} 项</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MonitorPlay size={11} /> 截图 / 人工评价
                </span>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
                {(mains ?? []).map((item, index) => (
                    <MainCheckItem key={item.uuid} node={item} index={index} keyPrefix={keyPrefix} />
                ))}
            </div>
        </div>
    );
}
