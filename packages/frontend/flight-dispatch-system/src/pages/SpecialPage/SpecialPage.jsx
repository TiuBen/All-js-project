import { useEffect, useMemo, useState } from "react";
import { Database, Leaf, Loader2, RefreshCw, TriangleAlert, X } from "lucide-react";
import ContentLayout from "../../Layout/ContentLayout";
import Sidebar from "../../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useDateFilterParams } from "../../store/appStore";
import { IS_READONLY_SOURCE, FLIGHT_SOURCE_LABEL } from "../../store/flightSource";
import {
    useSpecialStore,
    flightKeyOf,
    countCheckedOf,
    recordOfFlight,
    resolveProcessOf,
} from "../../store/specialStore";
import { CHECKLIST_TOTAL, evaluateProcess } from "../../config/specialSpec";
import ProcessNode from "./components/ProcessNode";
import SpecialChecklist from "./components/SpecialChecklist";
import SpecialDrawer from "./components/SpecialDrawer";
import { cn } from "../../lib/utils";

/**
 * ============================================================
 * SpecialPage —— 生鲜保障（布局与航班列表页同一套）
 * ------------------------------------------------------------
 * 左：通用侧边栏（搜索 + 日历 + 今日保障进度）
 *      ★ 日历上每天的小数字 = **当天生鲜航班数**（含台账记录，绿色徽标）
 * 右：保障流程节点表 —— 一架生鲜航班一列（ProcessNode），横向排开可左右滚
 *      每列表头的机型后面直接写「卸机时长标准 XX 分钟」
 *      （标准值见 utils/specialCargoStandards.js，不再单独做参考表组件）
 * 右边缘：可收缩抽屉（SpecialDrawer），里面是**按航班各存一份**的
 *      保障清单（SpecialChecklist，15 条可打勾）
 *
 * 数据（三份来源，各自职责明确）：
 *   - 航班行    = 当前航班源里 is_fresh 的行 ∪ **special 台账当天记录**
 *                 （台账里有、航班源没有的会补一行，标记 source:'special'）
 *   - 展示值    = 本地填写（localStorage）优先，其次台账记录 —— 见 resolveProcessOf
 *   - 存/删台账 = ProcessNode 表头的两个小按钮（按 航班号+日期 upsert / 按主键删）
 *
 * ★ 日期口径与 /fips 一致：取 createdDate（台账行取 belongTime），
 *   无日期的行始终展示。
 * ★ 台账是**显式保存**的：改完时间节点不会自动回写服务端，避免误覆盖。
 * ============================================================
 */
