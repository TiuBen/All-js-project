import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { cn } from "../../../utils/cn";
import { Database, Lock, Unlock, TriangleAlert, Loader2, HardDriveDownload } from "lucide-react";
import {
    SOURCE_OPTIONS,
    DEFAULT_FLIGHT_SOURCE,
    isReadonlySource,
    readonlyHintOf,
} from "../../../config/dataSource";
import { useAppStore } from "../../../store/app.store";
import { useFipsStore } from "../../../store/fips.store";

/**
 * ============================================================
 * DataSourcSetting —— 数据源板块（可切换）
 * ------------------------------------------------------------
 * 三个源 = 三张航班表（取值就是表名）：
 *   fips        历史流量明细，只读
 *   manual_fips 手动添加航班，可增删改（唯一可写的源）
 *   ecyilang    花湖翼览（后端航班计划快照），只读，**默认**
 *
 * ★ 当前源存在 appStore.source（初值取自浏览器本地缓存，默认 ecyilang），
 *   落缓存由 utils/flightSource.js 负责，发请求拼参数由 api/http.js 负责
 *   —— 这里只管「选 + 确认」。
 * ★ 切源是**破坏性**的（整个航班列表/生鲜页的数据都会换一套），所以要求
 *   二次确认：点 radio → 弹确认框 → 确认后才真正写入。
 * ★ 确认后顺手把 fips.store 的旧数据清掉并重拉，免得切完回到 /fips
 *   还挂着上一个源的行。
 * ============================================================
 */
export default function DataSourcSetting() {
    const source = useAppStore((s) => s.source);
    const applySource = useAppStore((s) => s.setSource);

    const [pending, setPending] = useState(null); // 待确认的目标源（radio 点完先进这里）
    const [applying, setApplying] = useState(false);

    const readOnly = isReadonlySource(source);
    const pendingOption = pending ? SOURCE_OPTIONS.find((o) => o.id === pending) : null;

    /** 点 radio：同值忽略，异值进确认框 */
    const choose = (id) => {
        if (id === source || applying) return;
        setPending(id);
    };

    /** 确认框里点「确认切换」 */
    const confirmSwitch = async () => {
        if (!pending) return;
        setApplying(true);
        try {
            applySource(pending); // 写本地缓存 + 更新 appStore（页面订阅后立即重渲染）
            const fipsStore = useFipsStore.getState();
            fipsStore.clearFlights(); // 旧源的行先清掉，避免切完还串台
            await fipsStore.fetchFlights().catch(() => {}); // 预取新源；失败由页面 error 提示
        } finally {
            setApplying(false);
            setPending(null);
        }
    };

    return (
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardHeader className="shrink-0">
                <CardTitle>
                    数据源{" "}
                    <span className="ml-1 text-xs font-normal text-slate-400">航班列表读取哪张表</span>
                </CardTitle>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 space-y-4 overflow-auto">
                {/* 当前数据源 */}
                <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                            <Database size={18} />
                        </div>
                        <div>
                            <div className="text-[11px] text-slate-400">当前数据源</div>
                            <div className="text-sm font-semibold text-slate-800">
                                {pendingOption
                                    ? `${source} → ${pendingOption.label}`
                                    : SOURCE_OPTIONS.find((o) => o.id === source)?.label || source}
                            </div>
                            <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                                source={source} · 表 {source}
                            </div>
                        </div>
                    </div>
                    {readOnly ? (
                        <Badge variant="warning" className="gap-1">
                            <Lock size={11} /> 只读
                        </Badge>
                    ) : (
                        <Badge variant="success" className="gap-1">
                            <Unlock size={11} /> 可写
                        </Badge>
                    )}
                </div>

                {/* 切换数据源（radio + 二次确认） */}
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">选择数据源</span>
                        <span className="text-[11px] text-slate-400">
                            默认 {SOURCE_OPTIONS.find((o) => o.id === DEFAULT_FLIGHT_SOURCE)?.label} ·
                            选择保存在本机浏览器
                        </span>
                    </div>

                    <div className="space-y-2">
                        {SOURCE_OPTIONS.map((opt) => {
                            const active = opt.id === source;
                            return (
                                <label
                                    key={opt.id}
                                    className={cn(
                                        "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                                        active
                                            ? "border-primary-300 bg-primary-50/60"
                                            : "border-slate-200 bg-white hover:bg-slate-50",
                                        applying && !active && "cursor-not-allowed opacity-60",
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="flight-source"
                                        className="mt-0.5 h-4 w-4 cursor-pointer accent-primary-600"
                                        value={opt.id}
                                        checked={active}
                                        disabled={applying}
                                        onChange={() => choose(opt.id)}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={cn(
                                                    "text-[13px] font-semibold",
                                                    active ? "text-primary-700" : "text-slate-700",
                                                )}
                                            >
                                                {opt.label}
                                            </span>
                                            <span className="font-mono text-[11px] text-slate-400">
                                                {opt.id}
                                            </span>
                                            {active && <Badge variant="primary">当前</Badge>}
                                            {opt.readonly ? (
                                                <Badge variant="default" className="gap-1">
                                                    <Lock size={10} /> 只读
                                                </Badge>
                                            ) : (
                                                <Badge variant="success" className="gap-1">
                                                    <Unlock size={10} /> 可写
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
                                            {opt.desc}
                                        </p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
                        <HardDriveDownload size={12} className="mt-0.5 shrink-0" />
                        选择会写入浏览器本地缓存，刷新 / 重开页面后依然生效；切换时需二次确认。
                    </p>
                </div>

                {readOnly && readonlyHintOf(source) && (
                    <div className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        {readonlyHintOf(source)}
                    </div>
                )}
            </CardContent>

            {/* 切换确认框（二次确认） */}
            {pendingOption && (
                <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4"
                    onClick={() => !applying && setPending(null)}
                >
                    <div
                        className="w-[460px] max-w-full overflow-hidden rounded-xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
                            <TriangleAlert size={16} className="text-amber-500" />
                            <span className="text-base font-bold text-slate-800">切换数据源</span>
                        </div>

                        <div className="space-y-3 px-5 py-4">
                            <p className="text-sm leading-relaxed text-slate-600">
                                确定把航班数据源从{" "}
                                <span className="font-semibold text-slate-800">{source}</span> 切换为{" "}
                                <span className="font-semibold text-primary-700">
                                    {pendingOption.label}（{pendingOption.id}）
                                </span>
                                吗？
                            </p>
                            <p className="text-[12px] leading-relaxed text-slate-500">
                                切换后「航班列表」与「生鲜保障」会立即按新数据源重新加载；
                                {pendingOption.readonly
                                    ? "该源只读，航班的新增 / 修改 / 删除会被禁用。"
                                    : "该源可写，可以新增 / 修改 / 删除航班。"}
                            </p>
                            <p className="text-[12px] leading-relaxed text-slate-400">
                                选择会保存在本机浏览器，下次打开仍是这个源。
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={applying}
                                onClick={() => setPending(null)}
                            >
                                取消
                            </Button>
                            <Button size="sm" disabled={applying} onClick={confirmSwitch}>
                                {applying ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" /> 切换中…
                                    </>
                                ) : (
                                    "确认切换"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
