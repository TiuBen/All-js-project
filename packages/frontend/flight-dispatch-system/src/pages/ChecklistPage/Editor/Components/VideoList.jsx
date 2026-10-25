import { memo } from "react";
import { Camera, MonitorPlay } from "lucide-react";
/**
 * ============================================================
 * MutilTypeInput —— 多类型输入框（非受控组件）
 * ------------------------------------------------------------
 * 结构（布局对齐 BaseCheckInput）：
 *   标题行（label + 清空）
 *   ┌─────────────────────────────┐
 *   │ textarea（文字，可粘贴图片） │
 *   │ 图片预览区（缩略图 × 删除）  │
 *   │ 警告行（常驻，不自动消失）   │
 *   │ 工具栏（添加图片 | 数量/状态）│
 *   └─────────────────────────────┘
 *   隐藏 file input（accept="image/*"）
 *
 * 非受控：textarea 用 defaultValue + ref，DOM 自己管值；
 *         输入时把当前值同步给 store 做本地缓存（防抖落库）；
 *         父组件不接状态、不传回调，要数据时用 cache.store 的
 *         collect / submitAll 统一整理提交。
 *
 * 图片三个来源统一走 acceptImage：
 *   1. Ctrl + V 粘贴（clipboardData 里有图片才接管，纯文字照旧）
 *   2. 拖拽（拖入过程中边框变色；松手后合法图片进预览区）
 *   3. 点击「添加图片」（input 只接受 image/*）
 *
 * 大小上限默认 6M（IMAGE_MAX_BYTES 写在本文件里，直接改这里即可），
 * 也可用 props.maxImageBytes 单实例覆盖。
 *
 * props:
 *   nodeKey       必填，本条输入的本地缓存键（= 草稿键::节点 uuid，由 VideoList 拼好）
 *   label         标题（展示用）
 *   placeholder   可选
 *   rows          可选，textarea 行数，默认 3
 *   disabled      可选，只读态：不响应粘贴 / 拖拽 / 选择
 *   maxImageBytes 可选，单张图片大小上限，默认 6M
 *   className     可选，追加到外层
 * ============================================================
 */
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { ClipboardPaste, ImagePlus, TriangleAlert, X } from "lucide-react";

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
 * VideoCheckItem —— 视频监管项的单条填写卡片
 * ★ 缓存键（nodeKey）= 「草稿键::节点 uuid」，由 VideoList 拼好传进来：
 *   视频项 uuid 也只在模板内唯一，必须带上草稿前缀，切模板才不会串数据。
 */
