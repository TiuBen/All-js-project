import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";

/**
 * ============================================================
 * ResizableColumns —— 可拖拽分隔条的多列布局组件
 * ------------------------------------------------------------
 * - 支持 1~3 列（columns 长度变化自动均分）
 * - 列之间的分隔条可左右拖拽调整相邻两列宽度
 * - 每列最小宽度 MIN_W（px），拖拽时自动夹紧
 * - 容器宽度变化（窗口缩放）时按当前比例重新分配
 * ============================================================
 * 每列是一个"块"（宽度 widths[i] px，含右侧分隔条），块内部：
 *   内容区 flex-1 + 分隔条 w-1.5（最后一块无分隔条）
 * ============================================================
 * @param {Array} columns [{ key, content, minWidth? }]
 * @param {string} className 容器附加类名（高度约束由外层控制）
 * @param {Function} [onLayoutChange] (widths) 布局变化回调（可选）
 */
const DEFAULT_MIN_W = 160;
const DIVIDER_W = 6; // 分隔条宽度 px

export default function ResizableColumns({ columns = [], className, onLayoutChange }) {
    const containerRef = useRef(null);
    const [widths, setWidths] = useState([]); // 每块宽度 px（含右分隔条）；空 = 尚未初始化
    const draggingRef = useRef(null); // { index, startX, leftW, rightW }

    const n = columns.length;

    // 列数变化 → 按容器宽度均分
    useEffect(() => {
        const el = containerRef.current;
        const total = el?.clientWidth || 0;
        if (!total || n === 0) return;
        const each = Math.floor(total / n);
        setWidths(new Array(n).fill(each));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [n]);

    // 容器 resize → 按当前比例重算（保持用户调好的相对比例）
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !widths.length) return;
        const ro = new ResizeObserver(() => {
            const total = el.clientWidth;
            if (!total) return;
            const ratio = widths.map((w) => w / el.clientWidth);
            setWidths(ratio.map((r) => Math.floor(total * r)));
        });
        ro.observe(el);
        return () => ro.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [widths.length, n]);

    // 分隔条按下：记录起始宽度与鼠标位置，挂全局 move/up
    const onDividerDown = useCallback(
        (index, e) => {
            e.preventDefault();
            e.stopPropagation();
            const el = containerRef.current;
            if (!el) return;
            draggingRef.current = { index, startX: e.clientX, leftW: widths[index], rightW: widths[index + 1] };
            const onMove = (ev) => {
                const d = draggingRef.current;
                if (!d) return;
                const dx = ev.clientX - d.startX;
                let leftW = d.leftW + dx;
                let rightW = d.rightW - dx;
                // 夹紧：左右都不小于最小宽度
                const minL = columns[d.index]?.minWidth || DEFAULT_MIN_W;
                const minR = columns[d.index + 1]?.minWidth || DEFAULT_MIN_W;
                if (leftW < minL) {
                    rightW -= minL - leftW;
                    leftW = minL;
                }
                if (rightW < minR) {
                    leftW -= minR - rightW;
                    rightW = minR;
                }
                if (leftW < minL || rightW < minR) return;
                setWidths((prev) => {
                    const next = [...prev];
                    next[d.index] = leftW;
                    next[d.index + 1] = rightW;
                    return next;
                });
            };
            const onUp = () => {
                draggingRef.current = null;
                window.removeEventListener("mousemove", onMove);
                window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
        },
        [widths, columns]
    );

    // 宽度已初始化且数量匹配时才用固定宽度，否则 flex 均分兜底
    const ready = widths.length === n && n > 0;

    return (
        <div ref={containerRef} className={cn("flex h-full w-full min-h-0 overflow-hidden", className)}>
            {columns.map((col, i) => {
                const isLast = i === n - 1;
                return (
                    <div
                        key={col.key}
                        className="h-full min-w-0"
                        style={ready ? { width: widths[i], flex: "0 0 auto" } : { flex: 1 }}
                    >
                        <div className="flex h-full min-w-0">
                            {/* 列内容 */}
                            <div className="min-h-0 min-w-0 flex-1">{col.content}</div>
                            {/* 分隔条（最后一块不渲染） */}
                            {!isLast && (
                                <div
                                    onMouseDown={(e) => onDividerDown(i, e)}
                                    className="my-1 w-1.5 shrink-0 cursor-col-resize rounded-full bg-slate-200 transition-colors hover:bg-sky-300 active:bg-sky-400"
                                    title="拖拽调整宽度"
                                    style={{ width: DIVIDER_W }}
                                />
                            )}
                        </div>
                    </div>
                );
            })}
            {n === 0 && (
                <div className="flex flex-1 items-center justify-center text-sm text-slate-300">暂无面板</div>
            )}
        </div>
    );
}
