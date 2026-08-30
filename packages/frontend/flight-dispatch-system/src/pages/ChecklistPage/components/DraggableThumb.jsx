import { useState, useRef, useCallback, useEffect } from "react";
import FlowChart from "../../../components/flowchart/FlowChart";
import { X, GripHorizontal, Maximize2 } from "lucide-react";

/**
 * 右下角可拖动的缩略图小窗（迷你流程图）
 * - 可拖动（pointer 事件，不引第三方库）
 * - 可关闭；关闭后由外部提供开关按钮重新打开
 * - 高亮当前检查节点
 */
export default function DraggableThumb({ nodes, statusMap, currentStep, onSelectNode, onOpenFull, onClose }) {
    const [pos, setPos] = useState(() => {
        // 默认右下角
        return { x: window.innerWidth - 380, y: window.innerHeight - 320 };
    });
    const [dragging, setDragging] = useState(false);
    const dragRef = useRef(null);

    // 窗口尺寸变化时修正位置
    useEffect(() => {
        const onResize = () => {
            setPos((p) => ({
                x: Math.min(p.x, window.innerWidth - 340),
                y: Math.min(p.y, window.innerHeight - 280),
            }));
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const onPointerDown = useCallback(
        (e) => {
            // 只允许从标题栏拖动
            if (e.target.closest("[data-nodrag]")) return;
            dragRef.current = {
                startX: e.clientX,
                startY: e.clientY,
                originX: pos.x,
                originY: pos.y,
            };
            setDragging(true);
            e.currentTarget.setPointerCapture?.(e.pointerId);
        },
        [pos]
    );

    const onPointerMove = useCallback((e) => {
        if (!dragRef.current) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPos({
            x: Math.max(0, Math.min(dragRef.current.originX + dx, window.innerWidth - 340)),
            y: Math.max(0, Math.min(dragRef.current.originY + dy, window.innerHeight - 220)),
        });
    }, []);

    const onPointerUp = useCallback(() => {
        dragRef.current = null;
        setDragging(false);
    }, []);

    return (
        <div
            className={`fixed z-50 w-[320px] overflow-hidden rounded-xl border bg-white shadow-2xl ${
                dragging ? "cursor-grabbing ring-2 ring-primary-400" : "cursor-grab"
            }`}
            style={{ left: pos.x, top: pos.y }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
        >
            {/* 标题栏（可拖动区域） */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5 select-none">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <GripHorizontal size={13} className="text-slate-400" />
                    节点进度小地图
                </div>
                <div className="flex items-center gap-0.5" data-nodrag>
                    <button
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                        title="新开页面查看大图"
                        onClick={onOpenFull}
                    >
                        <Maximize2 size={13} />
                    </button>
                    <button
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="关闭小地图"
                        onClick={onClose}
                    >
                        <X size={13} />
                    </button>
                </div>
            </div>

            {/* 流程图（可交互：点击节点/拖动滚动条；data-nodrag 阻止窗口被拖动） */}
            <div className="p-2" data-nodrag>
                <FlowChart
                    nodes={nodes}
                    statusMap={statusMap}
                    size="mini"
                    currentStep={currentStep}
                    onSelect={(n) => onSelectNode?.(n)}
                />
            </div>
        </div>
    );
}
