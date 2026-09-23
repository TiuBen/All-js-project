import { ListChecks } from "lucide-react";
import { useChecklistStore, FALLBACK_TEMPLATE_ID } from "../../../../store/checklistStore";
import { countViewStatus, viewStatusOf } from "../../../../utils/ViewColor";
import CheckImage from "../../../../components/CheckImage";
import ViewListShell from "./ViewListShell";
import { StatusIcon } from "./statusView";
// 扁平一维视图数据（由 scripts/gen-view-static.cjs 从 EditorTemplateJson 提取）
import { PASSENGER_INIT_FLIGHT_MAIN_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/passengerInitFlightMainViewJson";
import { PASSENGER_BYPASS_FLIGHT_MAIN_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/passengerBypassFlightMainViewJson";
import { CARGO_INIT_FLIGHT_MAIN_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/cargoInitFlightMainViewJson";
import { CARGO_BYPASS_FLIGHT_MAIN_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/cargoBypassFlightMainViewJson";
import { SHUNHANG_FLIGHT_MAIN_VIEW_JSON } from "../../ChecklistEditor/Template/ViewTemplateJson/shunhangFlightMainViewJson";

/**
 * ============================================================
 * MainCheckList —— 主监控指标（只读一维列表）
 * ------------------------------------------------------------
 * 「穷举法」：一个检查单类型 = 一行映射，编译期确定，零网络、零查表逻辑。
 *   键 = category = 模板 id = 落库 checklist_category（与 store / 配色同一套键）。
 *
 * ★ 为什么是「List」而不是「Tree」
 *   编辑器要树（主节点 → 辅助项，按节点分组填写）；查看页要**通读**：
 *   主监控就是一张一维清单，一条一行往下排，不再折叠、不再缩进。
 *   拍平这件事在编译期做完了（ViewTemplateJson），所以这里只管 map。
 *
 * ★ 零 props：身份与数据全部自订阅
 *   template.id → 选哪份扁平数据；loadedRecord.items → 每一项的填写结果
 *   读写键 `main-<uuid>` 与填写端 MainCheckItem 完全一致。
 * ============================================================
 */
const MAIN_VIEW_BY_CATEGORY = {
    客运始发航班: PASSENGER_INIT_FLIGHT_MAIN_VIEW_JSON,
    客运过站航班: PASSENGER_BYPASS_FLIGHT_MAIN_VIEW_JSON,
    货运始发航班: CARGO_INIT_FLIGHT_MAIN_VIEW_JSON,
    货运过站航班: CARGO_BYPASS_FLIGHT_MAIN_VIEW_JSON,
    顺航检查单: SHUNHANG_FLIGHT_MAIN_VIEW_JSON,
};

export default function MainCheckList() {
    const tplId = useChecklistStore((s) => s.template?.id);
    const items = useChecklistStore((s) => s.loadedRecord?.items) || {};

    const rows = MAIN_VIEW_BY_CATEGORY[tplId] || MAIN_VIEW_BY_CATEGORY[FALLBACK_TEMPLATE_ID];
    const stats = countViewStatus(rows.map((r) => items[r.key]));

    return (
        <ViewListShell
            listKey="main"
            icon={ListChecks}
            count={rows.length}
            stats={stats}
            empty="该航班类型的检查单暂未配置主监控指标"
        >
            {rows.map((r) => {
                const it = items[r.key] || {};
                const s = viewStatusOf(it.status);
                return (
                    <li key={r.key} className="rounded-lg border p-2" style={{ borderColor: s.border, background: s.bg }}>
                        <div className="flex items-start gap-2">
                            {/* 序号 */}
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
                                {/* 标准/要求（模板里的 desc） */}
                                {r.desc && (
                                    <div className="mt-0.5 whitespace-normal break-words text-[11px] leading-snug text-slate-400">
                                        {r.desc}
                                    </div>
                                )}
                                {/* 实际完成时间 */}
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
                                {/* 截图（主监控项目前未接截图录入，留着：哪天接了这里自动显示） */}
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
