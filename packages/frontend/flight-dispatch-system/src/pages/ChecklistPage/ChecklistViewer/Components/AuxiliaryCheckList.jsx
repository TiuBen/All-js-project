import { ListTree } from "lucide-react";
import { useChecklistStore, FALLBACK_TEMPLATE_ID } from "../../../../store/checklistStore";
import { countViewStatus, viewStatusOf } from "../../../../utils/ViewColor";
import CheckImage from "../../../../components/CheckImage";
import ViewListShell from "./ViewListShell";
import { StatusIcon } from "./statusView";
// 扁平一维视图数据（由 scripts/gen-view-static.cjs 从 EditorTemplateJson 提取）
import { PASSENGER_INIT_FLIGHT_AUXILIARY_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/passengerInitFlightAuxiliaryViewJson";
import { PASSENGER_BYPASS_FLIGHT_AUXILIARY_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/passengerBypassFlightAuxiliaryViewJson";
import { CARGO_INIT_FLIGHT_AUXILIARY_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/cargoInitFlightAuxiliaryViewJson";
import { CARGO_BYPASS_FLIGHT_AUXILIARY_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/cargoBypassFlightAuxiliaryViewJson";
import { SHUNHANG_FLIGHT_AUXILIARY_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/shunhangFlightAuxiliaryViewJson";

/**
 * ============================================================
 * AuxiliaryCheckList —— 辅助监控指标（只读一维列表）
 * ------------------------------------------------------------
 * 辅助项在模板里是挂在主节点下的（schema[].auxiliaries[]），但查看页
 * **不按节点折叠**：所有辅助项汇总成一条一维清单，按模板顺序排。
 * 每一项右上角带一个「↳ 主节点名」小标签，标明归属 —— 归属信息是
 * 拍平时就写进数据里的（parentName / parentOrder），不在渲染时反查。
 *
 * ★ 读写键 `aux-<uuid>` 与填写端 AuxiliaryCheckItem 完全一致。
 * ★ 零 props：类型取自 store 的 template.id，数据取自 loadedRecord.items。
 * ============================================================
 */
const AUXILIARY_VIEW_BY_CATEGORY = {
    客运始发航班: PASSENGER_INIT_FLIGHT_AUXILIARY_VIEW_JSON,
    客运过站航班: PASSENGER_BYPASS_FLIGHT_AUXILIARY_VIEW_JSON,
    货运始发航班: CARGO_INIT_FLIGHT_AUXILIARY_VIEW_JSON,
    货运过站航班: CARGO_BYPASS_FLIGHT_AUXILIARY_VIEW_JSON,
    顺航检查单: SHUNHANG_FLIGHT_AUXILIARY_VIEW_JSON,
};

export default function AuxiliaryCheckList() {
    const tplId = useChecklistStore((s) => s.template?.id);
    const items = useChecklistStore((s) => s.loadedRecord?.items) || {};

    const rows = AUXILIARY_VIEW_BY_CATEGORY[tplId] || AUXILIARY_VIEW_BY_CATEGORY[FALLBACK_TEMPLATE_ID];
    const stats = countViewStatus(rows.map((r) => items[r.key]));

    return (
        <ViewListShell
            listKey="auxiliary"
            icon={ListTree}
            count={rows.length}
            stats={stats}
            empty="该航班类型的检查单没有辅助监控指标"
        >
            {rows.map((r) => {
                const it = items[r.key] || {};
                const s = viewStatusOf(it.status);
                return (
                    <li key={r.key} className="rounded-lg border p-2" style={{ borderColor: s.border, background: s.bg }}>
                        <div className="flex items-start gap-2">
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">
                                {r.order}
                            </span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                    <span
                                        className="min-w-0 flex-1 whitespace-normal break-words text-[13px] font-semibold"
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
                                {/* 归属：拍平时写进数据的主节点信息 */}
                                <div className="mt-0.5 text-[10px] text-slate-400">
                                    ↳ {r.parentOrder}. {r.parentName}
                                </div>
                                {r.desc && (
                                    <div className="mt-0.5 whitespace-normal break-words text-[11px] leading-snug text-slate-400">
                                        {r.desc}
                                    </div>
                                )}
                                {/* 实际时间 */}
                                {it.time && (
                                    <div className="mt-0.5 tabular-nums text-[11px] text-slate-500">
                                        {String(it.time).replace("T", " ")}
                                    </div>
                                )}
                                {/* 备注 */}
                                {it.note && (
                                    <div className="mt-0.5 whitespace-normal break-words text-[11px] text-slate-500">
                                        {it.note}
                                    </div>
                                )}
                                {/* 截图（现场证据） */}
                                {it.image && (
                                    <div className="mt-1">
                                        <CheckImage image={it.image} size="sm" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ViewListShell>
    );
}
