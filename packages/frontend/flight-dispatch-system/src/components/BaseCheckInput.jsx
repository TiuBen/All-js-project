/**
 * ============================================================
 * BaseCheckInput —— 检查项「基础输入框」：文字 + 1 张截图
 * ------------------------------------------------------------
 * 一个检查项（视频监管 / 主监控 / 辅助指标）的填写区，就这一件事：
 *   文字说明  +  一张截图（现场证据）
 *
 * 支持：
 *   - 普通文字输入（textarea，可换行、可拉伸）
 *   - Ctrl + V 粘贴截图（截图软件的图片剪贴板）
 *   - 点击「添加截图」从文件里选
 *   - 直接把图片拖进来
 *   - 缩略图预览 / 点开看大图 / × 删除
 *   - 文字 + 截图同时存在；**再次添加 = 替换**（每项只留 1 张）
 *
 * ★ 受控组件、零业务依赖
 *   props 里只有 note / image 两个值和两个回调，不认识 store，
 *   因此：谁用谁负责订阅（VideoCheckItem 用 useVideoCheckItem 逐项订阅），
 *   本组件不会让 42 项的列表面板整体重渲染。
 *
 * ★ 为什么图片不走 useRegister（非受控）
 *   register 那套是为"DOM 持值 + 外部回填"设计的；而截图有三个来源
 *   （粘贴 / 选择 / 拖拽）都要写回同一个字段，还要做缩略图与替换，
 *   交给 React 受控更直白。文字与图片因此统一走 props。
 *
 * ★ 二进制的归宿（与 utils/checkImage.js 的约定一致）
 *   image.blob 原样交给上层 → checklistDraft 直接 put 进 IndexedDB
 *   （结构化克隆天然支持 Blob），**不转 Base64**；
 *   预览用的 objectURL 只活在浏览器内存里，绝不落库。
 * ============================================================
 * @param {string}   props.note         文字说明
 * @param {Object}   props.image        单张截图对象（{ id,name,type,size,blob?,url? }）或 null
 * @param {Function} props.onNoteChange (note) => void
 * @param {Function} props.onImageChange (image|null) => void
 * @param {string}   [props.placeholder]
 * @param {number}   [props.rows]        textarea 行数（默认 2）
 * @param {boolean}  [props.disabled]    只读/锁定态：不响应粘贴、拖拽、选择
 * @param {string}   [props.className]
 * ============================================================
 */
import { useRef, useState } from "react";
import { ClipboardPaste, ImagePlus, TriangleAlert } from "lucide-react";
import { cn } from "../lib/utils";
import {
    filesFromClipboard,
    filesFromDataTransfer,
    imageFromFile,
    IMAGE_MAX_BYTES,
} from "../utils/checkImage";
// 缩略图 / 大图预览用公共组件（查看页也用它，同一张图在哪儿看都一样）
import CheckImage, { formatSize } from "./CheckImage";

export default function BaseCheckInput({
    note = "",
    image = null,
    onNoteChange,
    onImageChange,
    placeholder = "添加检查记录，也可以直接粘贴截图…",
    rows = 2,
    disabled = false,
    className,
}) {
    const fileRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);
    const [warn, setWarn] = useState("");

    /** 收下一张图（三项来源归一到这里）——每项只留 1 张，旧的被替换 */
    const accept = (file) => {
        const img = imageFromFile(file);
        if (!img) return;
        if (img.size > IMAGE_MAX_BYTES) {
            setWarn(`截图 ${formatSize(img.size)} 超过上限 ${formatSize(IMAGE_MAX_BYTES)}，已忽略`);
            return;
        }
        setWarn("");
        onImageChange?.(img);
    };

    /** Ctrl + V：剪贴板里是图片才接管；粘普通文字照旧交给 textarea */
    const handlePaste = (event) => {
        if (disabled) return;
        const files = filesFromClipboard(event.clipboardData);
        if (!files.length) return;
        // 阻止浏览器把图片当文字/HTML 塞进 textarea（否则会看到一串乱码）
        event.preventDefault();
        accept(files[0]);
    };

    const handleDrop = (event) => {
        if (disabled) return;
        event.preventDefault();
        setDragOver(false);
        const files = filesFromDataTransfer(event.dataTransfer);
        if (files.length) accept(files[0]);
    };

    // 大图预览的开关与 Esc 关闭都在 CheckImage 内部，这里只管"收图"

    return (
        <div
            className={cn(
                "mt-1.5 overflow-hidden rounded-md border bg-white transition-colors",
                disabled ? "border-slate-200 bg-slate-50/60" : "border-slate-200 focus-within:border-primary-300 focus-within:ring-1 focus-within:ring-primary-100",
                dragOver && !disabled && "border-primary-400 bg-primary-50/60 ring-1 ring-primary-200",
                className
            )}
            onPaste={handlePaste}
            onDragOver={(e) => {
                if (disabled) return;
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            {/* ============ 文字说明 ============ */}
            <textarea
                value={note}
                onChange={(e) => onNoteChange?.(e.target.value)}
                rows={rows}
                readOnly={disabled}
                placeholder={dragOver ? "松开鼠标，把截图放到这里" : placeholder}
                className={cn(
                    "block w-full resize-y border-0 bg-transparent px-2.5 py-2 text-[12px] leading-relaxed text-slate-600 outline-none",
                    "placeholder:text-slate-400 focus:ring-0",
                    disabled && "cursor-not-allowed text-slate-500"
                )}
            />

            {/* ============ 截图预览（点缩略图看大图，× 删除） ============ */}
            {image && (
                <div className="flex flex-wrap items-start gap-2 px-2.5 pb-2">
                    <CheckImage
                        image={image}
                        disabled={disabled}
                        onRemove={disabled ? undefined : () => onImageChange?.(null)}
                    />
                    <div className="min-w-0 flex-1 pt-0.5 text-[10px] leading-tight text-slate-400">
                        <div className="truncate text-slate-500" title={image.name}>
                            {image.name}
                        </div>
                        <div>{formatSize(image.size)}</div>
                        {!image.url && image.blob && <div className="text-amber-500">暂存本机</div>}
                    </div>
                </div>
            )}

            {/* ============ 超大截图提示（常驻，不自动消失） ============ */}
            {warn && (
                <div className="flex items-center gap-1 px-2.5 pb-1.5 text-[10px] text-amber-600">
                    <TriangleAlert size={11} /> {warn}
                </div>
            )}

            {/* ============ 底部工具栏 ============ */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:hover:text-slate-400"
                        title={image ? "选择新截图替换当前这张" : "从文件中选择截图"}
                    >
                        <ImagePlus size={13} />
                        {image ? "替换截图" : "添加截图"}
                    </button>

                    <span className="hidden items-center gap-1 text-[10px] text-slate-300 sm:flex">
                        <ClipboardPaste size={11} />
                        Ctrl + V 粘贴截图
                    </span>
                </div>

                <span className="text-[10px] text-slate-400">
                    {image ? "1 / 1 张" : dragOver ? "松开添加" : "支持 1 张"}
                </span>
            </div>

            {/* 隐藏的文件选择器（清空 value：同一张图可以连续选两次） */}
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) accept(f);
                    e.target.value = "";
                }}
            />
        </div>
    );
}