export default function SpecialPage() {
    const {
        freshFlights,
        loading,
        error,
        dayMarkers,
        refreshAll,
        rowsForDate,
        processData,
        checks,
        drawerOpen,
        toggleDrawer,
        setStepTime,
        setBoardCount,
        setProgramStarted,
        toggleCheck,
        resetFlight,
        specialRecords,
        specialIndex,
        specialLoading,
        specialError,
        savingKey,
        saveToLedger,
        removeLedgerRecord,
    } = useSpecialStore();

    // 日期筛选参数（与 /fips、/records 共用同一份 appStore 状态）
    const dateParams = useDateFilterParams();
    const [keyword, setKeyword] = useState("");
    const [selectedKey, setSelectedKey] = useState(""); // 抽屉里当前查看的航班
    const [notice, setNotice] = useState(null); // 台账操作的常驻提示（手动关闭）

    // 首次进入：航班源 + 台账 一起拉
    useEffect(() => {
        refreshAll().catch(() => {});
    }, [refreshAll]);

    // 按日期过滤（航班源生鲜 ∪ 台账）；全量取回后本地筛，与 /fips 页同套路
    const byDate = useMemo(() => {
        try {
            return rowsForDate(dateParams || {});
        } catch {
            return rowsForDate({});
        }
        // rowsForDate 读取 store 内部状态，用这两个依赖触发重算
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [freshFlights, specialRecords, dateParams, rowsForDate]);

    // 搜索（与 /fips 同字段：航班号 / 机型 / 停机位）
    const sorted = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return byDate;
        return byDate.filter(
            (f) =>
                f.flight_no?.toLowerCase().includes(kw) ||
                f.aircraft_type?.toLowerCase().includes(kw) ||
                f.stand?.toLowerCase().includes(kw)
        );
    }, [byDate, keyword]);

    // 选中航班：换日期 / 换搜索后原选中不在了，自动落到第一架
    useEffect(() => {
        if (sorted.length === 0) {
            if (selectedKey) setSelectedKey("");
            return;
        }
        if (!sorted.some((f) => flightKeyOf(f) === selectedKey)) {
            setSelectedKey(flightKeyOf(sorted[0]));
        }
    }, [sorted, selectedKey]);

    const selectedFlight = useMemo(
        () => sorted.find((f) => flightKeyOf(f) === selectedKey) || null,
        [sorted, selectedKey]
    );

    /** 某航班当前解析后的流程数据（本地优先，台账兜底） */
    const processOf = (flight) =>
        resolveProcessOf(processData[flightKeyOf(flight)], recordOfFlight(specialIndex, flight));

    // 当日汇总：清单确认数 / 超标环节数 / 板数合计 / 台账命中数（侧栏与表头共用）
    const stats = useMemo(() => {
        let checked = 0;
        let over = 0;
        let boards = 0;
        let inLedger = 0;
        sorted.forEach((f) => {
            const key = flightKeyOf(f);
            checked += countCheckedOf(checks[key]);
            const proc = processOf(f);
            over += evaluateProcess(f.aircraft_type, proc.steps).over;
            if (recordOfFlight(specialIndex, f)) inLedger += 1;
            if (proc.boardCount !== "" && proc.boardCount != null) {
                const n = Number(proc.boardCount);
                if (!Number.isNaN(n)) boards += n;
            }
        });
        return { checked, over, boards, inLedger, total: sorted.length * CHECKLIST_TOTAL };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sorted, checks, processData, specialIndex]);

    const refresh = () => refreshAll().catch((err) => setNotice({ type: "err", text: `刷新失败：${err.message}` }));

    /** 存台账：把这一列**当前展示的值**（含台账兜底）upsert 回服务端 */
    const handleSaveToLedger = async (flight, proc) => {
        try {
            const row = await saveToLedger(flight, proc);
            setNotice({ type: "ok", text: `${row.callsign}（${row.belongTime}）已存入台账` });
        } catch (err) {
            setNotice({ type: "err", text: `存台账失败：${err.message}` });
        }
    };

    /** 删台账：按主键删除该航班这一天的记录 */
    const handleDeleteLedger = async (flight, record) => {
        if (!window.confirm(`从台账删除 ${flight.flight_no}（${record.belongTime}）这条记录？`)) return;
        try {
            await removeLedgerRecord(record.id);
            setNotice({ type: "ok", text: `${flight.flight_no}（${record.belongTime}）的台账记录已删除` });
        } catch (err) {
            setNotice({ type: "err", text: `删除台账失败：${err.message}` });
        }
    };

    // 空状态文案（三种原因分开说，免得"没数据"让用户猜）
    const empty = useMemo(() => {
        const noSourceFresh = freshFlights.length === 0;
        const noLedger = Object.keys(specialRecords || {}).length === 0;
        if (noSourceFresh && noLedger) {
            return IS_READONLY_SOURCE
                ? {
                      title: "当前数据源不含生鲜标记",
                      desc: "航班计划快照（ecyilang）没有生鲜字段，台账（special 表）也还没有记录。用 pnpm dev（手动添加航班）给航班打上生鲜标记，或先导入台账数据。",
                  }
                : {
                      title: "还没有生鲜航班",
                      desc: "到「航班列表」页点中一行，点「标记为生鲜」；台账（special 表）里有记录也会出现在这里。",
                  };
        }
        return {
            title: "所选日期没有生鲜航班",
            desc: "在左侧日历换一天；日历上每天的小数字就是当天生鲜航班数（含台账记录）。",
        };
    }, [freshFlights.length, specialRecords]);

    return (
        <ContentLayout
            sidebar={
                <Sidebar
                    keyword={keyword}
                    onKeywordChange={setKeyword}
                    matchCount={sorted.length}
                    onRefresh={refresh}
                    searchPlaceholder="航班号 / 机型 / 停机位..."
                    dataSource={`生鲜航班 · ${FLIGHT_SOURCE_LABEL.replace("数据源：", "")}`}
                    dayMarkers={dayMarkers}
                    stats={
                        <Card>
                            <CardHeader className="py-2">
                                <CardTitle className="flex items-center gap-1.5">
                                    <Leaf size={14} className="text-emerald-600" /> 今日保障进度
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-2">
                                <div className="grid grid-cols-3 gap-1.5 text-center">
                                    <div className="rounded-md bg-slate-50 py-1.5">
                                        <div className="text-[15px] font-bold leading-none text-slate-700">
                                            {sorted.length}
                                        </div>
                                        <div className="mt-0.5 text-[10px] text-slate-400">航班</div>
                                    </div>
                                    <div className="rounded-md bg-slate-50 py-1.5">
                                        <div
                                            className={cn(
                                                "text-[15px] font-bold leading-none",
                                                stats.total > 0 && stats.checked === stats.total
                                                    ? "text-emerald-600"
                                                    : "text-primary-600"
                                            )}
                                        >
                                            {stats.checked}
                                            <span className="text-[11px] font-normal text-slate-400">
                                                /{stats.total}
                                            </span>
                                        </div>
                                        <div className="mt-0.5 text-[10px] text-slate-400">清单</div>
                                    </div>
                                    <div className="rounded-md bg-slate-50 py-1.5">
                                        <div
                                            className={cn(
                                                "text-[15px] font-bold leading-none",
                                                stats.over > 0 ? "text-red-600" : "text-slate-700"
                                            )}
                                        >
                                            {stats.over}
                                        </div>
                                        <div className="mt-0.5 text-[10px] text-slate-400">超标</div>
                                    </div>
                                </div>
                                {stats.boards > 0 && (
                                    <div className="text-[11px] text-slate-500">
                                        生鲜货物合计 <b className="text-slate-700">{stats.boards}</b> 板
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <Database size={11} className="text-slate-400" />
                                    台账已收录
                                    <b className="text-slate-700">{stats.inLedger}</b>
                                    <span className="text-slate-400">/ {sorted.length} 架</span>
                                </div>
                                <button
                                    onClick={toggleDrawer}
                                    className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                                >
                                    {drawerOpen ? "收起保障清单" : "展开保障清单"}
                                </button>
                                <p className="text-[10px] leading-relaxed text-slate-400">
                                    清单勾选与时间节点自动存在本机浏览器；点航班卡片右上角的保存图标才写入 台账（special
                                    表）。
                                </p>
                            </CardContent>
                        </Card>
                    }
                />
            }
        >
            <div className="flex min-h-0 flex-1">
                {/* ============ 右侧主区：保障流程节点表 ============ */}
                <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <CardHeader className="shrink-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <CardTitle>
                                生鲜保障流程{" "}
                                {sorted.length > 0 && (
                                    <span className="ml-1 text-xs font-normal text-slate-400">
                                        共 {sorted.length} 架
                                    </span>
                                )}
                            </CardTitle>
                            {stats.checked > 0 && (
                                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                    清单已确认 {stats.checked}/{stats.total}
                                </span>
                            )}
                            {stats.over > 0 ? (
                                <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600">
                                    <TriangleAlert size={11} /> 超标 {stats.over} 项
                                </span>
                            ) : (
                                sorted.length > 0 &&
                                stats.checked > 0 && (
                                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                                        间隔全部达标
                                    </span>
                                )
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {(loading || specialLoading) && (
                                <Loader2 className="animate-spin text-slate-400" size={16} />
                            )}
                            <Button size="sm" variant="outline" onClick={refresh}>
                                <RefreshCw size={13} /> 刷新
                            </Button>
                        </div>
                    </CardHeader>

                    {error && (
                        <div className="mx-3 mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600">
                            加载失败：{error}
                        </div>
                    )}
                    {specialError && (
                        <div className="mx-3 mt-1 rounded bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                            台账（special 表）：{specialError}
                        </div>
                    )}
                    {/* 台账操作结果 —— 常驻提示，手动关闭（不自动消失） */}
                    {notice && (
                        <div
                            className={cn(
                                "mx-3 mt-1 flex items-start gap-2 rounded px-3 py-1.5 text-xs",
                                notice.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                            )}
                        >
                            <span className="flex-1">{notice.text}</span>
                            <button
                                onClick={() => setNotice(null)}
                                className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
                                title="关闭提示"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
                        {sorted.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white">
                                <div className="max-w-md px-6 py-14 text-center">
                                    <Leaf className="mx-auto text-emerald-500" size={28} />
                                    <div className="mt-3 text-sm font-semibold text-slate-700">{empty.title}</div>
                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{empty.desc}</p>
                                </div>
                            </div>
                        ) : (
                            /* 一架航班一列，横向排开（容器左右滚） */
                            <div className="flex items-start gap-2">
                                {sorted.map((f) => {
                                    const key = flightKeyOf(f);
                                    const record = recordOfFlight(specialIndex, f);
                                    const proc = resolveProcessOf(processData[key], record);
                                    return (
                                        <ProcessNode
                                            key={key}
                                            flight={f}
                                            record={record}
                                            saving={savingKey === key}
                                            value={proc}
                                            onStepTime={(stepKey, time) => setStepTime(key, stepKey, time)}
                                            onBoardCount={(v) => setBoardCount(key, v)}
                                            onProgramStarted={(v) => setProgramStarted(key, v)}
                                            onSaveToLedger={() => handleSaveToLedger(f, proc)}
                                            onDeleteLedger={record ? () => handleDeleteLedger(f, record) : undefined}
                                            onReset={() => {
                                                if (
                                                    window.confirm(
                                                        `清空 ${f.flight_no} 的流程填写值与清单勾选？此操作不影响台账。`
                                                    )
                                                ) {
                                                    resetFlight(key);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>

                {/* ============ 右侧抽屉：按航班各存一份的保障清单 ============ */}
                <SpecialDrawer
                    open={drawerOpen}
                    onToggle={toggleDrawer}
                    title="生鲜保障清单"
                    subtitle={selectedFlight?.flight_no}
                    badge={`${countCheckedOf(checks[selectedKey])}/${CHECKLIST_TOTAL}`}
                    hint={drawerOpen ? "收起保障清单" : "展开保障清单（15 条可打勾）"}
                >
                    <SpecialChecklist
                        flight={selectedFlight}
                        checks={checks[selectedKey] || {}}
                        onToggle={(itemKey) => selectedKey && toggleCheck(selectedKey, itemKey)}
                    />
                </SpecialDrawer>
            </div>
        </ContentLayout>
    );
}
