

我已读完 8 个文件，理清了你现有的一套「非受控组件 + zustand 缓存中枢(cache.store) + IndexedDB(cache.js)」模式，以及 `statusBadge.js` 里的状态循环、`Editor.js` 里 `MainList/Auxiliary` 的雏形。

**先说一句我的理解**：你要的是把 `MainList / Auxiliary / MainCheckItem / AuxiliaryItem` 拆成独立组件；点主项→辅助列联动；每个检查项像 `MutilTypeInput` 一样按 uuid 缓存、下次进来自动恢复；区别是把 `MutilTypeInput` 右上角那个「清空」按钮换成**状态快速切换**，缓存的 value 形状为 `{ state, text, time, images }`。

一个要提前对齐的点：你说「5 个状态」，但 `statusBadge.js` 里 `STATUS_CYCLE` 实际是 **4 个**（待检查/正常/异常/不适用），你正文也只列了这 4 个。我按你现有的 4 态实现（复用 `nextStatus`），将来想加第 5 个只需在 `STATUS_CYCLE` 里追加即可。

下面 6 个文件，复制即用。只有两处需按你项目实际路径微调（已用 `★` 标出）。

---

### 1. `checkItem.cache.store.js`（仿 cache.store，value 富字段版）

放去和 `cache.js` 同级目录，底层直接复用你现有的 `cache.js`（同库不同 uuid，互不冲突）。

