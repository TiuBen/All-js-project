/**
 * ============================================================
 * cache.store.js —— MutilTypeInput 的数据中枢（zustand）
 * ------------------------------------------------------------
 * 为什么组件不直接用 cache.js：
 *   - 组件只负责「交互」（打字、贴图、拖图），数据整理 / 落库 /
 *     提交统一收在这里，组件和存储实现解耦
 *   - 页面上可能有多个 MutilTypeInput，按 key 各占一条，互不覆盖
 *   - objectURL 的创建 / 回收只有这里清楚，组件不碰，防内存泄漏
 *
 * ★ key（uuid 参数）不是节点自己的 uuid，而是 **填写项缓存键**
 *   `草稿键::节点uuid`（草稿键 = 航班::模板，见 utils/checklistCache.js）。
 *   本 store 只把它当**不透明字符串**用：同一个节点在不同航班 / 不同模板下
 *   是不同的 key，草稿之间天然隔离。
 *
 * 数据形状（store 内 items，按 key 一条）：
 *   { uuid(key), note, state, time, images: [{id,name,type,size,blob,url}], loaded, saveStatus }
 *   - note   文字（辅助项 / 视频项的 textarea）
 *   - state  状态（待检查 / 正常 / 异常 / 不适用；主监控项与辅助项用）
 *   - time   实际完成时间（datetime-local 的原始字符串）
 *   - blob 原样保留（File 也是 Blob），落库不转 Base64
 *   - url 是预览 objectURL，只活在内存，绝不落库
 *
 * 对外能力：
 *   组件交互：initItem / setNote / setState / setTime / addImage / removeImage / clearItem
 *   生命周期：flushItem（强制落库，卸载兜底 / 提交前 flush）
 *   整理数据：collect（把草稿还原成可提交结构，blob 一并带出）
 *             collectByPrefix / clearByPrefix / hasLocalData（按「一条草稿」批量处理）
 *   提交：    submitAll（逐条交给 handler，成功一条清一条本地草稿）
 * ============================================================
 */
import { create } from "zustand";

import { getDraft, putDraft, deleteDraft, putImage, getImage, deleteImage, getAllDrafts } from "../utils/cache";

const SAVE_DELAY = 500; // 文字防抖落库间隔

/**
 * 按 key 前缀捞出本地所有填写项的 key。
 * 一条草稿的正文 = 一堆 `草稿键::节点uuid`，前缀就是 `草稿键::`，
 * 所以「收集 / 清空一条草稿」只需要前缀，不需要知道模板里有哪些节点。
 * ★ 本地库读不到（隐私模式 / 被禁用 / 没有 IndexedDB）时当"没有本地内容"，
 *   不能让它把切模板 / 删草稿这些操作整个搞挂。
 */
async function keysWithPrefix(prefix) {
    if (!prefix) return [];

    try {
        const all = await getAllDrafts();

        return all.map((record) => record.uuid).filter((key) => key.startsWith(prefix));
    } catch (error) {
        console.warn("读取本地草稿正文失败（按没有本地内容处理）：", error);
        return [];
    }
}

// 预览 objectURL 按图片 id 存模块级 Map：
// 换图 / 删图 / 清空时精准回收；刷新页面后浏览器自动作废
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

