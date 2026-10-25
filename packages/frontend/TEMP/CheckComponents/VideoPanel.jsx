import { memo } from "react";
import { Camera, MonitorPlay } from "lucide-react";
import VideoCheckItem from "./VideoCheckItem";

/**
 * ============================================================
 * VideoPanel —— 视频监管检查重点面板（填写模式）
 * ------------------------------------------------------------
 * 按 groups 分组渲染：
 *   - 每个 group 是"视频监管检查重点（xxx）"大类，items 为子条目
 *   - **数据已按检查单类型分离**（客运 38 / 货运 40 / 顺航 42，各一份独立数据），
 *     因此本面板不做任何过滤 —— 传进来什么就渲染什么
 *
 * ★ 数据源由所属面板组显式声明
 *   `<VideoPanel source={CARGO_VIDEO_FOCUS} />`
 *   source 就是面板组顶部**静态 import** 的那份视频监管数据
 *   （EditorTemplateJson/passengerVideoFocus · cargoVideoFocus · shunhangVideoFocus），
 *   编译期确定、零网络。
 *
 * ★ 本面板**零 store 订阅、零副作用**（重渲染红线，别破坏）
 *   - 不订阅 videoItems：单条目的展示/交互下沉到 VideoCheckItem（自行订阅），
 *     改一条只重渲染那一行
 *   - 不订阅 selectedCheckNode：选中节点与视频栏无关（不滚顶、不联动）
 *   结论：只有 source 换份（切换检查单类型）时本面板才重渲染。
 * ============================================================
 * @param {Object|string} props.source 本类型的视频监管数据（或其在 EditorTemplateJson 中的导出名）
 * ============================================================
 */
export default memo(function VideoPanel({ source }) {
    const groups = source?.groups || [];
    const total = groups.reduce((s, g) => s + (g.items || []).length, 0);

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
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
                {groups.length ? (
                    groups.map((g) => (
                        <div key={g.uuid} className="space-y-2">
                            {/* 分组标题（大类） */}
                            <div className="sticky top-0 z-10 flex items-center gap-1 rounded-md bg-sky-50/95 px-2 py-1 text-[12px] font-bold text-sky-700 backdrop-blur">
                                <MonitorPlay size={11} className="shrink-0" />
                                {g.name}
                                <span className="ml-auto text-[10px] font-normal text-sky-400">
                                    {(g.items || []).length} 项
                                </span>
                            </div>
                            {/* 子条目：每项独立订阅自己的数据（视频项 uuid） */}
                            {(g.items || []).map((it) => (
                                <VideoCheckItem key={it.uuid} checkUuid={it.uuid} name={it.name} />
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