export function VideoCheckItem({
    nodeKey,
    label = "",
    placeholder = "",
    rows = 2,
    disabled = false,
    maxImageBytes = IMAGE_MAX_BYTES,
    multiple = false, // ★ true=多图，false=单图（替换语义）
    className = "",
}) {
    const textareaRef = useRef(null);
    const fileRef = useRef(null);
    // 记录「已经向 textarea 回填过哪个缓存键」：
    // 非受控只在草稿加载完成后回填一次，之后 DOM 自己管值，输入不被覆盖
    const appliedKeyRef = useRef(null);

    const [dragOver, setDragOver] = useState(false);
    const [warn, setWarn] = useState(""); // 常驻提示，不自动消失
    const [zoom, setZoom] = useState(null); // 大图预览的图片对象

    // 只按缓存键订阅自己那条，多个实例互不牵连重渲染
    const item = useMutilTypeInputStore((s) => s.items[nodeKey]);
    const initItem = useMutilTypeInputStore((s) => s.initItem);
    const setNote = useMutilTypeInputStore((s) => s.setNote);
    const addImage = useMutilTypeInputStore((s) => s.addImage);
    const removeImage = useMutilTypeInputStore((s) => s.removeImage);
    const setState = useMutilTypeInputStore((s) => s.setState);
    const flushItem = useMutilTypeInputStore((s) => s.flushItem);

    const note = useMemo(() => item?.note ?? "", [item?.note]);
    const images = useMemo(() => item?.images ?? [], [item?.images]);
    const state = item?.state ?? ""; // 状态（照 MainList：右上角单击循环切换）
    const loaded = item?.loaded ?? false;
    const saveStatus = item?.saveStatus ?? "saved";

    // --------------------------------------------------------
    // 挂载 / 切缓存键：恢复本地草稿
    // --------------------------------------------------------
    useEffect(() => {
        if (!nodeKey) return;

        appliedKeyRef.current = null;
        initItem(nodeKey);
        setWarn("");
        setZoom(null);
    }, [nodeKey, initItem]);

    // --------------------------------------------------------
    // 草稿加载完成后回填 textarea（每个缓存键只回填一次）
    // --------------------------------------------------------
    useEffect(() => {
        if (!loaded || !textareaRef.current) return;
        if (appliedKeyRef.current === nodeKey) return;

        textareaRef.current.value = note;
        appliedKeyRef.current = nodeKey;
    }, [loaded, nodeKey, note]);

    // --------------------------------------------------------
    // 卸载兜底：把还没落库的内容立即写入。
    // 注意：异步 IndexedDB 写入无法保证在浏览器被强制终止前完成，
    // 防抖保存 + 失焦保存才是主要保障，这里只是尽力而为
    // --------------------------------------------------------
    useEffect(() => {
        return () => {
            if (nodeKey) flushItem(nodeKey);
        };
    }, [nodeKey, flushItem]);

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

            if (file.size > maxImageBytes) {
                setWarn(`图片 ${formatSize(file.size)} 超过上限 ${formatSize(maxImageBytes)}，已忽略`);
                return;
            }

            setWarn("");

            // ★ 单图模式：先删掉现有图片，再添加（等价于替换）
            if (!multiple && images.length > 0) {
                removeImage(nodeKey, images[0].id);
            }

            addImage(nodeKey, file);
        },
        [disabled, maxImageBytes, multiple, images, nodeKey, addImage, removeImage]
    );

    // Ctrl + V：剪贴板里是图片才接管，纯文字粘贴照旧交给 textarea
    const handlePaste = (event) => {
        if (disabled) return;
        const files = imageFilesFromDataTransfer(event.clipboardData);
        if (!files.length) return;

        event.preventDefault();
        // ★ 单图模式只取第一张
        const picked = multiple ? files : files.slice(0, 1);
        picked.forEach(acceptImage);
    };

    const handleDrop = (event) => {
        if (disabled) return;
        event.preventDefault();
        setDragOver(false);

        const files = imageFilesFromDataTransfer(event.dataTransfer);
        const picked = multiple ? files : files.slice(0, 1);
        picked.forEach(acceptImage);
    };

    const saveStatusText = saveStatus === "pending" ? "待保存…" : saveStatus === "error" ? "保存失败" : "浏览器已缓存";

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
                {/* ============ 标题行 ============ */}
                {(label || !disabled) && (
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                        <div className="text-wrap text-xs font-medium text-slate-600">{label}</div>

                        {/* 状态：单击循环切换（待检查→正常→异常→不适用→…），照 MainList 的控件 */}
                        <label
                            className={`flex shrink-0 items-center gap-1 border-b text-[11px] ${
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
                                    setState(nodeKey, nextStatus(state));
                                }}
                                className="shrink-0 cursor-pointer rounded p-0.5 transition-transform hover:scale-125 disabled:opacity-40"
                                title={`状态：${STATUS_LABELS[state] || "待检查"}（单击切换）`}
                            >
                                {STATUS_ICONS[state]}
                            </button>
                        </label>
                    </div>
                )}

                {/* ============ 文字输入（非受控） ============ */}
                <textarea
                    ref={textareaRef}
                    defaultValue=""
                    rows={rows}
                    readOnly={disabled || !loaded}
                    placeholder={!loaded ? "正在恢复本地记录…" : dragOver ? "松开鼠标，把图片放到这里" : placeholder}
                    onInput={(e) => {
                        if (!disabled && loaded) {
                            setNote(nodeKey, e.currentTarget.value);
                        }
                    }}
                    onBlur={(e) => {
                        // 失焦立即落库，不等防抖
                        if (!disabled && loaded) {
                            setNote(nodeKey, e.currentTarget.value);
                            flushItem(nodeKey);
                        }
                    }}
                    className="block w-full resize-y border-0 bg-transparent px-2 py-1 text-[12px] leading-relaxed text-slate-600 outline-none placeholder:text-slate-400 focus:ring-0 disabled:cursor-not-allowed disabled:text-slate-500"
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
                                            onClick={() => removeImage(nodeKey, img.id)}
                                            className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-500 p-0.5 text-white shadow hover:bg-red-500"
                                            title="删除这张图片"
                                        >
                                            <X size={10} />
                                        </button>
                                    )}
                                </div>

                                <div className="mt-0.5 truncate text-center text-[9px] text-slate-400" title={img.name}>
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
                            title={
                                multiple
                                    ? `从文件中选择图片（单张不超过 ${formatSize(maxImageBytes)}）`
                                    : `选择图片${images.length ? "（替换当前）" : ""}（不超过 ${formatSize(
                                          maxImageBytes
                                      )}）`
                            }
                        >
                            <ImagePlus size={13} />
                            {multiple ? "添加图片" : images.length ? "替换图片" : "添加图片"}
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
                                : multiple
                                ? "支持多张"
                                : "最多1张图片"}
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
                    multiple={multiple} // ★ 单图不带 multiple
                    className="hidden"
                    disabled={disabled || !loaded}
                    onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        const picked = multiple ? files : files.slice(0, 1);
                        picked.forEach(acceptImage);
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
 * ============================================================
 * VideoList —— 视频监管检查重点面板（填写模式，**不接 props**）
 * ------------------------------------------------------------
 * 按 groups 分组渲染：
 *   - 每个 group 是"视频监管检查重点（xxx）"大类，items 为子条目
 *   - **数据已按检查单类型分离**（客运 38 / 货运 40 / 顺航 42，各一份独立数据），
 *     因此本面板不做任何过滤 —— store 里是哪一份就渲染哪一份
 *
 * ★ 数据源查 store（切模板自动换份，页面不用管）：
 *     videoGroups  当前类型对应的视频监管数据（store 里由 videoFocusOf 选好）
 *     draftKey     草稿键（航班::模板），拼本地缓存键用
 *
 * ★ 本面板只订阅这两个值 + 零副作用（重渲染红线，别破坏）
 *   - 不订阅 videoItems：单条目的展示/交互下沉到 VideoCheckItem（自行订阅），
 *     改一条只重渲染那一行
 *   - 不订阅选中节点：选中节点与视频栏无关（不滚顶、不联动）
 *   结论：只有切航班 / 切模板（两个值换份）时本面板才重渲染。
 * ============================================================
 */
export default memo(function VideoList() {
    const groups = useChecklistStore((s) => s.videoGroups);
    const keyPrefix = useChecklistStore((s) => s.draftKey);

    const total = groups.reduce((n, g) => n + (g.items || []).length, 0);

    return (
        <div className="flex h-full overflow-y-auto min-w-0 flex-col rounded-lg border border-slate-300 bg-white">
            {/* 标题栏 */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-600">
                    <Camera size={13} className="text-sky-600" />
                    视频监管检查重点
                    <span className="text-[12px] font-normal text-slate-400">{total} 项</span>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MonitorPlay size={11} /> 截图 / 人工评价
                </span>
            </div>
            {/* 视频项列表：按 groups 分组 */}
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-2">
                {groups.length ? (
                    groups.map((g) => (
                        <div key={g.uuid} className="space-y-2">
                            {/* 分组标题（大类） */}
                            <div className="sticky top-0 z-10 flex items-center gap-1 rounded-md bg-sky-50/95 px-2 py-1 text-[12px] font-bold text-sky-700 backdrop-blur">
                                <MonitorPlay size={11} className="shrink-0" />
                                {g.name}
                                <span className="ml-auto text-[10px] font-normal text-sky-400">
                                    {(g.items || []).length} 项
                                </span>
                            </div>
                            {/* 子条目：每项独立订阅自己的数据（缓存键 = 草稿键 + 视频项 uuid） */}
                            {(g.items || []).map((item) => (
                                <VideoCheckItem
                                    key={item.uuid}
                                    nodeKey={nodeKeyOf(keyPrefix, item.uuid)}
                                    label={item.name}
                                />
                            ))}
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400">
                        该模板暂无视频监管项
                    </div>
                )}
            </div>
        </div>
    );
});