```javascript
/**
 * ============================================================
 * checkItem.cache.store.js —— 检查项（主/辅助）草稿中枢（zustand）
 * ------------------------------------------------------------
 * 完全沿用 MutilTypeInput 的 cache.store.js 思路：
 *   - 组件只管交互（打字 / 填时间 / 切状态 / 贴图）
 *   - 防抖落库 / 整理 / 提交统一收在这里，组件与存储实现解耦
 *   - 每个检查项按 uuid 各占一条，互不牵连重渲染；objectURL 只在本层造/回收
 *   - 底层复用 cache.js（IndexedDB）：drafts 存元信息，images 库存 Blob
 *
 * 与 cache.store.js 的唯一区别 —— 一条 value 字段更丰富：
 *   value = { state, text, time, images }
 *     state  : "" | "ok" | "abnormal" | "na"（对应 statusBadge.STATUS_CYCLE）
 *     text   : 辅助项文字记录（主项不用，恒留空）
 *     time   : 完成时间（"HH:MM" 字符串）
 *     images : [{ id, name, type, size, blob, url }]
 *   主监控项只用 state + time；辅助项四个字段全用。
 *
 * 对外能力：
 *   组件交互：initItem / patchValue / addImage / removeImage / clearItem
 *   生命周期：flushItem（强制落库，卸载兜底 / 提交前 flush）
 *   整理数据：collect    提交：submitAll
 * ============================================================
 */
import { create } from "zustand";

import { getDraft, putDraft, deleteDraft, putImage, getImage, deleteImage } from "./cache";

const SAVE_DELAY = 500; // 文字防抖落库间隔（时间/状态是离散动作，切一次即防抖一次）

// 一条草稿的空值：clearItem 之后回到这个形状（保持 loaded，当"空白新草稿"）
const EMPTY_VALUE = { state: "", text: "", time: "", images: [] };

// 预览 objectURL 按图片 id 存模块级 Map：删图 / 清空精准回收，刷新后浏览器自动作废
const previewUrls = new Map();

function createPreviewUrl(id, blob) {
    if (previewUrls.has(id)) return previewUrls.get(id);

    const url = URL.createObjectURL(blob);
    previewUrls.set(id, url);

    return url;
}

function revokePreviewUrl(id) {
    if (!previewUrls.has(id)) return;

    URL.revokeObjectURL(previewUrls.get(id));
    previewUrls.delete(id);
}

/** 把 File / Blob 归一成图片记录（id 生成收口在这一处，别处不重复造） */
function toImageRecord(file) {
    return {
        id:
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        name: file.name || "clipboard.png",
        type: file.type || "image/png",
        size: file.size,
        blob: file,
    };
}

// 防抖定时器按 uuid 分开，多个实例互不干扰
const saveTimers = new Map();

const useCheckItemStore = create((set, get) => {
    /** 变更后防抖落库；真正写库统一走 flushItem，避免两套写库逻辑 */
    function scheduleSave(uuid) {
        if (saveTimers.has(uuid)) {
            clearTimeout(saveTimers.get(uuid));
        }

        saveTimers.set(
            uuid,
            setTimeout(() => {
                saveTimers.delete(uuid);
                get().flushItem(uuid);
            }, SAVE_DELAY)
        );
    }

    return {
        items: {},

        // ----------------------------------------------------
        // 挂载时恢复本地草稿（已加载过直接复用，不重复读库）
        // ----------------------------------------------------
        async initItem(uuid) {
            if (!uuid) return;
            if (get().items[uuid]?.loaded) return;

            // 先占位，防止同一个 uuid 并发 init 两次都去读库
            set((state) => ({
                items: {
                    ...state.items,
                    [uuid]:
                        state.items[uuid] ?? {
                            uuid,
                            ...EMPTY_VALUE,
                            loaded: false,
                            saveStatus: "saved",
                        },
                },
            }));

            try {
                const draft = await getDraft(uuid);
                const images = [];

                // 元信息和 Blob 分库存，读的时候按 id 把 Blob 拼回来
                for (const meta of draft?.images ?? []) {
                    const blob = await getImage(meta.id);

                    if (blob) {
                        images.push({
                            ...meta,
                            blob,
                            url: createPreviewUrl(meta.id, blob),
                        });
                    }
                }

                set((state) => ({
                    items: {
                        ...state.items,
                        [uuid]: {
                            uuid,
                            state: draft?.state ?? "",
                            text: draft?.text ?? "",
                            time: draft?.time ?? "",
                            images,
                            loaded: true,
                            saveStatus: "saved",
                        },
                    },
                }));
            } catch (error) {
                console.error("恢复本地草稿失败：", error);
                set((state) => ({
                    items: {
                        ...state.items,
                        [uuid]: {
                            ...state.items[uuid],
                            loaded: true,
                            saveStatus: "error",
                        },
                    },
                }));
            }
        },

        // ----------------------------------------------------
        // 改字段：state / text / time 任一子集都能传，合并进 item 后防抖落库
        // 非受控组件把 DOM 当前值同步进来（text 打字、time 变更）
        // 离散动作（切状态）也走这里，切一次即防抖一次
        // ----------------------------------------------------
        patchValue(uuid, patch) {
            if (!uuid) return;

            set((state) => {
                const current = state.items[uuid];
                if (!current) return state;

                return {
                    items: {
                        ...state.items,
                        [uuid]: { ...current, ...patch, saveStatus: "pending" },
                    },
                };
            });

            scheduleSave(uuid);
        },

        // ----------------------------------------------------
        // 新增图片（类型 / 大小校验在组件里做，这里直接收）
        // blob 先落库再进状态：保证"界面上看得到 = 本地一定存上了"
        // ----------------------------------------------------
        async addImage(uuid, file) {
            if (!uuid || !file) return;

            const record = toImageRecord(file);

            try {
                await putImage(record.id, record.blob);
            } catch (error) {
                console.error("图片写库失败：", error);
                set((state) => ({
                    items: {
                        ...state.items,
                        [uuid]: { ...state.items[uuid], saveStatus: "error" },
                    },
                }));
                return;
            }

            set((state) => {
                const current = state.items[uuid];
                if (!current) return state;

                return {
                    items: {
                        ...state.items,
                        [uuid]: {
                            ...current,
                            images: [
                                ...current.images,
                                { ...record, url: createPreviewUrl(record.id, record.blob) },
                            ],
                            saveStatus: "pending",
                        },
                    },
                };
            });

            scheduleSave(uuid);
        },

        // ----------------------------------------------------
        // 删除一张图片：状态、库、objectURL 三处一起清
        // ----------------------------------------------------
        async removeImage(uuid, imageId) {
            if (!uuid || !imageId) return;

            revokePreviewUrl(imageId);
            deleteImage(imageId).catch((error) => {
                console.warn("图片 Blob 删除失败：", error);
            });

            set((state) => {
                const current = state.items[uuid];
                if (!current) return state;

                return {
                    items: {
                        ...state.items,
                        [uuid]: {
                            ...current,
                            images: current.images.filter((img) => img.id !== imageId),
                            saveStatus: "pending",
                        },
                    },
                };
            });

            scheduleSave(uuid);
        },

        // ----------------------------------------------------
        // 重置本条草稿（文字 / 图片 / 时间 / 状态 全清，但保持 loaded 当空白新草稿）
        // ★ 注：本 store 的"清空"已改为组件里的状态快速切换，这里仅作彻底重置兜底用
        // ----------------------------------------------------
        async clearItem(uuid) {
            if (!uuid) return;

            if (saveTimers.has(uuid)) {
                clearTimeout(saveTimers.get(uuid));
                saveTimers.delete(uuid);
            }

            const item = get().items[uuid];
            if (item) {
                for (const img of item.images) {
                    revokePreviewUrl(img.id);
                    deleteImage(img.id).catch(() => {});
                }
            }

            try {
                await deleteDraft(uuid);
            } catch (error) {
                console.error("清空本地草稿失败：", error);
            }

            set((state) => ({
                items: {
                    ...state.items,
                    [uuid]: { uuid, ...EMPTY_VALUE, loaded: true, saveStatus: "saved" },
                },
            }));
        },

        // ----------------------------------------------------
        // 立即落库：卸载兜底 / 提交前 flush（唯一写库出口）
        // ----------------------------------------------------
        async flushItem(uuid) {
            const item = get().items[uuid];
            if (!uuid || !item) return;

            try {
                const previous = await getDraft(uuid);

                await putDraft({
                    uuid,
                    state: item.state ?? "",
                    text: item.text ?? "",
                    time: item.time ?? "",
                    // 只存元信息，Blob 单独在 images 库里
                    images: item.images.map(({ id, name, type, size }) => ({ id, name, type, size })),
                    createdAt: previous?.createdAt ?? Date.now(),
                    updatedAt: Date.now(),
                });

                set((state) => {
                    const current = state.items[uuid];
                    if (!current) return state;

                    return {
                        items: { ...state.items, [uuid]: { ...current, saveStatus: "saved" } },
                    };
                });
            } catch (error) {
                console.error("保存本地草稿失败：", error);
                set((state) => {
                    const current = state.items[uuid];
                    if (!current) return state;

                    return {
                        items: { ...state.items, [uuid]: { ...current, saveStatus: "error" } },
                    };
                });
            }
        },

        // ----------------------------------------------------
        // 整理数据：还原成可提交结构（blob 一并带出），先 flush 保证库是最新真相
        // ----------------------------------------------------
        async collect(uuids) {
            const targets = uuids ?? Object.keys(get().items);

            for (const uuid of targets) {
                if (get().items[uuid]) await get().flushItem(uuid);
            }

            const result = [];

            for (const uuid of targets) {
                const draft = await getDraft(uuid);
                if (!draft) continue;

                const images = [];
                for (const meta of draft.images ?? []) {
                    const blob = await getImage(meta.id);
                    if (blob) images.push({ ...meta, blob });
                }

                result.push({
                    uuid,
                    state: draft.state ?? "",
                    text: draft.text ?? "",
                    time: draft.time ?? "",
                    images,
                    createdAt: draft.createdAt,
                    updatedAt: draft.updatedAt,
                });
            }

            return result;
        },

        // ----------------------------------------------------
        // 提交：逐条交给 handler，成功一条清一条本地草稿，失败保留下次重试
        // ----------------------------------------------------
        async submitAll(handler, uuids) {
            const drafts = await get().collect(uuids);
            const results = [];

            for (const draft of drafts) {
                try {
                    await handler(draft);
                    await get().clearItem(draft.uuid);
                    results.push({ uuid: draft.uuid, ok: true });
                } catch (error) {
                    console.error(`草稿 ${draft.uuid} 提交失败：`, error);
                    results.push({ uuid: draft.uuid, ok: false, error });
                }
            }

            return results;
        },
    };
});

export default useCheckItemStore;
```

