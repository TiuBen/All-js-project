import { ArrowDown, ArrowUp, Eye, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../utils/cn";
import { useFipsStore } from "../../../store/fips.store";

/**
 * ============================================================
 * EcyilangTableSetting —— 花湖翼览（ecyilang 原始快照源）的表头设置
 * ------------------------------------------------------------
 * 独立板块（SettingPage 单独一个导航项），与 FipsTableSetting **互不共用** ——
 * 各自持有自己的编辑器渲染，互不影响。
 *
 *   - id = sourceEcyilang，view = ecyilang（读写 store 的 ecyilangHeader）
 *   - 列清单 = config/fipsHeaders.js 的 ECYILANG_ALL_HEADER
 *   - 勾选框 = 显隐；英/中文、ICAO·IATA = 展示形态 radio（列上配了才出现）；
 *     上下箭头 = 调序；右上角 = 全部显示 / 恢复默认 —— 全部即改即存
 * ============================================================
 */

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

export default function EcyilangTableSetting() {
    const {
        ecyilangHeader,
        toggleVisible,
        setColumnFlag,
        moveHeader,
        showAllHeaders,
        resetHeaders,
    } = useFipsStore();

    const columns = ecyilangHeader?.columns ?? [];
    const shown = columns.filter((h) => !h.isHide).length;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            <Card className="flex-1">
                <CardHeader className="shrink-0">
                    <CardTitle className={"flex flex-row items-center justify-between gap-4"}>
                        花湖翼览 表头设置
                    </CardTitle>
                </CardHeader>
                <CardContent className="min-h-0 flex-1 overflow-auto">
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        {/* 标题条：表名 + 显示计数 + 批量操作 */}
                        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
                            <span className="text-[13px] font-semibold text-slate-700">花湖翼览</span>
                            <Badge variant="primary">
                                {shown} / {columns.length} 列
                            </Badge>
                            <span className="text-[11px] text-slate-400">原始快照数据源</span>
                            <div className="ml-auto flex items-center gap-1.5">
                                <Button size="sm" variant="outline" onClick={() => showAllHeaders("ecyilang")}>
                                    <Eye size={12} /> 全部显示
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => resetHeaders("ecyilang")}>
                                    <RotateCcw size={12} /> 恢复默认
                                </Button>
                            </div>
                        </div>

                        {/* 列清单：竖排，一列一行（自上而下即列顺序） */}
                        <div className="flex flex-col gap-1 p-2">
                            {columns.map((h, i) => (
                                <div
                                    key={h.keyName}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-md border px-2 py-1.5 transition-colors",
                                        h.isHide
                                            ? "border-slate-200 bg-slate-50"
                                            : "border-primary-200 bg-primary-50/40"
                                    )}
                                >
                                    <span className="w-5 shrink-0 text-right font-mono text-[10px] text-slate-800">
                                        {i + 1}
                                    </span>
                                    <input
                                        type="checkbox"
                                        className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary-600"
                                        checked={!h.isHide}
                                        onChange={() => toggleVisible("ecyilang", h.keyName)}
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
                                                            title={`${
                                                                flag === "english" ? "展示形态" : "代码格式"
                                                            }：${opt.label}`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`ecyilang-${h.keyName}-${flag}`}
                                                                className="h-3 w-3 cursor-pointer accent-primary-600"
                                                                checked={h[flag] === opt.value}
                                                                onChange={() =>
                                                                    setColumnFlag(
                                                                        "ecyilang",
                                                                        h.keyName,
                                                                        flag,
                                                                        opt.value
                                                                    )
                                                                }
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
                                            onClick={() => moveHeader("ecyilang", h.keyName, "left")}
                                            disabled={i === 0}
                                            className="text-slate-800 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-slate-300"
                                            title="上移一位"
                                        >
                                            <ArrowUp size={12} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveHeader("ecyilang", h.keyName, "right")}
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
                </CardContent>
            </Card>
        </div>
    );
}
