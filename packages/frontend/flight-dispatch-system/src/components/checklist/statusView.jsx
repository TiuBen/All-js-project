import { CheckCircle2, CircleDot, Circle } from "lucide-react";

/**
 * ============================================================
 * 检查单只读视图：共享的状态样式与图标
 * ------------------------------------------------------------
 * 供主监控 / 辅助监控 / 视频监管 三个列表组件复用：
 *   - statusStyle(item) → 文字颜色类名
 *   - <StatusIcon item={item} /> → 状态图标（绿勾 / 红点 / 灰圈）
 * ============================================================
 */

/** 文字颜色：异常红、正常深灰、未填灰 */
export const statusStyle = (item) => {
  if (!item?.status) return "text-slate-400";
  if (item.status === "abnormal") return "text-red-600";
  return "text-slate-700";
};

/** 状态图标：ok 绿勾 / abnormal 红点 / 其他 灰圈 */
export function StatusIcon({ item }) {
  if (!item?.status) return <Circle size={13} className="text-slate-300" />;
  if (item.status === "abnormal") return <CircleDot size={13} className="text-red-500" />;
  return <CheckCircle2 size={13} className="text-emerald-500" />;
}