---

### 2. `MainCheckItem.jsx`（完成时间 + 状态快速切换，缓存 { time, state }）

```jsx
import { useEffect, useRef } from "react";
import { Clock } from "lucide-react";

// ★ 路径按你项目实际调整
import useCheckItemStore from "../../store/checkItem.cache.store";
import { STATUS_ICONS, STATUS_LABELS, nextStatus } from "./statusBadge";

/**
 * ============================================================
 * MainCheckItem —— 主监控检查卡片（非受控）
 * ------------------------------------------------------------
 * 当前只实现两件事（按需求）：
 *   1. 完成时间填写（type=time，非受控 + 本地缓存恢复）
 *   2. 状态快速切换（单击循环：待检查 → 正常 → 异常 → 不适用）
 * 缓存走 checkItem.cache.store，按 node.uuid 一条，value 用 { time, state }。
 *
 * props:
 *   node      主项数据 { uuid, eventId, name, desc, ... }
 *   index     序号（展示用）
 *   selected  是否当前选中（选中态高亮 + 驱动右侧辅助列）
 *   onSelect  (uuid) => void，整卡点击选中
 *   disabled  只读态
 * ============================================================
 */
export default function MainCheckItem({ node, index, selected, onSelect, disabled = false }) {
    const uuid = node.uuid;

    const timeRef = useRef(null);
    // 记录"已回填过哪个 uuid"：非受控只在草稿加载后回填一次，之后 DOM 自己管值
    const appliedUuidRef = useRef(null);

    // 只按 uuid 订阅自己那条，多个实例互不牵连重渲染
    const item = useCheckItemStore((s) => s.items[uuid]);
    const initItem = useCheckItemStore((s) => s.initItem);
    const patchValue = useCheckItemStore((s) => s.patchValue);
    const flushItem = useCheckItemStore((s) => s.flushItem);

    const state = item?.state ?? "";
    const time = item?.time ?? "";
    const loaded = item?.loaded ?? false;
    const saveStatus = item?.saveStatus ?? "saved";

    // 挂载 / 切 uuid：恢复本地草稿
    useEffect(() => {
        if (!uuid) return;
        appliedUuidRef.current = null;
        initItem(uuid);
    }, [uuid, initItem]);

    // 草稿加载完成后回填完成时间（每个 uuid 只回填一次）
    useEffect(() => {
        if (!loaded || !timeRef.current) return;
        if (appliedUuidRef.current === uuid) return;

        timeRef.current.value = time;
        appliedUuidRef.current = uuid;
    }, [loaded, uuid, time]);

    // 卸载兜底：把还没落库的内容立即写入
    useEffect(() => {
        return () => {
            if (uuid) flushItem(uuid);
        };
    }, [uuid, flushItem]);

    // 单击切换状态：离散动作，切完顺手立即落库（不等防抖）
    const toggleStatus = (e) => {
        e.stopPropagation(); // 别把点击冒泡成"选中"，避免误触发
        if (disabled) return;

        patchValue(uuid, { state: nextStatus(state) });
        flushItem(uuid);
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
        <div
            onClick={() => onSelect?.(uuid)}
            className={`cursor-pointer overflow-hidden rounded-md border bg-white transition-colors ${
                selected
                    ? "border-primary-400 ring-1 ring-primary-200"
                    : "border-slate-200 hover:border-slate-300"
            }`}
        >
            {/* ============ 标题行：序号 + 事件 + 名称 + 状态切换按钮 ============ */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                <span className="shrink-0 rounded bg-slate-200/70 px-1 text-[10px] font-semibold text-slate-500">
                    {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-slate-700">
                        {node.eventId} · {node.name}
                    </div>
                    {node.desc && (
                        <div className="truncate text-[10px] text-slate-400">{node.desc}</div>
                    )}
                </div>

                {/* ★ 状态快速切换（取代 MutilTypeInput 的"清空"按钮）：单击循环 4 态 */}
                <button
                    type="button"
                    disabled={disabled || !loaded}
                    onClick={toggleStatus}
                    title={`单击切换状态（当前：${STATUS_LABELS[state] ?? "待检查"}）`}
                    className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-slate-100 disabled:opacity-40"
                >
                    {STATUS_ICONS[state] ?? STATUS_ICONS[""]}
                    <span className="hidden sm:inline">{STATUS_LABELS[state] ?? "待检查"}</span>
                </button>
            </div>

            {/* ============ 完成时间（非受控） ============ */}
            <div className="flex items-center gap-2 px-2.5 py-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock size={12} />
                    完成时间
                </span>
                <input
                    ref={timeRef}
                    type="time"
                    defaultValue=""
                    disabled={disabled || !loaded}
                    onInput={(e) => {
                        if (!disabled && loaded) patchValue(uuid, { time: e.currentTarget.value });
                    }}
                    onBlur={(e) => {
                        // 失焦立即落库，不等防抖
                        if (!disabled && loaded) {
                            patchValue(uuid, { time: e.currentTarget.value });
                            flushItem(uuid);
                        }
                    }}
                    className="ml-auto rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600 outline-none focus:border-primary-300 disabled:bg-slate-50"
                />
                <span
                    className={`shrink-0 text-[10px] text-slate-300 ${
                        saveStatus === "error" ? "text-red-500" : ""
                    }`}
                >
                    {!loaded ? "读取中" : saveStatusText}
                </span>
            </div>
        </div>
    );
}
```

