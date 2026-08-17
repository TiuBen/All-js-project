import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { CheckCircle2, CircleDot, Circle, ChevronDown, ChevronRight, Camera, Columns3, Columns2, List } from "lucide-react";

/**
 * ============================================================
 * ChecklistTreeView —— 已填检查单的树形只读展示组件
 * ------------------------------------------------------------
 * 用 <ul> 树形结构展示一条已填好的检查单记录：
 *   主监控指标(节点) → 辅助监控指标 → 视频监管项
 *   - 状态为 ok        → 正常字体色（深灰），绿勾
 *   - 状态为 abnormal  → 红色字体 + 红点
 *   - 未填/na          → 灰色
 * 默认全部折叠；顶部可切换 1栏 / 2栏 / 3栏 布局（默认 3 栏）。
 * ============================================================
 */
export default function ChecklistTreeView({ template, record, flight }) {
  // 展开状态：Set<mainSeq>（包含 = 展开），默认全部折叠
  const [expanded, setExpanded] = useState(() => new Set());
  // 栏数：1 | 2 | 3（默认 3）
  const [cols, setCols] = useState(3);

  // 记录数据（兼容字段名）
  const items = record?.items || {};
  const videoItems = record?.video_supervision || {};
  const flightType = record?.flight_type || flight?.flightType || "常规航班";
  const nodes = template?.flightTypes?.[flightType] || [];

  const getSeq = (n) => n?.source?.seq ?? n?.seq;

  // 收集视频项（嵌套在 aux.auxiliary[]）
  const videoByNode = useMemo(() => {
    const map = {};
    nodes.forEach((n) => {
      const list = [];
      (n.auxiliaries || []).forEach((a) => {
        (a.auxiliary || []).forEach((v) => {
          list.push({ uuid: v.uuid, groupTitle: v.group || "", desc: v.desc, row: v.source?.row, auxName: a.name });
        });
      });
      if (list.length) map[getSeq(n)] = list;
    });
    return map;
  }, [nodes]);

  // 统计
  const stats = useMemo(() => {
    let ok = 0, abnormal = 0, pending = 0;
    const countItem = (item) => {
      if (!item || !item.status) { pending++; return; }
      if (item.status === "ok") ok++;
      else if (item.status === "abnormal") abnormal++;
      else pending++;
    };
    nodes.forEach((n) => {
      const seq = getSeq(n);
      countItem(items[`main-${seq}`]);
      (n.auxiliaries || []).forEach((a) => {
        const aKey = `aux-${a.source?.row ?? a.row}`;
        countItem(items[aKey] || items[`aux-${a.row}`]);
      });
      (videoByNode[seq] || []).forEach((v) => countItem(videoItems[`video-${v.uuid}`]));
    });
    return { ok, abnormal, pending };
  }, [nodes, items, videoItems, videoByNode]);

  // 单项状态样式
  const statusStyle = (item) => {
    if (!item?.status) return "text-slate-400";
    if (item.status === "abnormal") return "text-red-600";
    return "text-slate-700";
  };
  const statusIcon = (item) => {
    if (!item?.status) return <Circle size={13} className="text-slate-300" />;
    if (item.status === "abnormal") return <CircleDot size={13} className="text-red-500" />;
    return <CheckCircle2 size={13} className="text-emerald-500" />;
  };

  const toggleExpand = (seq) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(seq)) next.delete(seq);
      else next.add(seq);
      return next;
    });
  };

  // 栏数配置：使用 CSS columns 多列布局（节点先填满第一列，再流到下一列）
  const colCls = cols === 1 ? "columns-1" : cols === 2 ? "columns-1 md:columns-2" : "columns-1 md:columns-2 xl:columns-3";
  const ColBtn = ({ n, icon: Icon, label }) => (
    <button
      onClick={() => setCols(n)}
      className={cn(
        "flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors",
        cols === n ? "bg-primary-600 text-white" : "text-slate-500 hover:bg-slate-100"
      )}
      title={`${n} 栏布局`}
    >
      <Icon size={11} /> {label}
    </button>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      {/* 顶部统计条 + 栏数切换 */}
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs">
        <span className="font-semibold text-slate-600">{flightType}检查单 · 查看</span>
        <span className="flex items-center gap-1 text-emerald-600">
          <CheckCircle2 size={13} /> 正常 {stats.ok}
        </span>
        <span className="flex items-center gap-1 text-red-600">
          <CircleDot size={13} /> 异常 {stats.abnormal}
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <Circle size={13} /> 未填 {stats.pending}
        </span>
        <span className="ml-auto flex items-center gap-0.5 rounded-md border border-slate-200 bg-white p-0.5">
          <ColBtn n={1} icon={List} label="1栏" />
          <ColBtn n={2} icon={Columns2} label="2栏" />
          <ColBtn n={3} icon={Columns3} label="3栏" />
        </span>
      </div>

      {/* 多列布局：节点先填满第一列，再流到下一列；每个节点是独立框（break-inside-avoid） */}
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {nodes.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">该航班类型的检查单暂未配置</div>
        ) : (
          <ul
            className={cn(colCls)}
            style={{ columnGap: "0.75rem" }}
          >
            {nodes.map((n) => {
              const seq = getSeq(n);
              const mainKey = `main-${seq}`;
              const mainItem = items[mainKey] || {};
              const auxiliaries = n.auxiliaries || [];
              const videos = videoByNode[seq] || [];
              const isExpanded = expanded.has(seq);
              return (
                <li
                  key={mainKey}
                  className="mb-3 inline-block w-full break-inside-avoid rounded-lg border border-slate-200 bg-slate-50/40"
                >
                  {/* ===== 主监控指标 ===== */}
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-t-lg px-3 py-2 hover:bg-slate-100/60"
                    onClick={() => toggleExpand(seq)}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight size={14} className="shrink-0 text-slate-400" />
                    )}
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[11px] font-bold text-primary-700">
                      {seq}
                    </span>
                    <span className={cn("min-w-0 truncate text-[13px] font-semibold", statusStyle(mainItem))} title={n.name}>
                      {n.name}
                    </span>
                    {n.responsible && (
                      <span className="shrink-0 rounded bg-violet-50 px-1 py-0.5 text-[9px] text-violet-600">{n.responsible}</span>
                    )}
                    {mainItem.time && <span className="ml-auto shrink-0 tabular-nums text-xs text-slate-500">{mainItem.time}</span>}
                    <span className="shrink-0">{statusIcon(mainItem)}</span>
                  </div>
                  {mainItem.note && (
                    <div className="whitespace-normal break-words px-11 pb-1 text-[11px] text-slate-500">{mainItem.note}</div>
                  )}

                  {/* ===== 子项：辅助监控指标 + 视频监管项 ===== */}
                  {isExpanded && (
                    <ul className="space-y-1 px-2 pb-2 pt-1">
                      {auxiliaries.map((a, ai) => {
                        const aKey = `aux-${a.source?.row ?? a.row}`;
                        const aItem = items[aKey] || items[`aux-${a.row}`] || {};
                        const aVideos = a.auxiliary || [];
                        return (
                          <li key={`${seq}-aux-${ai}`} className="rounded-md border border-slate-100 bg-white">
                            {/* 标题行：名称 + 时间 + 状态图标（不再挤压描述） */}
                            <div className="flex items-center gap-2 px-3 py-1.5">
                              <span className="pl-2 text-[11px] text-slate-400">↳</span>
                              <span className={cn("min-w-0 flex-1 truncate text-[12px] font-medium", statusStyle(aItem))} title={a.name}>
                                {a.name}
                              </span>
                              {aItem.time && <span className="shrink-0 tabular-nums text-[11px] text-slate-500">{aItem.time}</span>}
                              <span className="shrink-0">{statusIcon(aItem)}</span>
                            </div>
                            {/* 描述行：独立行，支持换行 */}
                            {a.desc && (
                              <div className="whitespace-normal break-words px-3 pb-1 pl-9 text-[10px] leading-snug text-slate-500">
                                {a.desc}
                              </div>
                            )}
                            {aItem.note && (
                              <div className="whitespace-normal break-words px-3 pb-1 pl-9 text-[11px] text-slate-500">
                                {aItem.note}
                              </div>
                            )}

                            {/* ===== 视频监管项（第三层） ===== */}
                            {aVideos.length > 0 && (
                              <ul className="space-y-1 px-5 pb-1.5">
                                {aVideos.map((v, vi) => {
                                  const vKey = `video-${v.uuid}`;
                                  const vItem = videoItems[vKey] || {};
                                  return (
                                    <li key={`${seq}-${ai}-${vi}`} className="rounded border border-sky-50 bg-sky-50/30 px-2.5 py-1">
                                      {/* 分组标题行 */}
                                      {(v.groupTitle || vItem.status) && (
                                        <div className="flex items-center gap-1.5">
                                          <Camera size={11} className="shrink-0 text-sky-400" />
                                          {v.groupTitle && (
                                            <span className="shrink-0 rounded bg-sky-100 px-1 py-0.5 text-[9px] font-medium text-sky-600">
                                              {v.groupTitle}
                                            </span>
                                          )}
                                          <span className="ml-auto shrink-0">{statusIcon(vItem)}</span>
                                        </div>
                                      )}
                                      {/* 描述行：独立行，支持换行（修复长文本不换行 bug） */}
                                      <div className={cn("mt-1 whitespace-normal break-words text-[11px] leading-snug", statusStyle(vItem))}>
                                        {v.desc}
                                      </div>
                                      {vItem.note && (
                                        <div className="mt-0.5 whitespace-normal break-words text-[10px] text-slate-500">
                                          {vItem.note}
                                        </div>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </li>
                        );
                      })}
                      {auxiliaries.length === 0 && (
                        <li className="px-3 py-1 text-[11px] text-slate-400">该节点无辅助监控指标</li>
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
