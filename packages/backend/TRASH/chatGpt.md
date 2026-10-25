我会沿用你上传的 `cache.js` 和 `cache.store.js` 的设计习惯：组件负责交互，Zustand 负责数据和缓存协调，IndexedDB 负责持久化，图片以 Blob 保存而不是 Base64。 现有缓存层已经支持按 `uuid` 保存文字和图片，并且通过 `objectURL` 管理预览，因此可以复用它的思路，不必把缓存逻辑散落在每个组件里。

这次建议把功能拆成几个独立文件：

| 组件 / 模块                    | 职责                       |
| -------------------------- | ------------------------ |
| `MainList`                 | 展示主检查项列表，管理当前选中项         |
| `MainCheckItem`            | 单个主检查项：完成时间、五种状态         |
| `Auxiliary`                | 根据选中的主项展示对应辅助项           |
| `AuxiliaryItem`            | 单个辅助项：状态、文字、完成时间、图片      |
| `checklist.input.store.js` | 按辅助项 `uuid` 保存和恢复填写内容    |
| `checklist.input.cache.js` | IndexedDB 底层读写，包括图片 Blob |

这里有两个关键约定：

* 主项和辅助项都用稳定的 `uuid` 作为缓存键。切换选中项不会串数据，下次重新打开也能恢复。

* 辅助项的 `value` 统一为 `{ state, text, time, images }`。原先的“清空”按钮改为状态快捷切换；清除文字、时间和图片是另一项独立操作，避免误删填写内容。

## 1. `checklist.input.cache.js`：IndexedDB 底层缓存

单独建立新的数据库，避免改变你现有 `MutilTypeInput` 的数据结构。主项和辅助项都存入 `drafts`，图片 Blob 存入 `images`。

Writing

```
/**
 * checklist.input.cache.js
 *
 * 检查单填写缓存底层
 * - drafts：状态、文字、时间、图片元信息
 * - images：图片 Blob
 */
const DB_NAME = "checklist-input-cache";
const DB_VERSION = 1;

const DRAFTS = "drafts";
const IMAGES = "images";

let dbPromise = null;

function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(DRAFTS)) {
                db.createObjectStore(DRAFTS, { keyPath: "uuid" });
            }

            if (!db.objectStoreNames.contains(IMAGES)) {
                db.createObjectStore(IMAGES);
            }
        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => {
            dbPromise = null;
            reject(request.error);
        };

        request.onblocked = () => {
            dbPromise = null;
            reject(new Error("检查单缓存数据库升级被阻塞"));
        };
    });

    return dbPromise;
}

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function transactionToPromise(db, stores, action) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(stores, "readwrite");

        try {
            action(tx);
        } catch (error) {
            tx.abort();
            reject(error);
            return;
        }

        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

export async function getInputDraft(uuid) {
    const db = await openDB();

    return requestToPromise(
        db.transaction(DRAFTS, "readonly")
            .objectStore(DRAFTS)
            .get(uuid)
    );
}

export async function putInputDraft(record) {
    const db = await openDB();

    return transactionToPromise(db, [DRAFTS], (tx) => {
        tx.objectStore(DRAFTS).put(record);
    });
}

export async function deleteInputDraft(uuid) {
    const db = await openDB();

    return transactionToPromise(db, [DRAFTS], (tx) => {
        tx.objectStore(DRAFTS).delete(uuid);
    });
}

export async function getInputImage(id) {
    const db = await openDB();

    return requestToPromise(
        db.transaction(IMAGES, "readonly")
            .objectStore(IMAGES)
            .get(id)
    );
}

export async function putInputImage(id, blob) {
    const db = await openDB();

    return transactionToPromise(db, [IMAGES], (tx) => {
        tx.objectStore(IMAGES).put(blob, id);
    });
}

export async function deleteInputImage(id) {
    const db = await openDB();

    return transactionToPromise(db, [IMAGES], (tx) => {
        tx.objectStore(IMAGES).delete(id);
    });
}
```

## 2. `checklist.input.store.js`：填写数据中枢

主项和辅助项共用一个 Store，但通过各自的 `uuid` 隔离数据。组件不直接访问 IndexedDB。

