/**
 * ============================================================
 * checklistCache —— 检查单的**缓存键规则** + 草稿箱索引读写
 * ------------------------------------------------------------
 * 三层键（分隔符 `::`，任何一段里都不会出现它）：
 *   草稿键      `{航班uuid}::{模板标识}`            ← draftKeyOf
 *   填写项前缀  `{草稿键}::`                        ← nodeKeyPrefixOf
 *   填写项键    `{草稿键}::{节点uuid}`              ← nodeKeyOf
 * 反查节点 uuid 用 nodeUuidOf（取最后一个 `::` 之后的部分）。
 *
 * ★ 为什么填写项键必须带草稿前缀：节点 uuid 只在**模板内**唯一，同一个航班
 *   可以同时有 5 份不同模板的草稿 —— 只用节点 uuid 当键，切模板时两条草稿
 *   的同名节点会互相覆盖（看着就像"串数据"）。
 *
 * 两层存储，各司其职：
 *   localStorage `flight_dispatch_drafts` → 草稿箱**索引**（一条草稿一行摘要，列表/角标用）
 *   IndexedDB  utils/cache.js             → 草稿**正文**（按填写项键一条条存，能存 Blob/截图）
 *   ★ 为什么分开：localStorage 装不下图片，Blob 被 JSON.stringify 会静默变成 {}。
 *
 * 本文件只管「键怎么拼 + 索引怎么读写」（纯函数 / 纯 I-O，无 React、无 store）；
 *   「什么时候存（防抖 / 卸载兜底）」在 store/cache.store.js
 *   「有哪些草稿、新建/删除/切模板」在 store/checklistDraft.store.js
 *
 * ★ 读操作在不支持 localStorage 的环境（SSR / 隐私模式）兜成空 —— 本地缓存
 *   故障不能让页面卡死。
 * ★ 本次清理删掉的死代码（全仓库零引用）：旧 IndexedDB 草稿层 openDb / withStore /
 *   idbGetDraft / idbGetDraftsByFlight / idbPutDraft / idbDeleteDraft /
 *   idbDeleteDraftsByFlight（整库 flight_dispatch/checklist_drafts 那套方案，
 *   正文早已改走 utils/cache.js 的按项存储）。
 * ============================================================
 */

/** 草稿箱（localStorage）的键；容量上限 */
const DRAFTS_STORAGE_KEY = "flight_dispatch_drafts";

/**
 * 草稿箱容量上限（一个航班 × 一种模板 = 一条草稿）。
 * @usedBy Layout/MainPageLayout.jsx（侧栏角标「n/5」）
 *         pages/ChecklistPage/ChecklistToolbar/Components/DraftDropdown.jsx（草稿箱下拉）
 *         pages/ChecklistPage/DraftShowcase/Drafts.jsx（草稿展示页）
 *         store/checklistDraft.store.js（新建 / 切模板时的满额判断）
 */
export const MAX_DRAFTS = 5;

/** 键的分段符（草稿键 / 填写项键共用） */
const SEP = "::";

/**
 * 草稿键 = 航班键 + 检查单类型标识：`{flightKey}::{templateId}`。
 * 一个航班 × 一种检查单类型 = 一份草稿，两个维度都不可少：
 *   - 只用航班键：切换检查单类型会互相覆盖（同航班不同类型表结构完全不同）
 *   - 只用模板 id：多个航班的同类型草稿会撞成一份（拿到别的航班填的东西）
 * @usedBy pages/ChecklistPage/ChecklistToolbar/Components/TemplateChooseDropdown.jsx（切模板时算新旧草稿键）
 *         pages/ChecklistPage/ChecklistToolbar/EditorToolbar.jsx（提交时算草稿键）
 *         store/checklistDraft.store.js（建草稿 / 切模板）
 *         store/checklistEditorPage.store.js（setFlightUuid / setTemplateType 里算 draftKey）
 * @param {string} flightKey 航班键（航班 uuid）
 * @param {string} templateId 模板标识（= 检查单类型标识 = 英文 key，如 cargoBypassFlight）
 */
export const draftKeyOf = (flightKey, templateId) => `${flightKey || ""}${SEP}${templateId || ""}`;

/**
 * 一条草稿下所有「填写项缓存键」的公共前缀（按前缀收集 / 清空正文时用）。
 * @usedBy store/checklistDraft.store.js（dropDraftWithData / switchTemplate 清正文）
 * @param {string} draftKey 草稿键（draftKeyOf 的结果）
 */
export const nodeKeyPrefixOf = (draftKey) => `${draftKey}${SEP}`;

/**
 * 填写项的缓存键 = 草稿键 + 节点 uuid（给 cache.store 当 key 用）。
 * @usedBy pages/ChecklistPage/Editor/Components/{MainList,AuxiliaryList,VideoList}.jsx（三张填写卡片）
 *         pages/ChecklistPage/Viewer/Components/{ViewAuxiliaryList,ViewVideoList}.jsx（查看页修改态）
 *         store/checklistViewer.store.js（记录预填 / 收集）
 * @param {string} draftKey 草稿键（草稿用 draftKeyOf，查看页用 `record-<id>::`）
 * @param {string} nodeUuid 模板里那个节点的 uuid
 */
export const nodeKeyOf = (draftKey, nodeUuid) => `${nodeKeyPrefixOf(draftKey)}${nodeUuid}`;

/**
 * 从填写项缓存键里取回节点 uuid（提交时要按节点报给后端）。
 * @usedBy store/checklistDraft.store.js（submitDraft 组装 items）
 *         store/checklistViewer.store.js（save 组装 items）
 * @param {string} nodeKey 填写项缓存键
 */
export const nodeUuidOf = (nodeKey) => nodeKey.slice(nodeKey.lastIndexOf(SEP) + SEP.length);

/**
 * 读草稿箱索引列表（内容坏掉 / 无 localStorage 时当空列表）。
 * @usedBy store/checklistDraft.store.js（每次动作前 current() 现读，避免内存过期）
 * @returns {Array<Object>}
 */
export function readDrafts() {
    if (typeof window === "undefined") return [];
    try {
        const list = JSON.parse(window.localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]");
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

/**
 * 写草稿箱索引列表（容量截断由调用方负责：满了就不再收新草稿）。
 * @usedBy store/checklistDraft.store.js（commit：localStorage 是唯一真源，写完同步内存）
 * @param {Array<Object>} list
 */
export function writeDrafts(list) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
        console.warn("[checklistCache] 写入本地草稿箱失败：", err);
    }
}