---

### 3. `AuxiliaryItem.jsx`（仿 MutilTypeInput：text + images + time + 状态快速切换）

```jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ClipboardPaste, Clock, ImagePlus, TriangleAlert, X } from "lucide-react";

// ★ 路径按你项目实际调整
import useCheckItemStore from "../../store/checkItem.cache.store";
import { STATUS_ICONS, STATUS_LABELS, nextStatus } from "./statusBadge";

const IMAGE_MAX_BYTES = 6 * 1024 * 1024; // 单图默认 6MB

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
 * ============================================================
 * AuxiliaryItem —— 辅助检查项（非受控，仿 MutilTypeInput）
 * ------------------------------------------------------------
 * 缓存 value = { state, text, time, images }：
 *   - text   textarea（可粘贴/拖拽/选图，图片进 images）
 *   - images 图片预览区（缩略图 × 删除，点缩略图放大）
 *   - time   完成时间
 *   - state  右上角"状态快速切换"按钮（取代 MutilTypeInput 的"清空"）
 * 按 node.uuid 一条，下次进来 initItem 自动恢复。
 *
 * props: node { uuid, eventId, name, desc }, disabled, multiple(默认多图)
 * ============================================================
 */
export default function AuxiliaryItem({
    node,
    disabled = false,
    multiple = true,
    maxImageBytes = IMAGE_MAX_BYTES,
    placeholder = "填写记录，也可直接 Ctrl + V 粘贴图片…",
}) {
    const uuid = node.uuid;

    const textareaRef = useRef(null);
    const timeRef = useRef(null);
    const fileRef = useRef(null);
    const appliedUuidRef = useRef(null);

    const [dragOver, setDragOver] = useState(false);
    const [warn, setWarn] = useState("");
    const [zoom, setZoom] = useState(null);

    const item = useCheckItemStore((s) => s.items[uuid]);
    const initItem = useCheckItemStore((s) => s.initItem);
    const patchValue = useCheckItemStore((s) => s.patchValue);
    const addImage = useCheckItemStore((s) => s.addImage);
    const removeImage = useCheckItemStore((s) => s.removeImage);
    const flushItem = useCheckItemStore((s) => s.flushItem);

    const text = useMemo(() => item?.text ?? "", [item?.text]);
    const images = useMemo(() => item?.images ?? [], [item?.images]);
    const state = item?.state ?? "";
    const time = item?.time ?? "";
    const loaded = item?.loaded ?? false;
    const saveStatus = item?.saveStatus ?? "saved";

    // 挂载 / 切 uuid
    useEffect(() => {
        if (!uuid) return;
        appliedUuidRef.current = null;
        initItem(uuid);
        setWarn("");
        setZoom(null);
    }, [uuid, initItem]);

    // 草稿加载完成后回填 text / time（每个 uuid 只回填一次）
    useEffect(() => {
        if (!loaded) return;
        if (appliedUuidRef.current === uuid) return;

        if (textareaRef.current) textareaRef.current.value = text;
        if (timeRef.current) timeRef.current.value = time;
        appliedUuidRef.current = uuid;
    }, [loaded, uuid, text, time]);

    // 卸载兜底
    useEffect(() => {
        return () => {
            if (uuid) flushItem(uuid);
        };
    }, [uuid, flushItem]);

    // Esc 关闭大图
    useEffect(() => {
        if (!zoom) return;
        const onKey = (e) => e.key === "Escape" && setZoom(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [zoom]);

    // 收图：粘贴 / 拖拽 / 选图三个来源归一
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
            if (!multiple && images.length > 0) removeImage(uuid, images[0].id);
            addImage(uuid, file);
        },
        [disabled, maxImageBytes, multiple, images, uuid, addImage, removeImage]
    );

    const handlePaste = (e) => {
        if (disabled) return;
        const files = imageFilesFromDataTransfer(e.clipboardData);
        if (!files.length) return;
        e.preventDefault();
        (multiple ? files : files.slice(0, 1)).forEach(acceptImage);
    };

    const handleDrop = (e) => {
        if (disabled) return;
        e.preventDefault();
        setDragOver(false);
        const files = imageFilesFromDataTransfer(e.dataTransfer);
        (multiple ? files : files.slice(0, 1)).forEach(acceptImage);
    };

    const toggleStatus = () => {
        if (disabled || !loaded) return;
        patchValue(uuid, { state: nextStatus(state) });
        flushItem(uuid);
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
        <div className="overflow-hidden rounded-md border bg-white">
            {/* ============ 标题行：事件 + 名称 + 状态快速切换（取代"清空"） ============ */}
            <div
                className={`flex items-center gap-2 border-b px-2.5 py-1.5 ${
                    dragOver && !disabled
                        ? "border-primary-300 bg-primary-50/60"
                        : "border-slate-100 bg-slate-50/60"
                }`}
            >
                <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-slate-700">
                        {node.eventId} · {node.name}
                    </div>
                    {node.desc && (
                        <div className="truncate text-[10px] text-slate-400">{node.desc}</div>
                    )}
                </div>

                <button
                    type="button"
                    disabled={disabled || !loaded}
                    onClick={toggleStatus}
                    title={`单击切换状态（当前：${STATUS_LABELS[state] ?? "待检查"}）`}
                    className="flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[11px] hover:bg-slate-100 disabled:opacity-40"
                >
                    {STATUS_ICONS[state] ?? STATUS_ICONS[""]}
                    <span className="hidden sm:inline">{STATUS_LABELS[state] ?? "待检查"}</span>
                </button>
            </div>

            <div
                className="transition-colors"
                onPaste={handlePaste}
                onDragOver={(e) => {
                    if (disabled) return;
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
                }}
                onDrop={handleDrop}
            >
                {/* ============ 文字输入（非受控） ============ */}
                <textarea
                    ref={textareaRef}
                    defaultValue=""
                    rows={3}
                    readOnly={disabled || !loaded}
                    placeholder={!loaded ? "正在恢复本地记录…" : dragOver ? "松开鼠标，把图片放到这里" : placeholder}
                    onInput={(e) => {
                        if (!disabled && loaded) patchValue(uuid, { text: e.currentTarget.value });
                    }}
                    onBlur={(e) => {
                        if (!disabled && loaded) {
                            patchValue(uuid, { text: e.currentTarget.value });
                            flushItem(uuid);
                        }
                    }}
                    className="block w-full resize-y border-0 bg-transparent px-2.5 py-2 text-[12px] leading-relaxed text-slate-600 outline-none placeholder:text-slate-400 disabled:text-slate-500"
                />

                {/* ============ 图片预览区 ============ */}
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
                                <div className="mt-0.5 truncate text-center text-[9px] text-slate-400" title={img.name}>
                                    {formatSize(img.size)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ============ 警告（常驻） ============ */}
                {warn && (
                    <div className="flex items-center gap-1 px-2.5 pb-1.5 text-[10px] text-amber-600">
                        <TriangleAlert size={11} />
                        {warn}
                    </div>
                )}

                {/* ============ 完成时间 ============ */}
                <div className="flex items-center gap-2 border-t border-slate-100 px-2.5 py-1.5">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock size={12} />
                        完成时间
                    </span>
                    <input
                        ref={timeRef}
                        type="time"
                        defaultValue=""
                        disabled={disabled || !loaded}
                        onInput={(e) => {
                            if (!disabled && loaded) patchValue(uuid, { time: e.currentTarget.value });
                        }}
                        onBlur={(e) => {
                            if (!disabled && loaded) {
                                patchValue(uuid, { time: e.currentTarget.value });
                                flushItem(uuid);
                            }
                        }}
                        className="rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-600 outline-none focus:border-primary-300 disabled:bg-slate-50"
                    />
                </div>

                {/* ============ 工具栏：添加图片 | 数量/保存状态 ============ */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-2.5 py-1.5">
                    <button
                        type="button"
                        disabled={disabled || !loaded}
                        onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-1 text-[11px] text-slate-400 transition-colors hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <ImagePlus size={13} />
                        {multiple ? "添加图片" : images.length ? "替换图片" : "添加图片"}
                    </button>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className={saveStatus === "error" ? "text-red-500" : undefined}>
                            {!loaded ? "读取中" : saveStatusText}
                        </span>
                    </div>
                </div>

                {/* 隐藏文件选择器 */}
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    className="hidden"
                    disabled={disabled || !loaded}
                    onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        (multiple ? files : files.slice(0, 1)).forEach(acceptImage);
                        e.target.value = "";
                    }}
                />
            </div>

            {/* ============ 大图预览浮层 ============ */}
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
```

