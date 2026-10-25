/**
 * ============================================================
 * checklistViewer.store —— 检查单**查看 / 修改页**的会话态
 * ------------------------------------------------------------
 * 路由：/checklists/:recordId（「填写记录」页的 查看 / 修改 都跳这里）
 *
 * 为什么要有这一份 store：
 *   顶部工具栏（ChecklistToolbar/ViewerToolbar）和页面正文（ChecklistViewer）
 *   都要知道「当前是哪条记录 / 在不在修改态 / 能不能改」，而工具栏是
 *   **零 props** 的（它只认路由），两边没法用 props 传 —— 所以这份状态必须
 *   落在 store 里，两边各自订阅。页面从「持有状态」退化成「只做展示」。
 *
 * 放什么 / 不放什么：
 *   放：record（后端记录本体）、loading / error、mode（view|edit）、
 *       saving、keyPrefix（这条记录在 cache.store 里的前缀）、locked（超过 24h）
 *   不放：模板静态数据（schema / 视频监管）—— 那是按 checklist_category
 *         查静态表的纯派生值，页面自己算，store 不掺和模板知识。
 *
 * ★ 三层键里的「前缀」在这里只是 `record-<id>::`，与草稿键（航班uuid::模板标识）
 *   是**两套前缀**：记录不参与草稿箱，同一套浏览器缓存但不能互相覆盖。
 *   键规则统一在 utils/checklistCache.js（nodeKeyOf / nodeUuidOf）。
 * ============================================================
 */
import { create } from "zustand";

import { checklistApi } from "../api/checklist";
import useMutilTypeInputStore from "./cache.store";
import { nodeKeyOf, nodeUuidOf } from "../utils/checklistCache";

/** 提交超过这个小时数就锁死，不能再修改（与后端 checklistService 的 EDIT_LOCK_HOURS 一致） */
export const EDIT_LOCK_HOURS = 24;

/**
 * 是否已过可修改期限
 * ★ 与后端双保险：后端超时回 409，前端先按创建时间拦一次，别让用户白改一通。
 * @param {Object|null} record 记录（要 created_at 是 timestamptz ISO 串）
 */
export const editLockedOf = (record) => {
    if (!record?.created_at) return false;
    return Date.now() - new Date(record.created_at).getTime() >= EDIT_LOCK_HOURS * 60 * 60 * 1000;
};

/** 这条记录在 cache.store 里的键前缀（记录维度的唯一身份） */
const keyPrefixOf = (record) => (record ? `record-${record.id}::` : "");

/**
 * 记录 items → cache.store 的预填值
 * ★ images 只带元信息：记录里的图早已在后端，本地没有 blob；
 *   预览直接吃 url，保存时 collect 会把 url 原样带回。
 */
const prefillValuesOf = (item) => ({
    state: item.state ?? "",
    time: item.time ?? "",
    note: item.text ?? "",
    images: (item.images || []).map((img, i) => ({
        id: `${item.node_uuid}-${i}`,
        name: img.name ?? "",
        type: img.type ?? "",
        size: img.size ?? 0,
        url: img.url,
    })),
});

/**
 * cache.store 里的一条填写值 → 后端 item
 * ★ node_uuid 才是模板里的节点身份（后端认它）；node_key 是本地缓存键，
 *   只用来排查「这条数据是从哪个本地键收上来的」。
 */
const apiItemOf = (value) => ({
    node_uuid: nodeUuidOf(value.uuid),
    node_key: value.uuid,
    state: value.state || "",
    time: value.time || "",
    text: value.note || "",
    images: (value.images || []).map(({ name, type, size, url }) => ({ name, type, size, url })),
});

// 连点两条记录时，慢的那个响应不能盖掉新的（只认最后一次 load）
let loadSeq = 0;

export const useChecklistViewerStore = create((set, get) => ({
    record: null,
    loading: true,
    error: null,
    saving: false,
    /** view = 纯展示（默认） / edit = 修改中 */
    mode: "view",
    /** 这条记录的缓存键前缀（编辑态用它预填 / 收集） */
    keyPrefix: "",
    /** 提交超过 24h：只能看，不能进修改态 */
    locked: false,

    /**
     * 拉一条记录。★ 每次 load 都把 mode 打回 view（换记录 = 退出修改态）。
     * @param {string|number} recordId 路由上的 :recordId
     */
    async load(recordId) {
        const seq = ++loadSeq;
        set({ loading: true, error: null, mode: "view" });

        try {
            const record = await checklistApi.get(recordId);
            if (seq !== loadSeq) return; // 已经有更新的 load 了，丢弃这次结果
            set({
                record,
                keyPrefix: keyPrefixOf(record),
                locked: editLockedOf(record),
            });
        } catch (err) {
            if (seq !== loadSeq) return;
            set({ record: null, keyPrefix: "", error: err.message });
        } finally {
            if (seq === loadSeq) set({ loading: false });
        }
    },

    /**
     * 进入修改态：把记录 items 预填进 cache.store（修改态用的是填写页那套
     * 自缓存卡片，只认 cache.store 的值）。已锁定 / 还没拉到记录时不动。
     */
    async enterEdit() {
        const { record, locked, keyPrefix } = get();
        if (!record || locked) return;

        const cache = useMutilTypeInputStore.getState();
        for (const item of record.items || []) {
            if (!item.node_uuid) continue;
            await cache.prefill(nodeKeyOf(keyPrefix, item.node_uuid), prefillValuesOf(item));
        }
        set({ mode: "edit" });
    },

    /** 取消修改：丢掉这条记录在本地缓存里的改动，回展示态（后端没动过） */
    async cancelEdit() {
        await useMutilTypeInputStore.getState().clearByPrefix(get().keyPrefix);
        set({ mode: "view" });
    },

    /**
     * 保存修改：collectByPrefix 收齐 → PUT 更新这条记录 → 清本地缓存 → 重新拉一次。
     * ★ 失败**抛**给调用方（工具栏弹提示），这里只负责 saving 复位；
     *   mode 也不动 —— 保存失败还留在修改态，用户的改动不丢。
     */
    async save() {
        const { record, keyPrefix } = get();
        if (!record) return null;

        set({ saving: true });
        try {
            const values = await useMutilTypeInputStore.getState().collectByPrefix(keyPrefix);
            await checklistApi.update(record.id, { items: values.map(apiItemOf) });
            await useMutilTypeInputStore.getState().clearByPrefix(keyPrefix);
            await get().load(record.id);
            return record;
        } finally {
            set({ saving: false });
        }
    },
}));