Writing

```
/**
 * checklist.input.store.js
 *
 * 每条数据：
 * {
 *   uuid,
 *   state: "未填写" | "待检查" | "正常" | "异常" | "不适用",
 *   text,
 *   time,
 *   images: [{ id, name, type, size, blob, url }],
 *   loaded,
 *   saveStatus
 * }
 */
import { create } from "zustand";

import {
    getInputDraft,
    putInputDraft,
    deleteInputDraft,
    getInputImage,
    putInputImage,
    deleteInputImage,
} from "./checklist.input.cache";

export const CHECK_STATES = [
    "未填写",
    "待检查",
    "正常",
    "异常",
    "不适用",
];

const SAVE_DELAY = 500;

const previewUrls = new Map();
const saveTimers = new Map();
const initPromises = new Map();

function makeId() {
    return crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function createUrl(id, blob) {
    if (previewUrls.has(id)) return previewUrls.get(id);

    const url = URL.createObjectURL(blob);
    previewUrls.set(id, url);

    return url;
}

function revokeUrl(id) {
    const url = previewUrls.get(id);

    if (url) {
        URL.revokeObjectURL(url);
        previewUrls.delete(id);
    }
}

function emptyItem(uuid) {
    return {
        uuid,
        state: "未填写",
        text: "",
        time: "",
        images: [],
        loaded: false,
        saveStatus: "saved",
    };
}

const useChecklistInputStore = create((set, get) => {
    function scheduleSave(uuid) {
        clearTimeout(saveTimers.get(uuid));

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

        // 恢复单条数据；同一 uuid 的并发初始化只执行一次
        async initItem(uuid) {
            if (!uuid) return;

            if (get().items[uuid]?.loaded) return;
            if (initPromises.has(uuid)) return initPromises.get(uuid);

            set((s) => ({
                items: {
                    ...s.items,
                    [uuid]: s.items[uuid] ?? emptyItem(uuid),
                },
            }));

            const task = (async () => {
                try {
                    const draft = await getInputDraft(uuid);
                    const images = [];

                    for (const meta of draft?.images ?? []) {
                        const blob = await getInputImage(meta.id);

                        if (blob) {
                            images.push({
                                ...meta,
                                blob,
                                url: createUrl(meta.id, blob),
                            });
                        }
                    }

                    // 初始化期间若已有更新，避免用旧数据覆盖新数据
                    const current = get().items[uuid];

                    if (!current?.loaded) {
                        set((s) => ({
                            items: {
                                ...s.items,
                                [uuid]: {
                                    ...emptyItem(uuid),
                                    ...draft,
                                    uuid,
                                    state: CHECK_STATES.includes(draft?.state)
                                        ? draft.state
                                        : "未填写",
                                    text: draft?.text ?? "",
                                    time: draft?.time ?? "",
                                    images,
                                    loaded: true,
                                    saveStatus: "saved",
                                },
                            },
                        }));
                    }
                } catch (error) {
                    console.error("恢复检查单填写数据失败：", error);

                    set((s) => ({
                        items: {
                            ...s.items,
                            [uuid]: {
                                ...(s.items[uuid] ?? emptyItem(uuid)),
                                loaded: true,
                                saveStatus: "error",
                            },
                        },
                    }));
                } finally {
                    initPromises.delete(uuid);
                }
            })();

            initPromises.set(uuid, task);
            return task;
        },

        // 统一更新 value 字段
        setValue(uuid, patch) {
            if (!uuid) return;

            const current = get().items[uuid];

            if (!current) return;

            set((s) => ({
                items: {
                    ...s.items,
                    [uuid]: {
                        ...current,
                        ...patch,
                        saveStatus: "pending",
                    },
                },
            }));

            scheduleSave(uuid);
        },

        // 切换检查状态
        setState(uuid, state) {
            if (!CHECK_STATES.includes(state)) return;
            get().setValue(uuid, { state });
        },

        // 图片：每个项目最多一张
        async addImage(uuid, file) {
            if (!uuid || !file || !file.type.startsWith("image/")) return;

            await get().initItem(uuid);

            const current = get().items[uuid];
            if (!current) return;

            const record = {
                id: makeId(),
                name: file.name || "pasted-image.png",
                type: file.type || "image/png",
                size: file.size,
            };

            try {
                await putInputImage(record.id, file);
            } catch (error) {
                console.error("保存检查单图片失败：", error);
                return;
            }

            // 先保存新图，再移除旧图
            const oldImages = current.images;

            set((s) => ({
                items: {
                    ...s.items,
                    [uuid]: {
                        ...s.items[uuid],
                        images: [{
                            ...record,
                            blob: file,
                            url: createUrl(record.id, file),
                        }],
                        saveStatus: "pending",
                    },
                },
            }));

            for (const image of oldImages) {
                revokeUrl(image.id);
                deleteInputImage(image.id).catch(console.error);
            }

            scheduleSave(uuid);
        },

        async removeImage(uuid) {
            const current = get().items[uuid];
            if (!current) return;

            for (const image of current.images) {
                revokeUrl(image.id);
                await deleteInputImage(image.id).catch(console.error);
            }

            get().setValue(uuid, { images: [] });
        },

        // 清空文字、时间、图片；状态恢复为未填写
        async clearValue(uuid) {
            const current = get().items[uuid];
            if (!current) return;

            clearTimeout(saveTimers.get(uuid));
            saveTimers.delete(uuid);

            for (const image of current.images) {
                revokeUrl(image.id);
                await deleteInputImage(image.id).catch(console.error);
            }

            get().setValue(uuid, {
                state: "未填写",
                text: "",
                time: "",
                images: [],
            });

            await get().flushItem(uuid);
        },

        // 立即保存；组件卸载时也可以调用
        async flushItem(uuid) {
            const item = get().items[uuid];
            if (!uuid || !item || !item.loaded) return;

            try {
                await putInputDraft({
                    uuid,
                    state: item.state,
                    text: item.text,
                    time: item.time,
                    images: item.images.map(
                        ({ id, name, type, size }) => ({
                            id, name, type, size,
                        })
                    ),
                    updatedAt: Date.now(),
                });

                set((s) => ({
                    items: {
                        ...s.items,
                        [uuid]: s.items[uuid]
                            ? { ...s.items[uuid], saveStatus: "saved" }
                            : s.items[uuid],
                    },
                }));
            } catch (error) {
                console.error("保存检查单填写数据失败：", error);

                set((s) => ({
                    items: {
                        ...s.items,
                        [uuid]: s.items[uuid]
                            ? { ...s.items[uuid], saveStatus: "error" }
                            : s.items[uuid],
                    },
                }));
            }
        },

        // 供提交前使用
        async flushAll() {
            for (const uuid of Object.keys(get().items)) {
                clearTimeout(saveTimers.get(uuid));
                saveTimers.delete(uuid);
                await get().flushItem(uuid);
            }
        },

        // 清除本条持久化缓存
        async deleteItem(uuid) {
            clearTimeout(saveTimers.get(uuid));
            saveTimers.delete(uuid);

            const item = get().items[uuid];

            for (const image of item?.images ?? []) {
                revokeUrl(image.id);
                await deleteInputImage(image.id).catch(console.error);
            }

            await deleteInputDraft(uuid);

            set((s) => {
                const items = { ...s.items };
                delete items[uuid];
                return { items };
            });
        },
    };
});

export default useChecklistInputStore;
```