---

### 4. `MainList.jsx`（把主项渲染成可点选卡片列表）

```jsx
import MainCheckItem from "./MainCheckItem";

/**
 * ============================================================
 * MainList —— 主监控列表
 * ------------------------------------------------------------
 * 只负责遍历 mains 渲染 MainCheckItem；选中态与"选中谁"由父级（Editor）
 * 通过 selectedMainUuid + onSelect 持有，Auxiliary 据此联动。
 *
 * props:
 *   mains            主项数组（schema 里 category==='main' 的节点）
 *   selectedMainUuid 当前选中的主项 uuid
 *   onSelect         (uuid) => void
 *   disabled         整列只读
 * ============================================================
 */
export default function MainList({ mains = [], selectedMainUuid, onSelect, disabled = false }) {
    if (!mains.length) {
        return <div className="p-2 text-xs text-gray-400">暂无主项</div>;
    }

    return (
        <div className="flex min-h-0 flex-col gap-2">
            {mains.map((item, index) => (
                <MainCheckItem
                    key={item.uuid}
                    node={item}
                    index={index}
                    selected={item.uuid === selectedMainUuid}
                    onSelect={onSelect}
                    disabled={disabled}
                />
            ))}
        </div>
    );
}
```

---

### 5. `Auxiliary.jsx`（据选中的 main 渲染其辅助项）

