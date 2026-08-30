import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { CheckCircle2, CircleDot, Circle, ChevronDown, ChevronRight, Camera, Columns3, Columns2, List } from "lucide-react";
import { statusStyle, StatusIcon } from "./statusView";
import AuxiliaryList from "./AuxiliaryList";
import VideoList from "./VideoList";

/**
 * ============================================================
 * ChecklistTreeView —— 已填检查单的树形只读展示组件
 * ------------------------------------------------------------
 * 用 <ul> 树形结构展示一条已填好的检查单记录：
 *   主监控指标(节点) → 辅助监控指标(AuxiliaryList) → 视频监管项(VideoList)
 *   - 状态为 ok        → 正常字体色（深灰），绿勾
 *   - 状态为 abnormal  → 红色字体 + 红点
 *   - 未填/na          → 灰色
 * 默认全部折叠；顶部可切换 1栏 / 2栏 / 3栏 布局（默认 3 栏）。
 * 已适配 v3 模板结构（schema 顶层 + id 定位 + videoSupervision 顶层），兼容旧结构。
 * ============================================================
 */
export default function ChecklistTreeView({ template, record, flight }) {
  // 展开状态：Set<节点定位键>（包含 = 展开），默认全部折叠
  const [expanded, setExpanded] = useState(() => new Set());
  // 栏数：1 | 2 | 3（默认 3）
  const [cols, setCols] = useState(3);

  // 记录数据（兼容字段名）
  const items = record?.items || {};
  const videoItems = record?.video_supervision || {};
  const flightType = record?.flight_type || flight?.flightType || "常规航班";
  // 新结构：schema 顶层；兼容旧：flightTypes
  const nodes = template?.schema || template?.flightTypes?.[flightType] || [];

  // 节点定位键：新结构用 id；兼容旧结构 source.seq / seq
  const getNodeId = (n) => n?.id ?? n?.source?.seq ?? n?.seq;

  // 视频项：新结构节点顶层 videoSupervision[]；兼容旧 auxiliaries[].auxiliary[]
  const videoByNode = useMemo(() => {
    const map = {};
    nodes.forEach((n) => {
      const list = [];
      (n.videoSupervision || []).forEach((v) => {
        list.push({ uuid: v.uuid, groupTitle: v.group || "", desc: v.desc });
      });
      if (!list.length) {
        (n.auxiliaries || []).forEach((a) => {
          (a.auxiliary || []).forEach((v) => {
            list.push({ uuid: v.uuid, groupTitle: v.group || "", desc: v.desc });
          });
        });
      }
      if (list.length) map[getNodeId(n)] = list;
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
      const nid = getNodeId(n);
      countItem(items[`main-${nid}`]);
      (n.auxiliaries || []).forEach((a) => {
        const aKey = `aux-${a.id ?? a.row ?? a.source?.row}`;
        countItem(items[aKey] || items[`aux-${a.row}`]);
      });
      (videoByNode[nid] || []).forEach((v) => countItem(videoItems[`video-${v.uuid}`]));
    });
    return { ok, abnormal, pending };
  }, [nodes, items, videoItems, videoByNode]);

  const toggleExpand = (nid) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(nid)) next.delete(nid);
      else next.add(nid);
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
          <ul className={cn(colCls)} style={{ columnGap: "0.75rem" }}>
            {nodes.map((n) => {
              const nid = getNodeId(n);
              const mainKey = `main-${nid}`;
              const mainItem = items[mainKey] || {};
              const isExpanded = expanded.has(nid);
              return (
                <li
                  key={mainKey}
                  className="mb-3 inline-block w-full break-inside-avoid rounded-lg border border-slate-200 bg-slate-50/40"
                >
                  {/* ===== 主监控指标 ===== */}
                  <div
                    className="flex cursor-pointer items-center gap-2 rounded-t-lg px-3 py-2 hover:bg-slate-100/60"
                    onClick={() => toggleExpand(nid)}
                  >
                    {isExpanded ? (
                      <ChevronDown size={14} className="shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight size={14} className="shrink-0 text-slate-400" />
                    )}
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[11px] font-bold text-primary-700">
                      {nid}
                    </span>
                    <span className={cn("min-w-0 truncate text-[13px] font-semibold", statusStyle(mainItem))} title={n.name}>
                      {n.name}
                    </span>
                    {n.responsible && (
                      <span className="shrink-0 rounded bg-violet-50 px-1 py-0.5 text-[9px] text-violet-600">{n.responsible}</span>
                    )}
                    {mainItem.time && <span className="ml-auto shrink-0 tabular-nums text-xs text-slate-500">{mainItem.time}</span>}
                    <span className="shrink-0">
                      <StatusIcon item={mainItem} />
                    </span>
                  </div>
                  {mainItem.note && (
                    <div className="whitespace-normal break-words px-11 pb-1 text-[11px] text-slate-500">{mainItem.note}</div>
                  )}

                  {/* ===== 子项：辅助监控指标 + 视频监管项 ===== */}
                  {isExpanded && (
                    <>
                      <AuxiliaryList auxiliaries={n.auxiliaries || []} items={items} />
                      <VideoList videos={videoByNode[nid] || []} videoItems={videoItems} />
                    </>
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