## 3. `MainCheckItem.jsx`：主检查项

主项只提供完成时间和五种状态切换。点击卡片本身负责选中，不会因为修改状态而切换当前主项。

Writing

```
import { useEffect } from "react";
import { Check, Clock3, ChevronRight } from "lucide-react";

import useChecklistInputStore, {
    CHECK_STATES,
} from "../../../../../../store/checklist.input.store";

const STATE_COLORS = {
    未填写: "bg-slate-100 text-slate-600",
    待检查: "bg-amber-100 text-amber-700",
    正常: "bg-emerald-100 text-emerald-700",
    异常: "bg-red-100 text-red-700",
    不适用: "bg-gray-200 text-gray-600",
};

export default function MainCheckItem({
    item,
    selected = false,
    onSelect,
}) {
    const uuid = item.uuid;

    const value = useChecklistInputStore(
        (s) => s.items[uuid]
    );

    const initItem = useChecklistInputStore(
        (s) => s.initItem
    );

    const setValue = useChecklistInputStore(
        (s) => s.setValue
    );

    const setState = useChecklistInputStore(
        (s) => s.setState
    );

    useEffect(() => {
        initItem(uuid);
    }, [uuid, initItem]);

    const state = value?.state ?? "未填写";

    const cycleState = (event) => {
        event.stopPropagation();

        const index = CHECK_STATES.indexOf(state);
        const next = CHECK_STATES[(index + 1) % CHECK_STATES.length];

        setState(uuid, next);
    };

    return (
        <div
            onClick={() => onSelect?.(uuid)}
            className={`cursor-pointer rounded-md border p-3 transition-colors ${
                selected
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
        >
            <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800">
                        {item.name}
                    </div>

                    {item.desc && (
                        <div className="mt-1 text-xs text-slate-500">
                            {item.desc}
                        </div>
                    )}
                </div>

                <ChevronRight
                    size={16}
                    className={`shrink-0 text-slate-400 ${
                        selected ? "text-blue-600" : ""
                    }`}
                />
            </div>

            <div className="mt-3 flex items-center gap-2">
                <button
                    type="button"
                    onClick={cycleState}
                    className={`rounded px-2 py-1 text-xs font-medium ${
                        STATE_COLORS[state]
                    }`}
                    title="点击切换状态"
                >
                    {state}
                </button>

                <span className="text-xs text-slate-400">
                    点击状态可切换
                </span>
            </div>

            <label className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Clock3 size={14} />

                <span>完成时间</span>

                <input
                    type="datetime-local"
                    value={value?.time ?? ""}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) =>
                        setValue(uuid, { time: event.target.value })
                    }
                    className="min-w-0 flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
                />
            </label>

            {selected && (
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                    <Check size={12} />
                    当前选中
                </div>
            )}
        </div>
    );
}
```

## 4. `MainList.jsx`：主检查项列表

只负责遍历和选中，主项本身的编辑交给 `MainCheckItem`。

Writing

```
import MainCheckItem from "./MainCheckItem";

