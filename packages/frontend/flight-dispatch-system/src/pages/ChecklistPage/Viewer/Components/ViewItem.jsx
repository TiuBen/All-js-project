/**
 * ============================================================
 * ViewItem —— 查看页的只读数据卡片（纯展示，无任何输入控件）
 * ------------------------------------------------------------
 * 展示一条填写项：名称 + 描述 + 状态（ViewColor 口径：异常红、其余灰）
 * + 实际完成时间 + 文字 + 图片缩略图（单击放大，Esc / 点击关闭）。
 *
 * ★ 数据直接来自后端记录的 item（{ state, time, text, images[url] }），
 *   不经过 cache.store —— 展示态与填写缓存完全解耦。
 * ★ 住在 Components/ 里：它只是三个 ViewXXXList 共用的一个零件，
 *   与它们同级，不属于 Viewer 根目录的页面级文件。
 * ============================================================
 */
import { useEffect, useState } from "react";
import { viewStatusOf } from "../../../../utils/ViewColor";

export default function ViewItem({ name, desc, item }) {
    const [zoom, setZoom] = useState(null);
    const st = viewStatusOf(item?.state);
    const images = item?.images ?? [];

    // Esc 关闭大图预览（只挂载在有图时）
    useEffect(() => {
        if (!zoom) return;

        const onKey = (e) => e.key === "Escape" && setZoom(null);

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [zoom]);

    return (
        <div className="rounded-md border border-slate-200 bg-white p-2">
            <div className="flex items-start gap-2">
                <span className="text-wrap min-w-0 flex-1 text-[13px] font-medium text-slate-700" title={name}>
                    {name}
                </span>
                <span className="shrink-0 text-[11px] font-semibold" style={{ color: st.color }}>
                    {st.label}
                </span>
            </div>

            {desc && (
                <div className="text-wrap text-[11px] text-slate-400" title={desc}>
                    {desc}
                </div>
            )}

            {(item?.time || item?.text || images.length > 0) && (
                <div className="mt-1 space-y-1 border-t border-slate-100 pt-1">
                    {item?.time && (
                        <div className="text-[11px] text-slate-500">
                            实际完成时间：{String(item.time).replace("T", " ")}
                        </div>
                    )}
                    {item?.text && (
                        <div className="whitespace-pre-wrap text-[12px] leading-relaxed text-slate-600">
                            {item.text}
                        </div>
                    )}
                    {images.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {images.map((img, i) => (
                                <img
                                    key={img.url ?? i}
                                    src={img.url}
                                    alt={img.name}
                                    title={`${img.name}（单击放大）`}
                                    onClick={() => setZoom(img)}
                                    className="h-14 w-14 cursor-zoom-in rounded border border-slate-200 object-cover"
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 大图预览（单击 / Esc 关闭） */}
            {zoom && (
                <div
                    onClick={() => setZoom(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                >
                    <img src={zoom.url} alt={zoom.name} className="max-h-full max-w-full rounded" />
                </div>
            )}
        </div>
    );
}