```jsx
import AuxiliaryItem from "./AuxiliaryItem";

/**
 * ============================================================
 * Auxiliary —— 辅助项列表
 * ------------------------------------------------------------
 * 入参是"当前选中的 main 对象"（不是 uuid），渲染它的 auxiliaries[]。
 * 主项未选中时给出占位；与 MainList 通过 Editor 持有的 selectedMain 联动。
 * ============================================================
 */
export default function Auxiliary({ main, disabled = false }) {
    if (!main) {
        return <div className="p-2 text-xs text-gray-400">请先选择一个主项</div>;
    }

    const list = main.auxiliaries ?? [];

    if (!list.length) {
        return (
            <div className="p-2 border rounded bg-gray-50 text-xs text-gray-400">
                {main.eventId} · {main.name} 暂无辅助项
            </div>
        );
    }

    return (
        <div className="flex min-h-0 flex-col gap-2">
            <div className="px-1 text-xs font-semibold text-slate-500">
                {main.eventId} · {main.name} 的辅助项
            </div>
            {list.map((aux) => (
                <AuxiliaryItem key={aux.uuid} node={aux} disabled={disabled} />
            ))}
        </div>
    );
}
```

---

### 6. 接入 `Editor.js`（一处必改：让 selectedMain 跟着选中 uuid 走）