export default function MainList({
    mains = [],
    selectedMainUuid,
    onSelect,
}) {
    if (!mains.length) {
        return (
            <div className="py-8 text-center text-sm text-slate-400">
                暂无主检查项
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <h3 className="mb-1 font-bold">主检查项</h3>

            {mains.map((item) => (
                <MainCheckItem
                    key={item.uuid}
                    item={item}
                    selected={selectedMainUuid === item.uuid}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
```

## 5. `AuxiliaryItem.jsx`：辅助项编辑组件

辅助项包含：

* `state`：五种状态，点击状态按钮循环切换。

* `text`：文字输入，自动缓存。

* `time`：完成时间，自动缓存。

* `images`：最多一张图片，支持粘贴、拖入、选择文件、预览和删除。

图片处理直接调用 Store，不在组件中实现 IndexedDB 逻辑。

Writing

```
import { useEffect, useRef } from "react";
import {
    Check,
    Clock3,
    ImagePlus,
    Trash2,
    RefreshCw,
} from "lucide-react";

import useChecklistInputStore, {
    CHECK_STATES,
} from "../../../../../../store/checklist.input.store";

const STATE_COLORS = {
    未填写: "bg-slate-100 text-slate-600",
    待检查: "bg-amber-100 text-amber-700",
    正常: "bg-emerald-100 text-emerald-700",
    异常: "bg-red-100 text-red-700",
    不适用: "bg-gray-200 text-gray-600",
};

export default function AuxiliaryItem({ item }) {
    const uuid = item.uuid;
    const fileRef = useRef(null);

    const value = useChecklistInputStore(
        (s) => s.items[uuid]
    );

    const initItem = useChecklistInputStore(
        (s) => s.initItem
    );

    const setValue = useChecklistInputStore(
        (s) => s.setValue
    );

    const setState = useChecklistInputStore(
        (s) => s.setState
    );

    const addImage = useChecklistInputStore(
        (s) => s.addImage
    );

    const removeImage = useChecklistInputStore(
        (s) => s.removeImage
    );

    const clearValue = useChecklistInputStore(
        (s) => s.clearValue
    );

    useEffect(() => {
        initItem(uuid);
    }, [uuid, initItem]);

    const state = value?.state ?? "未填写";
    const image = value?.images?.[0];

    const cycleState = () => {
        const index = CHECK_STATES.indexOf(state);
        const next = CHECK_STATES[(index + 1) % CHECK_STATES.length];

        setState(uuid, next);
    };

    const handleFile = (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("请选择图片文件");
            return;
        }

        addImage(uuid, file);
    };

    // 支持鼠标右键菜单中的粘贴图片
    const handlePaste = (event) => {
        const files = Array.from(event.clipboardData?.items ?? [])
            .filter((item) => item.type.startsWith("image/"))
            .map((item) => item.getAsFile())
            .filter(Boolean);

        if (files.length) {
            event.preventDefault();
            handleFile(files[0]);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();

        const file = Array.from(event.dataTransfer.files).find(
            (f) => f.type.startsWith("image/")
        );

        handleFile(file);
    };

    return (
        <div
            className="rounded-md border border-slate-200 bg-white p-3"
            onPaste={handlePaste}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-800">
                        {item.name}
                    </div>

                    {item.desc && (
                        <div className="mt-1 text-xs text-slate-500">
                            {item.desc}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={cycleState}
                    className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${
                        STATE_COLORS[state]
                    }`}
                    title="快速切换检查状态"
                >
                    <span className="inline-flex items-center gap-1">
                        <RefreshCw size={12} />
                        {state}
                    </span>
                </button>
            </div>

            {/* 文字填写 */}
            <textarea
                value={value?.text ?? ""}
                onChange={(event) =>
                    setValue(uuid, { text: event.target.value })
                }
                placeholder="填写辅助项内容……"
                rows={3}
                className="mt-3 w-full resize-y rounded-md border border-slate-200 p-2 text-sm outline-none focus:border-blue-400"
            />

            {/* 完成时间 */}
            <label className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Clock3 size={14} />
                <span>完成时间</span>

                <input
                    type="datetime-local"
                    value={value?.time ?? ""}
                    onChange={(event) =>
                        setValue(uuid, { time: event.target.value })
                    }
                    className="min-w-0 flex-1 rounded border border-slate-200 px-2 py-1 text-xs text-slate-700"
                />
            </label>

            {/* 图片区域 */}
            <div className="mt-3">
                {image ? (
                    <div className="flex items-start gap-3">
                        <img
                            src={image.url}
                            alt={image.name}
                            className="h-24 w-24 rounded border border-slate-200 object-contain"
                        />

                        <div className="min-w-0 flex-1">
                            <div className="break-all text-xs text-slate-500">
                                {image.name}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeImage(uuid)}
                                className="mt-2 inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                            >
                                <Trash2 size={13} />
                                删除图片
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-4 text-xs text-slate-500 hover:border-blue-400 hover:bg-blue-50"
                    >
                        <ImagePlus size={16} />
                        添加图片 / 粘贴图片 / 拖入图片
                    </button>
                )}

                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                        handleFile(event.target.files?.[0]);
                        event.target.value = "";
                    }}
                />
            </div>

            {/* 清空填写内容，与状态切换分开 */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-xs text-slate-400">
                    {value?.saveStatus === "pending"
                        ? "保存中…"
                        : value?.saveStatus === "error"
                        ? "保存失败"
                        : "已保存到本地"}
                </span>

                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm("确定清空该辅助项的文字、时间和图片？")) {
                            clearValue(uuid);
                        }
                    }}
                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                    <Trash2 size={13} />
                    清空填写
                </button>
            </div>
        </div>
    );
}
```

## 6. `Auxiliary.jsx`：根据选中的主项展示辅助列表

沿用你原先的 `Auxiliary main={selectedMain}` 调用方式。每个辅助项独立渲染、独立订阅 Store。

Writing

```
import AuxiliaryItem from "./AuxiliaryItem";

export default function Auxiliary({ main }) {
    if (!main) {
        return (
            <div className="py-8 text-center text-sm text-slate-400">
                请先选择一个主检查项
            </div>
        );
    }

    const auxiliaries = main.auxiliaries ?? [];

    return (
        <div className="flex flex-col gap-3">
            <div className="border-b border-slate-200 pb-2">
                <h3 className="font-bold">辅助项</h3>

                <div className="mt-1 text-xs text-slate-500">
                    {main.name}
                </div>
            </div>

            {auxiliaries.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-400">
                    该主检查项没有辅助项
                </div>
            ) : (
                auxiliaries.map((item) => (
                    <AuxiliaryItem
                        key={item.uuid}
                        item={item}
                    />
                ))
            )}
        </div>
    );
}
```

## 7. 在 `Editor.jsx` 中使用

你原来的结构基本不用变，`MainList` 和 `Auxiliary` 可以直接接上：

Writing

```
import { useState } from "react";

import { useChecklistStore } from "../../../../../../store/checklist.editor.store";

import MainList from "./MainList";
import Auxiliary from "./Auxiliary";

export default function Editor({ main = MAIN, video = VIDEO }) {
    const [selectedMainUuid, setSelectedMainUuid] = useState(null);

    const mainColVisible = useChecklistStore(
        (s) => s.mainColVisible
    );

    const auxColVisible = useChecklistStore(
        (s) => s.auxColVisible
    );

    const videoColVisible = useChecklistStore(
        (s) => s.videoColVisible
    );

    const templateType = useChecklistStore(
        (s) => s.templateType
    );

    const selectedMain =
        main.find((item) => item.uuid === selectedMainUuid) ?? null;

    const selectedVideo = String(templateType ?? "").includes("货运")
        ? CARGO_VIDEO_FOCUS
        : String(templateType ?? "").includes("顺航")
        ? SHUNHANG_VIDEO_FOCUS
        : PASSENGER_VIDEO_FOCUS;

    return (
        <ContentLayout>
            <ChecklistToolbar />

            <div className="flex flex-1 flex-row gap-2">
                <div
                    className={`${
                        !mainColVisible ? "hidden" : ""
                    } min-w-0 flex-1 rounded-md border-2 border-gray-300 p-2`}
                >
                    <MainList
                        mains={main}
                        selectedMainUuid={selectedMainUuid}
                        onSelect={setSelectedMainUuid}
                    />
                </div>

                <div
                    className={`${
                        !auxColVisible ? "hidden" : ""
                    } min-w-0 flex-1 rounded-md border-2 border-gray-300 p-2`}
                >
                    <Auxiliary main={selectedMain} />
                </div>

                <div
                    className={`${
                        !videoColVisible ? "hidden" : ""
                    } min-w-0 flex-1 rounded-md border-2 border-gray-300 p-2`}
                >
                    {JSON.stringify(selectedVideo)}
                </div>
            </div>
        </ContentLayout>
    );
}
```

## 8. 两个需要注意的细节

第一，加载完成前不要允许编辑。

因为 IndexedDB 是异步读取的，如果页面刚打开就允许输入，历史数据可能覆盖刚输入的内容。建议在 `MainCheckItem` 和 `AuxiliaryItem` 中，`initItem` 尚未完成时显示加载状态：

JavaScript

```
if (!value?.loaded) {
    return (
        <div className="rounded-md border p-3 text-sm text-slate-400">
            正在恢复填写内容…
        </div>
    );
}
```

放在两个组件的 `useEffect` 之后、正式的 `return` 之前。

第二，状态快捷切换的顺序。

当前循环顺序是：

`未填写 → 待检查 → 正常 → 异常 → 不适用 → 未填写`

主项和辅助项的状态、完成时间均按自己的 `uuid` 缓存，辅助项文字和图片也相互独立。

另外，当前示例将主项、辅助项填写数据分别保存在新数据库中。若未来切换了检查单模板或航班，要不要复用历史填写内容，应由缓存键策略决定：如果不同航班之间不应共享填写数据，建议把航班 ID、模板 ID 与节点 UUID 一起组成缓存键，而不是仅使用节点 UUID。这样才能避免不同航班间的数据串用。
