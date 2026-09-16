import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/utils";

/**
 * ============================================================
 * ResizableColumns —— 可拖拽分隔条的多列布局组件
 * ------------------------------------------------------------
 * - 支持 1~3 列（列数变化自动均分）
 * - 列之间的分隔条可左右拖拽调整相邻两列宽度
 * - 每列最小宽度 MIN_W（px），拖拽时自动夹紧
 * ============================================================
 * 宽度用 **flex 比例**（flexGrow + flexBasis:0）分配，而不是固定 px：
 *   浏览器按比例把容器填满 —— 首帧、容器变宽、窗口缩放都不会在右侧留白。
 *   （旧实现用 px 写死：容器变宽后按"旧宽度 / 新容器宽"算出的比例和 ≠ 1，
 *     列宽总和停留在旧值，于是右侧空出一截。）
 * 另外 columns 支持 `cond && { ... }` 写法，falsy 项会被过滤掉，
 * 不会把未选中的面板算进列数（否则会多渲染一块空白列）。
 * ============================================================
 * @param {Array} columns [{ key, content, minWidth? }]
 * @param {string} className 容器附加类名（高度约束由外层控制）
 * @param {Function} [onLayoutChange] (ratios) 布局变化回调（可选）
 */
const DEFAULT_MIN_W = 160;
const DIVIDER_W = 6; // 分隔条宽度 px

export default function ResizableColumns({ columns = [], className, onLayoutChange }) {
    const containerRef = useRef(null);
    const list = columns.filter(Boolean); // 过滤未选中的面板（`cond && {...}` 会产生 false）
    const n = list.length;
    const [ratios, setRatios] = useState([]); // 每列宽度比例（和 ≈ 1）；空 = 尚未初始化
    const ratiosRef = useRef([]); // 拖拽回调里读最新比例，避免闭包旧值
    const draggingRef = useRef(null);

    ratiosRef.current = ratios;

    // 列数变化 → 均分
    useEffect(() => {
        if (!n) {
            setRatios([]);
            return;
        }
        setRatios(new Array(n).fill(1 / n));
    }, [n]);

    // 比例变化 → 通知外部（可选）
    useEffect(() => {
        if (onLayoutChange) onLayoutChange(ratios);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ratios]);

    // 分隔条按下：以"起点像素宽度"为基准，拖动量换算回比例
    const onDividerDown = useCallback(
        (index, e) => {
            e.preventDefault();
            e.stopPropagation();
            const el = containerRef.current;
            if (!el) return;
            const total = el.clientWidth;
            if (!total) return;

            const startX = e.clientX;
            const startL = (ratiosRef.current[index] || 0) * total;
            const startR = (ratiosRef.current[index + 1] || 0) * total;
            const minL = list[index]?.minWidth || DEFAULT_MIN_W;
            const minR = list[index + 1]?.minWidth || DEFAULT_MIN_W;
            draggingRef.current = { index };

            const onMove = (ev) => {
                if (!draggingRef.current) return;
                const dx = ev.clientX - startX;
                let leftW = startL + dx;
                let rightW = startR - dx;
                // 夹紧：左右都不小于最小宽度（保持两者之和不变，其他列不受影响）
                if (leftW < minL) {
                    rightW -= minL - leftW;
                    leftW = minL;
                }
                if (rightW < minR) {
                    leftW -= minR - rightW;
                    rightW = minR;
                }
                if (leftW < minL || rightW < minR) return;
                setRatios((prev) => {
                    const next = [...prev];
                    next[index] = leftW / total;
                    next[index + 1] = rightW / total;
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
        [list]
    );

    return (
        <div ref={containerRef} className={cn("flex h-full w-full min-h-0 overflow-hidden", className)}>
            {list.map((col, i) => {
                const isLast = i === n - 1;
                return (
                    <div
                        key={col.key}
                        className="flex h-full min-w-0"
                        style={{
                            // 按比例铺满容器：flexBasis 0 + flexGrow 比例 → 总和恰好等于容器宽度
                            flexGrow: ratios[i] ?? (n ? 1 / n : 1),
                            flexShrink: 1,
                            flexBasis: 0,
                        }}
                    >
                        {/* 列内容 */}
                        <div className="min-h-0 min-w-0 flex-1">{col.content}</div>
                        {/* 分隔条（最后一块不渲染） */}
                        {!isLast && (
                            <div
                                onMouseDown={(e) => onDividerDown(i, e)}
                                className="my-1 shrink-0 cursor-col-resize rounded-full bg-slate-200 transition-colors hover:bg-sky-300 active:bg-sky-400"
                                title="拖拽调整宽度"
                                style={{ width: DIVIDER_W }}
                            />
                        )}
                    </div>
                );
            })}
            {n === 0 && (
                <div className="flex flex-1 items-center justify-center text-sm text-slate-300">暂无面板</div>
            )}
        </div>
    );
}
