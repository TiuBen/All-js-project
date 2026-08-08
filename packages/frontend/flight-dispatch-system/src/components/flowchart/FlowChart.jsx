import { useMemo, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

/**
 * 检查节点流程图（鱼骨图 / 节点流程图）
 *
 * 输入：主节点数组 [{seq, name, desc, auxiliaries: [...]}]
 * 根据各节点的填写状态高亮（done / current / todo）
 *
 * props:
 *   nodes: 主节点列表
 *   statusMap: { [nodeKey]: 'done'|'current'|'todo' } 节点状态映射（nodeKey 默认用 seq）
 *   currentStep: 当前正在检查的节点 seq（脉冲高亮）
 *   size: 'mini' | 'full' —— mini 用于页面内嵌小地图，full 用于独立页面
 *   onSelect: (node) => void —— 点击节点回调
 */
export default function FlowChart({ nodes, statusMap = {}, currentStep = null, size = "mini", onSelect }) {
    const svgRef = useRef(null);
    const scrollRef = useRef(null); // 外层横向滚动容器

    const layout = useMemo(() => {
        // 计算每个节点的坐标：横向排布，鱼骨上下交错
        const N = nodes.length;
        const spacing = size === "full" ? 190 : 130;
        const nodeW = size === "full" ? 150 : 100;
        const nodeH = size === "full" ? 44 : 30;
        const startX = size === "full" ? 40 : 20;
        const yCenter = size === "full" ? 140 : 60;
        const topY = yCenter - (size === "full" ? 90 : 40);
        const bottomY = yCenter + (size === "full" ? 90 : 40);

        const positions = nodes.map((n, i) => {
            const x = startX + i * spacing;
            // 上下交错
            const y = i % 2 === 0 ? topY : bottomY;
            return { ...n, x, y, w: nodeW, h: nodeH };
        });

        const width = startX * 2 + Math.max(1, N - 1) * spacing + nodeW;
        const height = size === "full" ? 280 : 130;
        return { positions, width, height, yCenter };
    }, [nodes, size]);

    // 横向滚动容器：鼠标滚轮上下 → 水平移动（幅度 0.4 + smooth 平滑，与主要监控指标一致）
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const onWheel = (e) => {
            if (el.scrollWidth > el.clientWidth + 1) {
                e.preventDefault();
                el.scrollBy({ left: e.deltaY, behavior: "smooth" });
            }
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, [nodes, size]);

    const getNodeStatus = (n) => {
        const seq = n.source?.seq ?? n.seq;
        return statusMap[seq] || statusMap[`main-${seq}`] || "todo";
    };

    if (nodes.length === 0) {
        return <div className="flex items-center justify-center py-8 text-sm text-slate-400">暂无节点数据</div>;
    }

    const statusColor = {
        done: "#059669", // 完成 - 绿色
        current: "#2563eb", // 当前 - 蓝色
        todo: "#94a3b8", // 待办 - 灰色
    };

    return (
        <div ref={scrollRef} className="w-full overflow-x-auto">
            <svg
                ref={svgRef}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
                className="min-w-full"
                style={{ height: layout.height }}
            >
                {/* 主干线 */}
                <line
                    x1="0"
                    y1={layout.yCenter}
                    x2={layout.width}
                    y2={layout.yCenter}
                    stroke="#e2e8f0"
                    strokeWidth={size === "full" ? 3 : 2}
                    strokeDasharray={size === "full" ? "6 3" : "4 3"}
                />

                {/* 节点 + 连线 */}
                {layout.positions.map((p, i) => {
                    const status = getNodeStatus(p);
                    const isCurrent = currentStep !== null && (p.source?.seq ?? p.seq) === currentStep;
                    const color = isCurrent ? "#f59e0b" : statusColor[status] || statusColor.todo;
                    const isTop = i % 2 === 0;
                    const connectY = layout.yCenter;

                    return (
                        <g key={p.source?.seq ?? p.seq}>
                            {/* 节点 → 主干线 的连接线 */}
                            <line
                                x1={p.x + p.w / 2}
                                y1={isTop ? p.y + p.h : p.y}
                                x2={p.x + p.w / 2}
                                y2={connectY}
                                stroke={color}
                                strokeWidth={size === "full" ? 2 : 1.5}
                                opacity={isCurrent ? 1 : 0.5}
                            />

                            {/* 节点框 */}
                            <g
                                transform={`translate(${p.x}, ${p.y})`}
                                onClick={() => onSelect?.(p)}
                                className="cursor-pointer"
                            >
                                <rect
                                    width={p.w}
                                    height={p.h}
                                    rx={size === "full" ? 10 : 8}
                                    fill={isCurrent ? "#fef3c7" : status === "todo" ? "#f8fafc" : `${color}10`}
                                    stroke={color}
                                    strokeWidth={isCurrent ? 3 : status === "current" ? 2.5 : 1.5}
                                />
                                {status === "done" && !isCurrent && (
                                    <circle cx={p.w - 12} cy={12} r={7} fill={color}>
                                        <title>已完成</title>
                                    </circle>
                                )}
                                {isCurrent && (
                                    <circle cx={p.w - 12} cy={12} r={7} fill="none" stroke={color} strokeWidth={2}>
                                        <animate attributeName="r" values="4;8;4" dur="1.5s" repeatCount="indefinite" />
                                        <animate
                                            attributeName="opacity"
                                            values="1;0.3;1"
                                            dur="1.5s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}
                                <text
                                    x={p.w / 2}
                                    y={p.h / 2}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fontSize={size === "full" ? 13 : 10}
                                    fontWeight={status === "current" ? 700 : 500}
                                    fill={status === "todo" ? "#64748b" : color}
                                >
                                    {p.source?.seq ?? p.seq}. {p.name}
                                </text>
                            </g>

                            {/* 节点间箭头 */}
                            {i < layout.positions.length - 1 && (
                                <g>
                                    <line
                                        x1={p.x + p.w + 4}
                                        y1={p.y + p.h / 2}
                                        x2={layout.positions[i + 1].x - 6}
                                        y2={layout.positions[i + 1].y + layout.positions[i + 1].h / 2}
                                        stroke="#cbd5e1"
                                        strokeWidth={size === "full" ? 2 : 1.5}
                                        markerEnd="url(#arrowhead)"
                                    />
                                </g>
                            )}
                        </g>
                    );
                })}

                <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                        <polygon points="0 0, 8 3, 0 6" fill="#cbd5e1" />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}