const useMutilTypeInputStore = create((set, get) => {
    /** 文字变化后防抖落库；真正写库统一走 flushItem，避免两套写库逻辑 */
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

    /**
     * 改一条填写的若干字段：只动内存 + 排一次防抖落库（真正写库仍只走 flushItem）。
     * setNote / setState / setTime 三个动作只差一个字段，逻辑收在这里，别抄三份。
     */
    function patchItem(uuid, patch) {
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
    }

    return {
        items: {},

        // ----------------------------------------------------
        // 挂载时恢复本地草稿（store 里已加载过就直接复用，不重复读库）
        // ----------------------------------------------------
        async initItem(uuid) {
            if (!uuid) return;
            if (get().items[uuid]?.loaded) return;

            // 先占位，防止同一个 uuid 并发 init 两次都去读库
            set((state) => ({
                items: {
                    ...state.items,
                    [uuid]: state.items[uuid] ?? {
                        uuid,
                        note: "",
                        state: "",
                        time: "",
                        images: [],
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
                            note: draft?.note ?? "",
                            state: draft?.state ?? "",
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
        // 文字变化：非受控组件把 DOM 里的当前值同步进来，防抖落库
        // ----------------------------------------------------
        setNote(uuid, note) {
            patchItem(uuid, { note });
        },

        // ----------------------------------------------------
        // 状态切换（待检查 / 正常 / 异常 / 不适用）—— 主监控项与辅助项用
        // ----------------------------------------------------
        setState(uuid, state) {
            patchItem(uuid, { state });
        },

        // ----------------------------------------------------
        // 实际完成时间（input[type=datetime-local] 的原始字符串）
        // ----------------------------------------------------
        setTime(uuid, time) {
            patchItem(uuid, { time });
        },

        // ----------------------------------------------------
        // 预填一条记录（ChecklistViewer 打开已提交记录时用）：
        // 确保本地条目存在后，用后端记录里的值盖上去（state / time / note / images）。
        // ★ images 只带 url 元信息 —— 记录里的图片早已上传到后端，本地没有 blob；
        //   图片预览组件直接用 url 展示，修改提交时 collect 会带上 url 一并回传。
        // ★ 每次打开都重盖：后端记录是唯一事实来源（本地没保存的改动会被丢弃，
        //   想留就点「修改」提交）。
        // ----------------------------------------------------
        async prefill(uuid, values = {}) {
            if (!uuid) return;
            await get().initItem(uuid);
            const patch = {};
            if (values.state !== undefined) patch.state = values.state;
            if (values.time !== undefined) patch.time = values.time;
            if (values.note !== undefined) patch.note = values.note;
            if (values.images !== undefined) patch.images = values.images;
            patchItem(uuid, patch);
            get().flushItem(uuid); // 立即落库，不等防抖
        },

        // ----------------------------------------------------
        // 新增图片（类型 / 大小校验在组件里做，这里直接收）
        // blob 先落库再进状态：保证「界面上看得到 = 本地一定存上了」
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
                        [uuid]: {
                            ...state.items[uuid],
                            saveStatus: "error",
                        },
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
                            images: [...current.images, { ...record, url: createPreviewUrl(record.id, record.blob) }],
                            saveStatus: "pending",
                        },
                    },
                };
            });

            scheduleSave(uuid);
        },

        // ----------------------------------------------------
        // 删除一张图片：状态、库、objectURL 三处一起清，不留残留
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
        // 清空本条草稿（文字 + 全部图片 + 防抖定时器）
        // ----------------------------------------------------
        async clearItem(uuid) {
            if (!uuid) return;

            if (saveTimers.has(uuid)) {
                clearTimeout(saveTimers.get(uuid));
                saveTimers.delete(uuid);
            }

            const item = get().items[uuid];

            // 库里的东西删干净；store 里的条目也移除，下次挂载当新草稿
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

            // set((state) => {
            //     const nextItems = { ...state.items };
            //     delete nextItems[uuid];

            //     return { items: nextItems };
            // });
            set((state) => ({
                items: {
                    ...state.items,
                    [uuid]: {
                        uuid,
                        note: "",
                        state: "",
                        time: "",
                        images: [],
                        loaded: true, // ★ 保持 loaded
                        saveStatus: "saved",
                    },
                },
            }));
        },

        // ----------------------------------------------------
        // 立即落库：卸载兜底 / 提交前 flush 都走这里（唯一写库出口）
        // ----------------------------------------------------
        async flushItem(uuid) {
            const item = get().items[uuid];

            // 没挂载过的 uuid 不写库，避免空记录覆盖已有草稿
            if (!uuid || !item) return;

            try {
                const previous = await getDraft(uuid);

                await putDraft({
                    uuid,
                    note: item.note ?? "",
                    // 主监控项只有状态 + 时间，辅助 / 视频项另有文字与图片
                    state: item.state ?? "",
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
                        items: {
                            ...state.items,
                            [uuid]: { ...current, saveStatus: "saved" },
                        },
                    };
                });
            } catch (error) {
                console.error("保存本地草稿失败：", error);

                set((state) => {
                    const current = state.items[uuid];
                    if (!current) return state;

                    return {
                        items: {
                            ...state.items,
                            [uuid]: { ...current, saveStatus: "error" },
                        },
                    };
                });
            }
        },

        // ----------------------------------------------------
        // 整理数据：把草稿还原成可提交的结构（blob 一并带出）
        // 不传 uuids 就整理 store 里挂载过的全部；
        // 先 flush 保证 IndexedDB 是最新真相，再统一从库里读 ——
        // 这样连「组件没挂载过、但本地有历史草稿」的 uuid 也能整理出来
        // ----------------------------------------------------
        async collect(uuids) {
            const targets = uuids ?? Object.keys(get().items);

            for (const uuid of targets) {
                if (get().items[uuid]) {
                    await get().flushItem(uuid);
                }
            }

            const result = [];

            for (const uuid of targets) {
                const draft = await getDraft(uuid);
                if (!draft) continue;

                const images = [];

                for (const meta of draft.images ?? []) {
                    const blob = await getImage(meta.id);

                    if (blob) {
                        images.push({ ...meta, blob });
                    } else if (meta.url) {
                        // 已上传到后端的图片（查看页预填进来的）：没有本地 blob，
                        // 只带 url 元信息回传 —— 修改提交时后端认 url
                        images.push({ ...meta });
                    }
                }

                result.push({
                    uuid,
                    note: draft.note ?? "",
                    state: draft.state ?? "",
                    time: draft.time ?? "",
                    images,
                    createdAt: draft.createdAt,
                    updatedAt: draft.updatedAt,
                });
            }

            return result;
        },

        // ----------------------------------------------------
        // 按「一条草稿」批处理 —— 调用方只给前缀（= `草稿键::`），
        // 不用知道这个模板里有哪些节点：前缀扫一遍本地就知道动过哪些。
        // ----------------------------------------------------

        /** 这段前缀下有没有本地内容（切模板时用来判断"要不要问用户清不清"） */
        async hasLocalData(prefix) {
            return (await keysWithPrefix(prefix)).length > 0;
        },

        /** 清空一条草稿的全部填写内容（节点值 + 图片），返回清掉几条 */
        async clearByPrefix(prefix) {
            const keys = await keysWithPrefix(prefix);

            for (const key of keys) {
                await get().clearItem(key);
            }

            return keys.length;
        },

        /** 整理一条草稿的全部填写内容（提交时用，blob 一并带出） */
        async collectByPrefix(prefix) {
            return get().collect(await keysWithPrefix(prefix));
        },

        // ----------------------------------------------------
        // 提交：逐条交给 handler（handler 自己决定怎么发后端），
        // 成功一条清一条本地草稿；失败的那条保留，下次可重试
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

export default useMutilTypeInputStore;
