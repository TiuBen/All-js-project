import { Camera } from "lucide-react";
import { cn } from "../../lib/utils";
import { statusStyle, StatusIcon } from "./statusView";

/**
 * ============================================================
 * VideoList —— 视频监管检查重点（只读展示）
 * ------------------------------------------------------------
 * 渲染一个主节点下的全部视频监管项（type: video）：
 *   分组标题行 + 描述行（可换行） + 备注
 * 视频项以 uuid 定位（video-${uuid}），新旧结构通用。
 * ============================================================
 */
export default function VideoList({ videos = [], videoItems = {} }) {
  if (!videos.length) return null;

  return (
    <ul className="space-y-1 px-5 pb-1.5">
      {videos.map((v, vi) => {
        const vKey = `video-${v.uuid}`;
        const vItem = videoItems[vKey] || {};
        return (
          <li
            key={vKey ?? `${vi}-video`}
            className="rounded border border-sky-50 bg-sky-50/30 px-2.5 py-1"
          >
            {/* 分组标题行 */}
            {(v.groupTitle || vItem.status) && (
              <div className="flex items-center gap-1.5">
                <Camera size={11} className="shrink-0 text-sky-400" />
                {v.groupTitle && (
                  <span className="shrink-0 rounded bg-sky-100 px-1 py-0.5 text-[9px] font-medium text-sky-600">
                    {v.groupTitle}
                  </span>
                )}
                <span className="ml-auto shrink-0">
                  <StatusIcon item={vItem} />
                </span>
              </div>
            )}
            {/* 描述行：独立行，支持换行 */}
            <div className={cn("mt-1 whitespace-normal break-words text-[11px] leading-snug", statusStyle(vItem))}>
              {v.desc}
            </div>
            {/* 备注行 */}
            {vItem.note && (
              <div className="mt-0.5 whitespace-normal break-words text-[10px] text-slate-500">
                {vItem.note}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
