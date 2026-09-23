import { Fragment, useMemo } from "react";
import { Camera, MonitorPlay } from "lucide-react";
import { useChecklistStore, FALLBACK_TEMPLATE_ID } from "../../../../store/checklistStore";
import { countViewStatus, viewStatusOf, VIEW_LIST } from "../../../../utils/ViewColor";
import CheckImage from "../../../../components/CheckImage";
import ViewListShell from "./ViewListShell";
import { StatusIcon } from "./statusView";
// 扁平一维视图数据（由 scripts/gen-view-static.cjs 从 EditorTemplateJson 提取）
import { PASSENGER_INIT_FLIGHT_VIDEO_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/passengerInitFlightVideoViewJson";
import { PASSENGER_BYPASS_FLIGHT_VIDEO_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/passengerBypassFlightVideoViewJson";
import { CARGO_INIT_FLIGHT_VIDEO_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/cargoInitFlightVideoViewJson";
import { CARGO_BYPASS_FLIGHT_VIDEO_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/cargoBypassFlightVideoViewJson";
import { SHUNHANG_FLIGHT_VIDEO_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/shunhangFlightVideoViewJson";

/**
 * ============================================================
 * VideoCheckList —— 视频监管检查重点（只读一维列表）
 * ------------------------------------------------------------
 * 数据源本身是「平面」的：模板里视频监管是独立一份数据
 * （EditorTemplateJson/xxxVideoFocus.js 的 groups[]），节点保障 JSON 里
 * 没有任何 videoSupervision 字段 —— 视频项与主监控节点**没有从属关系**。
 * 所以它一直是独立一块，只是现在也跟着拍平成一维。
 *
 * ★ 分组怎么表示：数据是**一维**的，每项带 groupUuid / groupName，
 *   渲染时「上一项的 groupUuid 与本次不同」就插一条分组标题 ——
 *   视觉上仍是分组，结构上仍是一维（不嵌套、不折叠）。
 *   分组标题**不做 sticky 吸附**，随内容一起滚走。
 *
 * ★ 读写键 = 视频项 uuid（与填写端 VideoCheckItem 完全一致，没有前缀）。
 * ★ 类型 → 数据源与编辑器第三列同一套 key（category = 模板 id）。
 * ============================================================
 */
const VIDEO_VIEW_BY_CATEGORY = {
    客运始发航班: PASSENGER_INIT_FLIGHT_VIDEO_VIEW_JSON,
    客运过站航班: PASSENGER_BYPASS_FLIGHT_VIDEO_VIEW_JSON,
    货运始发航班: CARGO_INIT_FLIGHT_VIDEO_VIEW_JSON,
    货运过站航班: CARGO_BYPASS_FLIGHT_VIDEO_VIEW_JSON,
    顺航检查单: SHUNHANG_FLIGHT_VIDEO_VIEW_JSON,
};

export default function VideoCheckList() {
    const tplId = useChecklistStore((s) => s.template?.id);
    const videoItems = useChecklistStore((s) => s.loadedRecord?.video_supervision) || {};

    const rows = VIDEO_VIEW_BY_CATEGORY[tplId] || VIDEO_VIEW_BY_CATEGORY[FALLBACK_TEMPLATE_ID];
    const stats = countViewStatus(rows.map((r) => videoItems[r.key]));

    // 每个分组的条目数（分组标题右侧显示）
    const groupCount = useMemo(() => {
        const m = {};
        rows.forEach((r) => {
            m[r.groupUuid] = (m[r.groupUuid] || 0) + 1;
        });
        return m;
    }, [rows]);

    return (
        <ViewListShell
            listKey="video"
            icon={Camera}
            count={rows.length}
            stats={stats}
            empty="该检查单类型暂无视频监管项"
        >
            {rows.map((r, i) => {
                const it = videoItems[r.key] || {};
                const s = viewStatusOf(it.status);
                // 一维数据里靠"分组变了"插标题（i===0 时也插）
                const newGroup = i === 0 || rows[i - 1].groupUuid !== r.groupUuid;
                return (
                    <Fragment key={r.key}>
                        {newGroup && (
                            <li
                                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-semibold text-slate-600"
                                style={{ background: VIEW_LIST.video.soft }}
                            >
                                <MonitorPlay size={11} className="shrink-0" />
                                {r.groupName}
                                <span className="ml-auto text-[10px] font-normal text-slate-400">
                                    {groupCount[r.groupUuid]} 项
                                </span>
                            </li>
                        )}
                        <li
                            className="rounded-lg border p-2"
                            style={{ borderColor: s.border, background: s.bg }}
                        >
                            <div className="flex items-start gap-2">
                                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                                    {r.order}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start gap-2">
                                        <span
                                            className="min-w-0 flex-1 whitespace-normal break-words text-[13px] leading-snug"
                                            style={{ color: s.color }}
                                        >
                                            {r.name}
                                        </span>
                                        <span
                                            className="flex shrink-0 items-center gap-1 text-[11px]"
                                            style={{ color: s.color }}
                                        >
                                            <StatusIcon item={it} />
                                            {s.label}
                                        </span>
                                    </div>
                                    {/* 检查记录：文字 */}
                                    {it.note && (
                                        <div className="mt-0.5 whitespace-normal break-words text-[11px] text-slate-500">
                                            {it.note}
                                        </div>
                                    )}
                                    {/* 检查记录：截图 */}
                                    {it.image && (
                                        <div className="mt-1">
                                            <CheckImage image={it.image} size="sm" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    </Fragment>
                );
            })}
        </ViewListShell>
    );
}
