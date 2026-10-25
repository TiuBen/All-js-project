/**
 * ============================================================
 * cache.store.js —— 填写组件的数据中枢（zustand）【Comp 版】
 * ------------------------------------------------------------
 * ★ 本文件是 MutilTypeInput/cache.store.js 的 Comp 扩展版：
 *   原版不改动，这里在它基础上给草稿值加了 state（状态）和
 *   time（实际完成时间）两个字段，供 MainCheckItem /
 *   AuxiliaryItem 这类「带状态 + 时间」的卡片使用。
 *   完全向后兼容：旧草稿没有 state/time，读出来就是 ""。
 *   cache.js 未动，两层共用同一个 IndexedDB 库。
 *
 * 为什么组件不直接用 cache.js：
 *   - 组件只负责「交互」（打字、贴图、拖图、切状态、填时间），
 *     数据整理 / 落库 / 提交统一收在这里，组件和存储实现解耦
 *   - 页面上可能有多个实例，按 uuid 各占一条，互不覆盖
 *   - objectURL 的创建 / 回收只有这里清楚，组件不碰，防内存泄漏
 *
 * 数据形状（store 内 items，按 uuid 一条）：
 *   { uuid, note, state, time, images: [{id,name,type,size,blob,url}], loaded, saveStatus }
 *   - blob 原样保留（File 也是 Blob），落库不转 Base64
 *   - url 是预览 objectURL，只活在内存，绝不落库
 *
 * 对外能力：
 *   组件交互：initItem / setNote / setState / setTime /
 *             addImage / removeImage / clearItem
 *   生命周期：flushItem（强制落库，卸载兜底 / 提交前 flush）
 *   整理数据：collect（把草稿还原成可提交结构，blob 一并带出）
 *   提交：    submitAll（逐条交给 handler，成功一条清一条本地草稿）
 * ============================================================
 */
import { create } from "zustand";

import {
    getDraft,
    putDraft,
    deleteDraft,
    putImage,
    getImage,
    deleteImage,
} from "../MutilTypeInput/cache";

const SAVE_DELAY = 500; // 文字防抖落库间隔

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
        id: typeof crypto !== "undefined" && crypto.randomUUID
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

const useCacheStore = create((set, get) => {
    /** 内容变化后防抖落库；真正写库统一走 flushItem，避免两套写库逻辑 */
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
                            // 旧草稿没有 state / time，读出来就是空串
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
            if (!uuid) return;

            set((state) => {
                const current = state.items[uuid];
                if (!current) return state;

                return {
                    items: {
                        ...state.items,
                        [uuid]: { ...current, note, saveStatus: "pending" },
                    },
                };
            });

            scheduleSave(uuid);
        },

        // ----------------------------------------------------
        // 状态切换（待检查 / 正常 / 异常 / 不适用）：防抖落库
        // ----------------------------------------------------
        setState(uuid, state) {
            if (!uuid) return;

            set((s) => {
                const current = s.items[uuid];
                if (!current) return s;

                return {
                    items: {
                        ...s.items,
                        [uuid]: { ...current, state, saveStatus: "pending" },
                    },
                };
            });

            scheduleSave(uuid);
        },

        // ----------------------------------------------------
        // 实际完成时间变化：防抖落库
        // ----------------------------------------------------
        setTime(uuid, time) {
            if (!uuid) return;

            set((s) => {
                const current = s.items[uuid];
                if (!current) return s;

                return {
                    items: {
                        ...s.items,
                        [uuid]: { ...current, time, saveStatus: "pending" },
                    },
                };
            });

            scheduleSave(uuid);
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
        // 清空本条草稿（文字 + 状态 + 时间 + 全部图片 + 防抖定时器）
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

            set((state) => {
                const nextItems = { ...state.items };
                delete nextItems[uuid];

                return { items: nextItems };
            });
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

export default useCacheStore;
