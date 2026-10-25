import { ArrowDown, ArrowUp, Check, Eye, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../utils/cn";
import { useFipsStore } from "../../../store/fips.store";

/**
 * ============================================================
 * FipsTableSetting —— 航班表板块（视图模式 + 三张表的列配置）
 * ------------------------------------------------------------
 * 这两块原来挤在航班页里（标题栏的视图切换按钮、表头里的「表头筛选」），
 * 占的是表格自己的展示空间，所以整体搬到设置页来。
 *
 * ① 视图模式：单个 / 左进港右离港 / 右进港左离港
 * ② 列配置：三张表各一套列（全部 14 列 / 离港 13 / 进港 13，少的是本场那列）
 *      - 勾选框 = 该列在表里显示 / 隐藏
 *      - 英/中文、ICAO·IATA = 展示形态 radio（列上配了对应字段才出现）
 *      - 上下箭头 = 调该列的位置（数组顺序即列顺序）
 *
 * ★ 花湖翼览（ecyilang 原始快照源）的表头设置是**独立板块** EcyilangTableSetting，
 *   与本组件互不共用（各自持有自己的编辑器渲染）。
 * ★ 交互全在 store/fips.store.js：本组件只读状态 + 派发动作，
 *   改完**立即生效**并落 localStorage（航班页订阅同一份状态，切过去就是新的）。
 *   —— 没有「草稿 + 确认」两步：设置页是专门的配置页，误点一下再点回来即可。
 * ★ 视图模式**不落盘**（刷新回到「全部航班」），与之前放页面 state 时的行为一致。
 * ============================================================
 */

/** 三张表各自的那套列配置（顺序即展示顺序） */
const TABLES = [
    { view: "all", label: "全部航班表", hint: "单表模式" },
    { view: "dep", label: "离港航班表", hint: "不含「起飞机场」" },
    { view: "arr", label: "进港航班表", hint: "不含「落地机场」" },
];

/** 三个视图模式（顺序即展示顺序） */
const VIEW_MODES_UI = [
    { id: "all", label: "全部航班", desc: "单张表，显示当天全部航班" },
    { id: "in-left", label: "左进港 / 右离港", desc: "两张表并排，进港在左、离港在右" },
    { id: "out-left", label: "左离港 / 右进港", desc: "两张表并排，离港在左、进港在右" },
];

/** 展示形态 radio 组（flag 对应列上的字段名；列没配该字段就不渲染这组） */
const COLUMN_RADIOS = [
    {
        flag: "english",
        options: [
            { value: true, label: "英文" },
            { value: false, label: "中文" },
        ],
    },
    {
        flag: "icao",
        options: [
            { value: true, label: "ICAO4字码" },
            { value: false, label: "IATA3字码" },
        ],
    },
];

export default function FipsTableSetting() {
    const {
        viewMode,
        setViewMode,
        allHeader,
        depHeader,
        arrHeader,
        toggleVisible,
        setColumnFlag,
        moveHeader,
        showAllHeaders,
        resetHeaders,
    } = useFipsStore();

    const headersByView = { all: allHeader, dep: depHeader, arr: arrHeader };

    /** 一张表的列配置：勾选显示 + 展示形态 + 上下调序 */
    const renderHeaderEditor = ({ view, label, hint }) => {
        const columns = headersByView[view]?.columns ?? [];
        const shown = columns.filter((h) => !h.isHide).length;

        return (
            <div key={view} className="min-w-[280px] overflow-hidden rounded-lg border border-slate-200 flex-1">
                {/* 标题条：表名 + 显示计数 + 批量操作 */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="text-[13px] font-semibold text-slate-700">{label}</span>
                    <Badge variant="primary">
                        {shown} / {columns.length} 列
                    </Badge>
                    <span className="text-[11px] text-slate-400">{hint}</span>
                    <div className="ml-auto flex items-center gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => showAllHeaders(view)}>
                            <Eye size={12} /> 全部显示
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => resetHeaders(view)}>
                            <RotateCcw size={12} /> 恢复默认
                        </Button>
                    </div>
                </div>

                {/* 列清单：竖排，一列一行（自上而下即列顺序）；勾选 = 显示；箭头 = 上移 / 下移 */}
                <div className="flex flex-col gap-1 p-2">
                    {columns.map((h, i) => (
                        <div
                            key={h.keyName}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md border px-2 py-1.5 transition-colors",
                                h.isHide ? "border-slate-200 bg-slate-50" : "border-primary-200 bg-primary-50/40"
                            )}
                        >
                            <span className="w-5 shrink-0 text-right font-mono text-[10px] text-slate-800">
                                {i + 1}
                            </span>
                            <input
                                type="checkbox"
                                className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary-600"
                                checked={!h.isHide}
                                onChange={() => toggleVisible(view, h.keyName)}
                                title={h.isHide ? "已隐藏，勾选以在表里显示" : "显示中，取消勾选以隐藏"}
                            />
                            <span
                                className={cn(
                                    "min-w-0 flex-1 truncate text-[12px]",
                                    h.isHide ? "text-slate-800 line-through" : "text-slate-700"
                                )}
                                title={`${h.title}（${h.keyName}）${h.tooltip ? `｜${h.tooltip}` : ""}`}
                            >
                                {h.title}
                            </span>

                            {/* 展示形态：英文/中文、ICAO/IATA（radio 单选，选中即生效并持久化；
                                列上没配对应字段就不渲染这组） */}
                            <span className="flex shrink-0 items-center gap-1.5">
                                {COLUMN_RADIOS.map(({ flag, options }) =>
                                    typeof h[flag] !== "boolean" ? null : (
                                        <span
                                            key={flag}
                                            className="flex shrink-0 items-center gap-1 rounded border border-slate-200 bg-white px-1 py-0.5"
                                        >
                                            {options.map((opt) => (
                                                <label
                                                    key={String(opt.value)}
                                                    className="flex cursor-pointer select-none items-center gap-0.5 text-[10px]"
                                                    title={`${flag === "english" ? "展示形态" : "代码格式"}：${
                                                        opt.label
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`${view}-${h.keyName}-${flag}`}
                                                        className="h-3 w-3 cursor-pointer accent-primary-600"
                                                        checked={h[flag] === opt.value}
                                                        onChange={() => setColumnFlag(view, h.keyName, flag, opt.value)}
                                                    />
                                                    <span
                                                        className={
                                                            h[flag] === opt.value
                                                                ? "font-semibold text-primary-700"
                                                                : "text-slate-500"
                                                        }
                                                    >
                                                        {opt.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </span>
                                    )
                                )}
                            </span>

                            <span className="hidden shrink-0 font-mono text-[10px] text-slate-600 xl:inline">
                                {h.keyName}
                            </span>
                            <span className="flex shrink-0 flex-col items-center">
                                <button
                                    type="button"
                                    onClick={() => moveHeader(view, h.keyName, "left")}
                                    disabled={i === 0}
                                    className="text-slate-800 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-slate-300"
                                    title="上移一位"
                                >
                                    <ArrowUp size={12} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveHeader(view, h.keyName, "right")}
                                    disabled={i === columns.length - 1}
                                    className="text-slate-800 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-slate-300"
                                    title="下移一位"
                                >
                                    <ArrowDown size={12} />
                                </button>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            <Card>
                <CardHeader className="shrink-0">
                    <CardTitle className={"flex flex-row items-center justify-between gap-4"}>视图模式</CardTitle>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 space-y-4 overflow-auto">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {VIEW_MODES_UI.map((m) => {
                            const active = m.id === viewMode;
                            return (
                                <label
                                    key={m.id}
                                    className={cn(
                                        "flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 transition-colors",
                                        active
                                            ? "border-primary-300 bg-primary-50/60"
                                            : "border-slate-200 bg-white hover:bg-slate-50"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="fips-view-mode"
                                        className="mt-0.5 h-4 w-4 cursor-pointer accent-primary-600"
                                        value={m.id}
                                        checked={active}
                                        onChange={() => setViewMode(m.id)}
                                    />
                                    <div className="min-w-0">
                                        <div
                                            className={cn(
                                                "text-[13px] font-semibold",
                                                active ? "text-primary-700" : "text-slate-700"
                                            )}
                                        >
                                            {m.label}
                                            {active && (
                                                <span className="ml-1.5 inline-flex items-center gap-0.5 text-[11px] font-normal text-primary-500">
                                                    <Check size={11} /> 当前
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{m.desc}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-1">
                <CardHeader className="shrink-0">
                    <CardTitle className={"flex flex-row items-center justify-between gap-4"}>表头设置</CardTitle>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 space-y-4 overflow-auto">
                    {/* 三套表头并排；窄屏自动换行（每张最小 280px，保证勾选框不挤在一起） */}
                    <div className="flex flex-wrap gap-2">{TABLES.map((t) => renderHeaderEditor(t))}</div>
                </CardContent>
            </Card>
        </div>
    );
}
