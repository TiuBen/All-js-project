/**
 * ============================================================
 * AuxiliaryList —— 辅助监控项列表（填写模式）
 * ------------------------------------------------------------
 * AuxiliaryItem：模仿 MutilTypeInput 的自缓存卡片（自己有 input，
 * 不引用 MainCheckItem），按缓存键读写 cache.store（Comp 版），
 * 刷新 / 重开后自动恢复数据与状态。
 *
 * ★ 缓存键 = 「草稿键::节点 uuid」（keyPrefix + node.uuid），keyPrefix 由 Editor
 *   传下来（= 航班::模板）—— 同一节点在不同草稿里各存各的，见 utils/checklistCache.js。
 *
 * AuxiliaryItem 的填写值（value）：
 *   { state, text, time, images }
 *   - state ：待检查 / 正常 / 异常 / 不适用 ——
 *     ★ 标题行右上角（原 MutilTypeInput「清空」的位置）是 4 个
 *       状态快速切换按钮，点谁切谁，不用循环
 *   - text  ：textarea（非受控，落库字段名 note）
 *   - time  ：实际完成时间（datetime-local，非受控）
 *   - images：Ctrl+V 粘贴 / 拖拽 / 文件选择三来源，Blob 进 IndexedDB
 *
 * 布局对齐 MutilTypeInput：标题行 → 时间行 → textarea → 图片预览区
 * → 警告行（常驻）→ 工具栏 → 隐藏 file input。
 * ============================================================
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ClipboardPaste, ImagePlus, TriangleAlert, X, ArrowLeft, MonitorPlay, PenLine } from "lucide-react";

import { STATUS_COLORS, STATUS_ICONS, STATUS_LABELS, nextStatus } from "./statusBadge";
import { nodeKeyOf } from "../../../../utils/checklistCache";

import useMutilTypeInputStore from "../../../../store/cache.store";
import { useChecklistStore } from "../../../../store/checklistEditorPage.store";

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
 * props 只要 node（含 uuid / name / desc）+ keyPrefix（草稿键），其余全组件自理
 */
