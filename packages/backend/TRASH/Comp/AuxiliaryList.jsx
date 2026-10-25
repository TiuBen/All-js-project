/**
 * ============================================================
 * AuxiliaryList —— 辅助监控项列表（填写模式）
 * ------------------------------------------------------------
 * AuxiliaryItem：模仿 MutilTypeInput 的自缓存卡片（自己有 input，
 * 不引用 MainCheckItem），按 node.uuid 读写 cache.store（Comp 版），
 * 刷新 / 重开后自动恢复数据与状态。
 *
 * AuxiliaryItem 的填写值（value）：
 *   { state, text, time, images }
 *   - state ：待检查 / 正常 / 异常 / 不适用 ——
 *     ★ 标题行右上角（原 MutilTypeInput「清空」的位置）是 4 个
 *       状态快速切换按钮，点谁切谁，不用循环
 *   - text  ：textarea（非受控）
 *   - time  ：实际完成时间（datetime-local，非受控）
 *   - images：Ctrl+V 粘贴 / 拖拽 / 文件选择三来源，Blob 进 IndexedDB
 *
 * 布局对齐 MutilTypeInput：标题行 → 时间行 → textarea → 图片预览区
 * → 警告行（常驻）→ 工具栏 → 隐藏 file input。
 * ============================================================
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardPaste, ImagePlus, TriangleAlert, X } from "lucide-react";

import { STATUS_COLORS, STATUS_LABELS, STATUS_OPTIONS } from "../MutilTypeInput/statusBadge";

import useCacheStore from "./cache.store";

// 单张图片大小上限：默认 6MB（要改默认值就改这一行）
const IMAGE_MAX_BYTES = 6 * 1024 * 1024;

function formatSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** 从剪贴板 / 拖拽事件里挑出图片文件（items 优先，files 兜底） */
function imageFilesFromDataTransfer(dt) {
    if (!dt) return [];

    const files = [];

    for (const item of dt.items ?? []) {
        if (item.kind !== "file") continue;

        const file = item.getAsFile();

        if (file?.type?.startsWith("image/")) files.push(file);
    }

    if (!files.length && dt.files?.length) {
        return Array.from(dt.files).filter((f) => f.type?.startsWith("image/"));
    }

    return files;
}

/**
 * AuxiliaryItem —— 辅助监控项「单张填写卡片」
 * props 只要 node（含 uuid / name / desc），其余全组件自理
 */