你现在 `const selectedMain = main[0];` 是写死的，辅助列不会联动。改成按 uuid 找：

```jsx
function Editor({ main = cargoBypassFlight }) {
    const [selectedMainUuid, setSelectedMainUuid] = useState(null);

    // ★ 关键修复：据 uuid 找当前选中的 main 对象（而不是固定 main[0]）
    const schema = main.schema ?? main; // 你模板顶层是 main.schema
    const selectedMain = schema.find((m) => m.uuid === selectedMainUuid) ?? null;

    const mainColVisible  = useChecklistStore((s) => s.mainColVisible);
    const auxColVisible   = useChecklistStore((s) => s.auxColVisible);
    const videoColVisible = useChecklistStore((s) => s.videoColVisible);
    const templateType    = useChecklistStore((s) => s.templateType);

    const selectedVideo = templateType.includes("货运")
        ? CARGO_VIDEO_FOCUS
        : templateType.includes("顺航")
        ? SHUNHANG_VIDEO_FOCUS
        : PASSENGER_VIDEO_FOCUS;

    return (
        <ContentLayout>
            <ChecklistToolbar />
            <div className="flex min-h-0 flex-1 flex-row gap-2">
                <div className={`${mainColVisible ? "" : "hidden"} flex-1 overflow-y-auto`}>
                    <MainList
                        mains={schema}
                        selectedMainUuid={selectedMainUuid}
                        onSelect={setSelectedMainUuid}
                    />
                </div>
                <div className={`${auxColVisible ? "" : "hidden"} flex-1 overflow-y-auto`}>
                    <Auxiliary main={selectedMain} />
                </div>
                <div className={`${videoColVisible ? "" : "hidden"} flex-1 overflow-y-auto`}>
                    <VideoPanel groups={selectedVideo.groups} />
                </div>
            </div>
        </ContentLayout>
    );
}
```

---

**用前必改的 2 处**：① `MainCheckItem / AuxiliaryItem` 里 `checkItem.cache.store` 的 import 路径；② `checkItem.cache.store.js` 里 `./cache` 的路径（指向你现有 `cache.js`）。

**几点设计说明**：主项卡片本身可点选、但状态按钮做了 `stopPropagation`，切状态不会误触发选中；`patchValue` 支持只传 `{state}`/`{time}`/`{text}` 任一子集，主项天然只用得到 `state+time`，辅助项四个字段全用；缓存 key 用节点自带的 `uuid`（模板里稳定唯一），和你 `MutilTypeInput` 的用法一致，所以刷新/下次进来 `initItem` 会自动恢复。提交时直接 `useCheckItemStore.getState().collect(uuids)` 就能拿到 `{uuid, state, text, time, images:[{...blob}]}` 数组。