export function AuxiliaryItem({ node, disabled = false, className = "", keyPrefix }) {
    // 本地缓存键 = 草稿前缀 + 节点 uuid（同一节点在不同草稿里各存各的）
    const itemKey = nodeKeyOf(keyPrefix, node.uuid);

    const textareaRef = useRef(null);
    const timeRef = useRef(null);
    const fileRef = useRef(null);
    // 文字 / 时间各自记「回填过哪个缓存键」：非受控只回填一次，之后 DOM 自己管值
    const appliedTextKeyRef = useRef(null);
    const appliedTimeKeyRef = useRef(null);

    const [dragOver, setDragOver] = useState(false);
    const [warn, setWarn] = useState(""); // 常驻提示，不自动消失
    const [zoom, setZoom] = useState(null); // 大图预览的图片对象

    // 只按缓存键订阅自己那条，多个实例互不牵连重渲染
    const item = useMutilTypeInputStore((s) => s.items[itemKey]);
    const initItem = useMutilTypeInputStore((s) => s.initItem);
    const setNote = useMutilTypeInputStore((s) => s.setNote);
    const setState = useMutilTypeInputStore((s) => s.setState);
    const setTime = useMutilTypeInputStore((s) => s.setTime);
    const addImage = useMutilTypeInputStore((s) => s.addImage);
    const removeImage = useMutilTypeInputStore((s) => s.removeImage);
    const flushItem = useMutilTypeInputStore((s) => s.flushItem);

    const state = item?.state ?? "";
    const images = item?.images ?? [];
    const loaded = item?.loaded ?? false;
    const saveStatus = item?.saveStatus ?? "saved";

    // --------------------------------------------------------
    // 挂载 / 切节点（或切草稿，键变了）：恢复本地草稿（数据 + 状态一起恢复）
    // --------------------------------------------------------
    useEffect(() => {
        if (!itemKey) return;

        appliedTextKeyRef.current = null;
        appliedTimeKeyRef.current = null;
        initItem(itemKey);
        setWarn("");
        setZoom(null);
    }, [itemKey, initItem]);

    // --------------------------------------------------------
    // 草稿加载完成后回填文字 / 时间（每个缓存键各只回填一次）
    // --------------------------------------------------------
    useEffect(() => {
        if (!loaded) return;

        if (textareaRef.current && appliedTextKeyRef.current !== itemKey) {
            textareaRef.current.value = item?.note ?? "";
            appliedTextKeyRef.current = itemKey;
        }

        if (timeRef.current && appliedTimeKeyRef.current !== itemKey) {
            timeRef.current.value = item?.time ?? "";
            appliedTimeKeyRef.current = itemKey;
        }
    }, [loaded, itemKey, item?.note, item?.time]);

    // --------------------------------------------------------
    // 卸载兜底：把还没落库的内容立即写入。
    // 注意：异步 IndexedDB 写入无法保证在浏览器被强制终止前完成，
    // 防抖保存 + 失焦保存才是主要保障，这里只是尽力而为
    // --------------------------------------------------------
    useEffect(() => {
        return () => {
            if (itemKey) flushItem(itemKey);
        };
    }, [itemKey, flushItem]);

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
            addImage(itemKey, file);
        },
        [disabled, itemKey, addImage]
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
        <div className={`mt-1.5 ${className} `.trim()}>
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

                    {/* 状态：单击循环切换（待检查→正常→异常→不适用→…），hover 显示提示 */}
                    <label
                        className={`ml-auto flex shrink-0 items-center gap-1 border-b text-[11px] ${
                            STATUS_COLORS[state] || "text-blue-500"
                        }`}
                        title={`状态：${STATUS_LABELS[state] || "待检查"}（单击切换）`}
                    >
                        <span>{STATUS_LABELS[state] || "待检查"}</span>
                        <button
                            type="button"
                            disabled={!loaded}
                            onClick={(e) => {
                                e.stopPropagation(); // 不触发卡片选中
                                setState(itemKey, nextStatus(state));
                            }}
                            className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-125 disabled:opacity-40"
                            title={`状态：${STATUS_LABELS[state] || "待检查"}（单击切换）`}
                        >
                            {STATUS_ICONS[state]}
                        </button>
                    </label>
                </div>
                <div className="flex flex-row gap-2 mx-2 justify-between">
                    {/* ============ 实际完成时间（非受控） ============ */}
                    <label className="flex flex-col items-start justify-start gap-1 border-b border-slate-100  py-1.5 text-[11px] text-slate-500">
                        实际完成时间
                        <input
                            ref={timeRef}
                            type="datetime-local"
                            defaultValue=""
                            disabled={disabled || !loaded}
                            onChange={(e) => {
                                if (!disabled && loaded) setTime(itemKey, e.target.value);
                            }}
                            className="input min-w-0  px-[0.25rem] py-[0.2rem] text-[11px]"
                        />
                    </label>
                    <div className="flex-1 ">
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
                                    setNote(itemKey, e.currentTarget.value);
                                }
                            }}
                            onBlur={(e) => {
                                // 失焦立即落库，不等防抖
                                if (!disabled && loaded) {
                                    setNote(itemKey, e.currentTarget.value);
                                    flushItem(itemKey);
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
                                                    onClick={() => removeImage(itemKey, img.id)}
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
                                    {images.length > 0 ? `${images.length} 张` : dragOver ? "松开添加" : "支持多张"}
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
            </div>
        </div>
    );
}

/**
 * AuxiliaryList —— 辅助项列表（**不接 props**）：渲染「当前选中主项」的 auxiliaries。
 * 数据全部自查 store：
 *   selectedMainNode  点了哪个主项（MainCheckItem 点一下就写这里，主项高亮也是同一个值）
 *   mains             当前模板的主项数组 —— 只用来确认选中的节点还在不在本模板里
 *   draftKey          草稿键，透传给每张卡片拼本地缓存键
 * ★ 换模板后旧的选中节点不属于新模板 → 当作没选，回到「请先从左侧选择」。
 */
export default function AuxiliaryList() {
    const selectedMainNode = useChecklistStore((s) => s.selectedMainNode);
    const mains = useChecklistStore((s) => s.mains);
    const keyPrefix = useChecklistStore((s) => s.draftKey);

    const main = selectedMainNode && mains.includes(selectedMainNode) ? selectedMainNode : null;
    const auxiliaries = main?.auxiliaries ?? [];

    return (
        <div className="flex h-full overflow-y-auto min-w-0 flex-col rounded-lg border border-slate-300 bg-white">
            {/* 标题栏 */}

            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                {!main ? (
                    <>
                        <div className="flex items-center gap-1.5 text-[14px] font-semibold text-red-600">
                            <ArrowLeft size={13} className="text-red-600" />
                            请先从左侧选择一个主检查项目
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <MonitorPlay size={11} /> 截图 / 人工评价
                        </span>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                            {main?.name} 辅助检查项目
                            <PenLine size={13} className="text-sky-600" />
                            <span className="text-[12px] font-normal text-slate-400">{auxiliaries.length} 项</span>
                        </div>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <MonitorPlay size={11} /> 截图 / 人工评价
                        </span>
                    </>
                )}
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
                {auxiliaries.length ? (
                    auxiliaries.map((aux) => <AuxiliaryItem key={aux.uuid} node={aux} keyPrefix={keyPrefix} />)
                ) : (
                    <div className="text-[12px] text-gray-400">暂无辅助项</div>
                )}
            </div>
        </div>
    );
}