function AuxiliaryItem({ node, disabled = false, className = "" }) {
    const uuid = node.uuid; // 节点身份 = uuid（也是本地草稿的 key）

    const textareaRef = useRef(null);
    const timeRef = useRef(null);
    const fileRef = useRef(null);
    // 文字 / 时间各自记「回填过哪个 uuid」：非受控只回填一次，之后 DOM 自己管值
    const appliedTextUuidRef = useRef(null);
    const appliedTimeUuidRef = useRef(null);

    const [dragOver, setDragOver] = useState(false);
    const [warn, setWarn] = useState(""); // 常驻提示，不自动消失
    const [zoom, setZoom] = useState(null); // 大图预览的图片对象

    // 只按 uuid 订阅自己那条，多个实例互不牵连重渲染
    const item = useCacheStore((s) => s.items[uuid]);
    const initItem = useCacheStore((s) => s.initItem);
    const setNote = useCacheStore((s) => s.setNote);
    const setState = useCacheStore((s) => s.setState);
    const setTime = useCacheStore((s) => s.setTime);
    const addImage = useCacheStore((s) => s.addImage);
    const removeImage = useCacheStore((s) => s.removeImage);
    const flushItem = useCacheStore((s) => s.flushItem);

    const state = item?.state ?? "";
    const images = item?.images ?? [];
    const loaded = item?.loaded ?? false;
    const saveStatus = item?.saveStatus ?? "saved";

    // --------------------------------------------------------
    // 挂载 / 切节点：恢复本地草稿（数据 + 状态一起恢复）
    // --------------------------------------------------------
    useEffect(() => {
        if (!uuid) return;

        appliedTextUuidRef.current = null;
        appliedTimeUuidRef.current = null;
        initItem(uuid);
        setWarn("");
        setZoom(null);
    }, [uuid, initItem]);

    // --------------------------------------------------------
    // 草稿加载完成后回填文字 / 时间（每个 uuid 各只回填一次）
    // --------------------------------------------------------
    useEffect(() => {
        if (!loaded) return;

        if (textareaRef.current && appliedTextUuidRef.current !== uuid) {
            textareaRef.current.value = item?.note ?? "";
            appliedTextUuidRef.current = uuid;
        }

        if (timeRef.current && appliedTimeUuidRef.current !== uuid) {
            timeRef.current.value = item?.time ?? "";
            appliedTimeUuidRef.current = uuid;
        }
    }, [loaded, uuid, item?.note, item?.time]);

    // --------------------------------------------------------
    // 卸载兜底：把还没落库的内容立即写入。
    // 注意：异步 IndexedDB 写入无法保证在浏览器被强制终止前完成，
    // 防抖保存 + 失焦保存才是主要保障，这里只是尽力而为
    // --------------------------------------------------------
    useEffect(() => {
        return () => {
            if (uuid) flushItem(uuid);
        };
    }, [uuid, flushItem]);

    // Esc 关闭大图预览
    useEffect(() => {
        if (!zoom) return;

        const onKey = (e) => e.key === "Escape" && setZoom(null);

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [zoom]);

    // --------------------------------------------------------
    // 收图：粘贴 / 拖拽 / 文件选择三个来源归一到这里
    // 只接受图片格式；大小上限以 maxImageBytes 为准（默认 6M）
    // --------------------------------------------------------
    const acceptImage = useCallback(
        (file) => {
            if (disabled || !file) return;

            if (!file.type?.startsWith("image/")) {
                setWarn(`「${file.name || "未命名文件"}」不是图片格式，已忽略`);
                return;
            }

            if (file.size > IMAGE_MAX_BYTES) {
                setWarn(`图片 ${formatSize(file.size)} 超过上限 ${formatSize(IMAGE_MAX_BYTES)}，已忽略`);
                return;
            }

            setWarn("");
            addImage(uuid, file);
        },
        [disabled, uuid, addImage]
    );

    // Ctrl + V：剪贴板里是图片才接管，纯文字粘贴照旧交给 textarea
    const handlePaste = (event) => {
        if (disabled) return;

        const files = imageFilesFromDataTransfer(event.clipboardData);
        if (!files.length) return;

        // 阻止浏览器把图片当文字/HTML 塞进 textarea（否则是一串乱码）
        event.preventDefault();
        files.forEach(acceptImage);
    };

    const handleDrop = (event) => {
        if (disabled) return;

        event.preventDefault();
        setDragOver(false);

        imageFilesFromDataTransfer(event.dataTransfer).forEach(acceptImage);
    };

    const saveStatusText =
        saveStatus === "saving"
            ? "保存中…"
            : saveStatus === "pending"
            ? "待保存…"
            : saveStatus === "error"
            ? "保存失败"
            : "本地已保存";

    return (
        <div className={`mt-1.5 ${className}`.trim()}>
            <div
                className={`overflow-hidden rounded-md border bg-white transition-colors ${
                    disabled
                        ? "border-slate-200 bg-slate-50/60"
                        : "border-slate-200 focus-within:border-primary-300 focus-within:ring-1 focus-within:ring-primary-100"
                } ${dragOver && !disabled ? "border-primary-400 bg-primary-50/60 ring-1 ring-primary-200" : ""}`}
                onPaste={handlePaste}
                onDragOver={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={(e) => {
                    // 拖到子元素上不算离开，避免边框闪烁
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                        setDragOver(false);
                    }
                }}
                onDrop={handleDrop}
            >
                {/* ============ 标题行：名称 + 状态快速切换（原「清空」的位置） ============ */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                    <div className="min-w-0">
                        <div className="truncate text-xs font-medium text-slate-600" title={node?.name}>
                            {node?.name}
                        </div>
                        {node?.desc && (
                            <div className="truncate text-[10px] text-slate-400" title={node.desc}>
                                {node.desc}
                            </div>
                        )}
                    </div>

                    {/* 状态快速切换：点谁切谁；当前态高亮（文字按 STATUS_COLORS 着色） */}
                    <div className="flex shrink-0 items-center gap-0.5">
                        {STATUS_OPTIONS.map((opt) => {
                            const active = state === opt.value;

                            return (
                                <button
                                    key={opt.value || "pending"}
                                    type="button"
                                    disabled={disabled || !loaded}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setState(uuid, opt.value);
                                    }}
                                    className={`rounded border px-1.5 py-0.5 text-[10px] transition-colors disabled:opacity-40 ${
                                        active
                                            ? `${opt.color} border-slate-300 bg-white font-semibold`
                                            : "border-transparent text-slate-400 hover:text-slate-600"
                                    }`}
                                    title={active ? `当前：${opt.label}` : `切换为：${opt.label}`}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ============ 实际完成时间（非受控） ============ */}
                <label className="flex items-center gap-1.5 border-b border-slate-100 px-2.5 py-1.5 text-[11px] text-slate-500">
                    实际完成时间
                    <input
                        ref={timeRef}
                        type="datetime-local"
                        defaultValue=""
                        disabled={disabled || !loaded}
                        onChange={(e) => {
                            if (!disabled && loaded) setTime(uuid, e.target.value);
                        }}
                        className="input min-w-0 flex-1 px-[0.25rem] py-[0.2rem] text-[11px]"
                    />
                </label>

                {/* ============ 文字输入（非受控） ============ */}
                <textarea
                    ref={textareaRef}
                    defaultValue=""
                    rows={2}
                    readOnly={disabled || !loaded}
                    placeholder={
                        !loaded
                            ? "正在恢复本地记录…"
                            : dragOver
                            ? "松开鼠标，把图片放到这里"
                            : "添加记录，也可以直接 Ctrl + V 粘贴图片…"
                    }
                    onInput={(e) => {
                        if (!disabled && loaded) {
                            setNote(uuid, e.currentTarget.value);
                        }
                    }}
                    onBlur={(e) => {
                        // 失焦立即落库，不等防抖
                        if (!disabled && loaded) {
                            setNote(uuid, e.currentTarget.value);
                            flushItem(uuid);
                        }
                    }}
                    className="block w-full resize-y border-0 bg-transparent px-2.5 py-2 text-[12px] leading-relaxed text-slate-600 outline-none placeholder:text-slate-400 focus:ring-0 disabled:cursor-not-allowed disabled:text-slate-500"
                />

                {/* ============ 图片预览区（点缩略图放大，× 删除） ============ */}
                {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-2.5 pb-2">
                        {images.map((img) => (
                            <div key={img.id} className="w-16">
                                <div className="relative">
                                    <img
                                        src={img.url}
                                        alt={img.name}
                                        title={`${img.name}（${formatSize(img.size)}），单击放大`}
                                        onClick={() => !disabled && setZoom(img)}
                                        className="h-16 w-16 cursor-zoom-in rounded border border-slate-200 object-cover"
                                    />

                                    {!disabled && (
                                        <button
                                            type="button"
                                            onClick={() => removeImage(uuid, img.id)}
                                            className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-500 p-0.5 text-white shadow hover:bg-red-500"
                                            title="删除这张图片"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>

                                <div
                                    className="mt-0.5 truncate text-center text-[9px] text-slate-400"
                                    title={img.name}
                                >
                                    {formatSize(img.size)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ============ 警告（常驻，不自动消失） ============ */}
                {warn && (
                    <div className="flex items-center gap-1 px-2.5 pb-1.5 text-[10px] text-amber-600">
                        <TriangleAlert size={11} />
                        {warn}
                    </div>
                )}

                {/* ============ 工具栏 ============ */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={disabled || !loaded}
                            onClick={() => fileRef.current?.click()}
                            className="flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title={`从文件中选择图片（单张不超过 ${formatSize(IMAGE_MAX_BYTES)}）`}
                        >
                            <ImagePlus size={13} />
                            添加图片
                        </button>

                        <span className="hidden items-center gap-1 text-[10px] text-slate-300 sm:flex">
                            <ClipboardPaste size={11} />
                            Ctrl + V 粘贴 / 可拖入图片
                        </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>
                            {images.length > 0
                                ? `${images.length} 张`
                                : dragOver
                                ? "松开添加"
                                : "支持多张"}
                        </span>

                        <span className={saveStatus === "error" ? "text-red-500" : undefined}>
                            {!loaded ? "读取中" : saveStatusText}
                        </span>
                    </div>
                </div>

                {/* 隐藏文件选择器：只接受图片；清空 value，同一张图可连选两次 */}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={disabled || !loaded}
                    onChange={(e) => {
                        Array.from(e.target.files ?? []).forEach(acceptImage);
                        e.target.value = "";
                    }}
                />
            </div>

            {/* ============ 大图预览浮层（单击 / Esc 关闭） ============ */}
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

/**
 * AuxiliaryList —— 辅助项列表：根据传入的 main 渲染其 auxiliaries。
 * 没选主项 / 没有辅助项时给占位提示。
 */
function AuxiliaryList({ main }) {
    if (!main) {
        return <div className="p-2 text-[12px] text-gray-400">请先选择一个主项</div>;
    }

    const auxiliaries = main.auxiliaries ?? [];

    return (
        <div className="flex min-h-0 flex-col gap-2">
            <div className="text-[12px] font-semibold text-slate-600">
                {main.eventId} - {main.name} 的辅助项
            </div>

            {auxiliaries.length ? (
                auxiliaries.map((aux) => <AuxiliaryItem key={aux.uuid} node={aux} />)
            ) : (
                <div className="text-[12px] text-gray-400">暂无辅助项</div>
            )}
        </div>
    );
}

export default AuxiliaryList;
