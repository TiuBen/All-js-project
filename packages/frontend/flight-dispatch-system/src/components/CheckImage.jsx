/**
 * ============================================================
 * CheckImage —— 检查项截图（可看大图 / 可删除）
 * ------------------------------------------------------------
 * 填写端（BaseCheckInput 里的缩略图）与只读查看端（查看页三个 CheckList：
 * MainCheckList / AuxiliaryCheckList / VideoCheckList）共用同一个组件，
 * 保证"同一张图在哪里看都一样"。
 *
 * ★ objectURL 生命周期收在本组件内
 *   - 服务端回读的图只有 url → 直接用
 *   - 本地新贴的图只有 blob → 用 blob 建临时 objectURL
 *   useMemo 在渲染期算 URL，换图/卸载时释放；不塞进 state 是为了
 *   避免"先 revoke 旧的、再建新的"之间 <img> 拿到失效 URL 闪一下。
 *
 * ★⚠️ 释放必须"推迟一拍"（revokeLater）—— 这是踩过的坑：
 *   main.jsx 开着 StrictMode，dev 下 effect 是 挂载 → 立刻卸载 → 再挂载。
 *   若在卸载清理里立刻 revokeObjectURL，那张 URL 会在**真挂载之前**作废，
 *   <img> 拿到一张失效地址 → 图直接不出来（naturalWidth = 0），
 *   且只发生在"该组件第一次出现"的那张图上（后续换图时组件已挂着，
 *   清理的是旧 URL，所以看起来"换一张就好"）。
 *
 * ★ 只有元信息、没有二进制（历史记录里的截图未上传）→ 显示占位，
 *   而不是留一个破图（onError 也无从补救）。
 * ============================================================
 * @param {Object}     props.image      { id,name,type,size,blob?,url? }
 * @param {Function}   [props.onRemove] 传了才显示删除按钮（查看端不传 = 只读）
 * @param {boolean}    [props.disabled]
 * @param {"sm"|"md"}  [props.size]     缩略图尺寸（默认 sm = 80×64）
 * @param {string}     [props.className]
 * ============================================================
 */
import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { Maximize2, X } from "lucide-react";

// ------------------------------------------------------------------
// 待释放的 objectURL：url → 定时器
// keepAlive 取消待释放（重挂载时把这张 URL 重新"续上"），
// revokeLater 推迟一个宏任务再释放 —— 只有真卸载才会走到释放，
// StrictMode 的假卸载会被随后的重挂载取消掉（同一任务内，定时器来不及跑）。
// ------------------------------------------------------------------
const pendingRevoke = new Map();

function keepAlive(url) {
    const timer = pendingRevoke.get(url);
    if (timer !== undefined) {
        clearTimeout(timer);
        pendingRevoke.delete(url);
    }
}

function revokeLater(url) {
    if (!url) return;
    keepAlive(url);
    pendingRevoke.set(
        url,
        setTimeout(() => {
            pendingRevoke.delete(url);
            URL.revokeObjectURL(url);
        }, 0)
    );
}

/** 可展示的图片地址：服务端 url 优先，本地新图用 blob 建临时 objectURL */
export function useImageSrc(image) {
    const remoteUrl = image?.url || null;
    const blob = remoteUrl ? null : image?.blob || null;

    const localUrl = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);

    useEffect(() => {
        if (!localUrl) return undefined;
        keepAlive(localUrl); // 重挂载（StrictMode 双调用）→ 取消上一次的待释放
        return () => revokeLater(localUrl);
    }, [localUrl]);

    return remoteUrl || localUrl || null;
}

/** 人类可读体积 */
export function formatSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function CheckImage({ image, onRemove, disabled = false, size = "sm", className }) {
    const src = useImageSrc(image);
    const [zoom, setZoom] = useState(false);

    // 大图预览：Esc 关闭
    useEffect(() => {
        if (!zoom) return undefined;
        const onKey = (e) => e.key === "Escape" && setZoom(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [zoom]);

    const box = size === "md" ? "h-24 w-32" : "h-16 w-20";

    if (!src) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center rounded border border-dashed border-slate-300 bg-slate-50 text-[10px] text-slate-400",
                    box,
                    className
                )}
                title="该截图只有记录信息，二进制未保存"
            >
                截图不可用
            </div>
        );
    }

    return (
        <div className={cn("group relative inline-block", className)}>
            <button
                type="button"
                onClick={() => setZoom(true)}
                className={cn("block cursor-zoom-in overflow-hidden rounded border border-slate-200 bg-slate-50", box)}
                title={`${image?.name || "截图"}${image?.size ? ` · ${formatSize(image.size)}` : ""}（点击看大图）`}
            >
                <img src={src} alt={image?.name || "截图"} className="h-full w-full object-cover" />
            </button>

            {/* 删除：有 onRemove 才有（查看端只读）。触屏常驻，鼠标悬停才显示 */}
            {onRemove && !disabled && (
                <button
                    type="button"
                    onClick={onRemove}
                    className={cn(
                        "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center",
                        "rounded-full border border-white bg-slate-700 text-white shadow-sm",
                        "transition-opacity hover:bg-red-500",
                        "opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    )}
                    title="删除截图"
                >
                    <X size={11} />
                </button>
            )}

            <span className="pointer-events-none absolute bottom-0.5 right-0.5 rounded bg-slate-900/50 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 size={9} />
            </span>

            {/* 大图预览（Esc / 点任意处关闭） */}
            {zoom && (
                <div
                    className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-slate-900/80 p-6"
                    onClick={() => setZoom(false)}
                >
                    <img
                        src={src}
                        alt={image?.name || "截图"}
                        className="max-h-[85vh] max-w-full rounded-lg bg-white object-contain shadow-2xl"
                    />
                    <div className="mt-3 text-[12px] text-white/80">
                        {image?.name} {image?.size ? `· ${formatSize(image.size)}` : ""} · 点击任意处关闭
                    </div>
                </div>
            )}
        </div>
    );
}
