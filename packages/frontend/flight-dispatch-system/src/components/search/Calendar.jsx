import { DayPicker, DayButton } from "react-day-picker";
import "react-day-picker/style.css";
import { zhCN } from "react-day-picker/locale";
import dayjs from "dayjs";
import { useAppStore } from "../../store/appStore";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

/**
 * ============================================================
 * Calendar —— 通用日期选择卡（单选日 / 范围选择），状态持久化
 * ------------------------------------------------------------
 * 中文、周一起始、显示上下月日期。
 * 从原 components/ui/DateFilterPanel.jsx 抽出，作为**唯一实现**：
 *   - 航班列表页 / 填写记录页 / 生鲜保障页 共用同一份日期状态
 *     （appStore.mode / selectedDate / rangeFrom / rangeTo）
 *   - 侧边栏只负责排版，日期卡片本身不再关心页面
 *   - 读日期筛选参数请用 store/appStore.js 的 useDateFilterParams()
 *     （放本文件会让 react-refresh 报「组件与函数混在一个文件」）
 *
 * @param {string}  [title]      卡片标题，默认「日期选择」
 * @param {string}  [notice]     可选提示（如「所选日期无数据，已展示最近一天」）
 * @param {Object}  [dayMarkers] 每天右上角的小数字徽标：
 *          { 'YYYY-MM-DD': { count, hasAbnormal?, tone? } }
 *          - count       当天的数量（0 / 不传则不显示徽标）
 *          - tone        徽标颜色：emerald（默认）| red | amber | blue | slate
 *                        —— 生鲜保障页用它表示「当天生鲜航班数」
 *          - hasAbnormal 兼容填写记录页的语义：true 等价于 tone='red'
 * ============================================================
 */

// 徽标配色（按语义给色，避免调用方关心 class 名）
const TONE_BG = {
    emerald: "bg-emerald-500",
    red: "bg-red-500",
    amber: "bg-amber-500",
    blue: "bg-primary-600",
    slate: "bg-slate-500",
};

export default function Calendar({ title = "日期选择", notice, dayMarkers }) {
    const { mode, selectedDate, rangeFrom, rangeTo, setMode, setSelectedDate, setRange } = useAppStore();

    // 自定义 DayButton：保留官方组件能力（焦点/交互），在日期右上角叠加数字徽标
    const DayButtonWithMarkers = (props) => {
        const { day, className, children, selected } = props;
        const key = dayjs(day.date).format("YYYY-MM-DD");
        const marker = dayMarkers?.[key];
        const count = marker?.count || 0;
        const show = count > 0 && !day.outside;
        // 颜色：显式 tone 优先，否则按 hasAbnormal 判定（falsy = 绿）
        const tone = marker?.tone || (marker?.hasAbnormal ? "red" : "emerald");
        // 今天：蓝色加粗字体；当前月（非 outside）：字体稍粗
        const isToday = dayjs(day.date).isSame(dayjs(), "day");
        return (
            <DayButton {...props} className={cn(className, "relative")}>
                <span
                    className={cn(
                        "relative z-[1]",
                        !day.outside && "font-medium",
                        isToday && "font-bold",
                        isToday && !selected && "text-blue-600"
                    )}
                >
                    {children}
                </span>
                {show && (
                    <span
                        className={cn(
                            "pointer-events-none absolute -right-1 -top-1 z-10 flex h-[15px] min-w-[15px] items-center justify-center rounded-full px-[3px] text-[9px] font-bold leading-none text-white shadow",
                            TONE_BG[tone] || TONE_BG.emerald
                        )}
                    >
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </DayButton>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <div className="flex rounded-md border border-slate-200 p-0.5">
                    <button
                        onClick={() => setMode("single")}
                        className={cn(
                            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                            mode === "single" ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        单选
                    </button>
                    <button
                        onClick={() => setMode("range")}
                        className={cn(
                            "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                            mode === "range" ? "bg-primary-600 text-white" : "text-slate-600 hover:bg-slate-100"
                        )}
                    >
                        范围
                    </button>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div>
                    <DayPicker
                        mode={mode === "single" ? "single" : "range"}
                        locale={zhCN}
                        weekStartsOn={1}
                        showOutsideDays
                        components={dayMarkers ? { DayButton: DayButtonWithMarkers } : undefined}
                        selected={
                            mode === "single"
                                ? selectedDate
                                    ? new Date(selectedDate)
                                    : undefined
                                : {
                                      from: rangeFrom ? new Date(rangeFrom) : undefined,
                                      to: rangeTo ? new Date(rangeTo) : undefined,
                                  }
                        }
                        onSelect={(sel) => {
                            if (mode === "single") {
                                if (sel) setSelectedDate(dayjs(sel).format("YYYY-MM-DD"));
                            } else {
                                const range = sel || {};
                                setRange(
                                    range.from ? dayjs(range.from).format("YYYY-MM-DD") : null,
                                    range.to ? dayjs(range.to).format("YYYY-MM-DD") : null
                                );
                            }
                        }}
                        numberOfMonths={1}
                    />
                </div>

                <div className="mt-2 rounded-md m-auto bg-slate-200 px-2 py-2 text-xs text-slate-600">
                    {notice && (
                        <div className="mb-1 rounded bg-amber-50 px-2 py-1 text-[11px] text-amber-700">{notice}</div>
                    )}
                    {mode === "single" ? (
                        <>
                            当前日期：<b>{selectedDate}</b>
                        </>
                    ) : (
                        <>
                            范围：<b>{rangeFrom || "—"}</b> ~ <b>{rangeTo || "—"}</b>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
