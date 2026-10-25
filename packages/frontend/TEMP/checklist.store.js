/**
 * ============================================================
 * checklist.store —— 检查单页的全部状态（填写层 + 会话层）
 * ------------------------------------------------------------
 * 一、填写层（上半部分 · 内存草案 · 非受控）
 *     模板只管"检查什么"；每一项**填了什么不进任何 store** —— 组件非受控
 *     （DOM 持值，defaultValue 只管首挂），值写进模块内的 memory，
 *     谁要响应式谁用 useMainItem / useAuxItem / useVideoCheckItem 逐项订阅。
 *     落盘：防抖 800ms 写 IndexedDB 正文 + localStorage 草稿箱索引；
 *     截图 Blob 只进 IndexedDB 与提交时上传，绝不进 localStorage。
 *     ⚠️ 存储本身的读写（IndexedDB / localStorage）在 utils/checklistCache.js。
 *
 * 二、模块级资产：检查单类型配色 + 模板表
 *     类型名 = 模板 id = 下拉 label = 落库 checklist_category，四处同一个键。
 *
 * 三、会话层（useChecklistStore）
 *     工具栏（航班信息 / 当前模板 / 列显隐 / 流程图 / 小地图）、选中节点、
 *     后端交互（记录元数据 / 保存状态 / 新建·更新·删除）。
 * ============================================================
 */
import { create } from "zustand";
import { useCallback, useSyncExternalStore } from "react";
import { checklistApi } from "../api";
import { imageMeta } from "../utils/checkImage";
import {
    MAX_DRAFTS,
    draftKeyOf,
    idbDeleteDraft,
    idbDeleteDraftsByFlight,
    idbGetDraft,
    idbGetDraftsByFlight,
    idbPutDraft,
} from "../utils/checklistCache";
import { useDraftStore } from "./draftStore";
import { useRecordsStore } from "./recordsStore";
import { useFipsStore, fetchFlightRows } from "./fips.store";
// 模板静态数据（编译期打包，零网络）：查表即可，不再有聚合入口文件
import passengerInitFlight from "../pages/ChecklistPage/ChecklistEditor/Template/EditorTemplateJson/passengerInitFlight";
import passengerBypassFlight from "../pages/ChecklistPage/ChecklistEditor/Template/EditorTemplateJson/passengerBypassFlight";
import cargoInitFlight from "../pages/ChecklistPage/ChecklistEditor/Template/EditorTemplateJson/cargoInitFlight";
import cargoBypassFlight from "../pages/ChecklistPage/ChecklistEditor/Template/EditorTemplateJson/cargoBypassFlight";
// 顺航：后端无节点保障 JSON，手工维护的占位模板（schema 为空），不进生成脚本
import shunhangFlight from "../pages/ChecklistPage/ChecklistEditor/Template/EditorTemplateJson/shunhangFlight";

/* ============================================================
 * 一、填写层（内存草案）
 * ============================================================ */

/** 内存草案（本模块唯一的事实来源；引用稳定，改一个字段换一个新对象） */
const memory = {
    flightId: null, // 归属**航班键**（= 航班 uuid；openDraft 时写入）
    flightNo: "",
    templateId: null, // 检查单类型；与 flightId 合成草稿键（见 draftKeyOf）
    items: {}, // { 'main-{节点uuid}' | 'aux-{辅助项uuid}': { status, time, note, image } }
    videoItems: {}, // { '{视频项uuid}': { status, note, image } }
    inspector: "",
};

/* ---------- 响应式：version + listeners（useSyncExternalStore 的数据源） ---------- */

let version = 0;
const listeners = new Set();
function notify() {
    version += 1;
    listeners.forEach((l) => l());
}

const subscribeDraft = (l) => {
    listeners.add(l);
    return () => listeners.delete(l);
};

/** 整份草案（提交组 payload / 公式引擎 / 流程图 statusMap 用；引用稳定） */
export const getSnapshot = () => memory;

/** 草案版本号（任何填写改动 +1）—— 需要"整份 items"的场景订阅它 */
export const useDraftVersion = () => useSyncExternalStore(subscribeDraft, () => version);

/**
 * 订阅单项填写数据（key = 'main-{节点uuid}' / 'aux-{辅助项uuid}'，视频项传 videoItems 那张表）
 * getSnapshot 只返回自己那一项的引用 → 其他项被改动时引用不变，本组件不重渲染。
 */
const useDraftValue = (key, map) =>
    useSyncExternalStore(
        subscribeDraft,
        () => map[key] || null,
        () => map[key] || null
    );

export const useDraftItem = (key) => useDraftValue(key, memory.items);
/** 订阅单个主监控节点（key = `main-{节点uuid}`） */
export const useMainItem = (uuid) => useDraftItem(`main-${uuid}`);
/** 订阅单个辅助监控项（key = `aux-{辅助项uuid}`） */
export const useAuxItem = (key) => useDraftItem(key);
/** 订阅单项视频监管数据（key = 视频项 uuid） */
export const useVideoCheckItem = (uuid) => useDraftValue(uuid, memory.videoItems);

/**
 * 取单项视频项的写入器：(field, value) => void
 * 把通用 setVideoItemField 绑定 uuid 后返回；useCallback 保证引用稳定（memo 生效的前提）。
 */
export const useVideoCheckSetter = (uuid) => {
    return useCallback((field, value) => setVideoItemField(uuid, field, value), [uuid]);
};

/* ---------- 草稿保存状态（工具栏 DraftStatus 展示；引用稳定） ---------- */

let statusSnap = { draftPending: false, draftSavedAt: null };

const setStatus = (pending, savedAt) => {
    statusSnap = { draftPending: pending, draftSavedAt: savedAt ?? statusSnap.draftSavedAt };
};

export const useDraftStatus = () => useSyncExternalStore(subscribeDraft, () => statusSnap);

/* ---------- 落盘（防抖合并写入） ---------- */

const PERSIST_DEBOUNCE_MS = 800;
let persistTimer = null;
let lastSig = null; // 上次落盘的内容签名（一致就跳过整次写入）
let persistEnabled = true; // 已提交 / 锁定 → setPersistEnabled(false)，不再产生草稿

/** 当前草稿键；航班键或类型缺一 → 空串（调用方据此短路：不落盘、不通知） */
const currentKey = () => (memory.flightId && memory.templateId ? draftKeyOf(memory.flightId, memory.templateId) : "");

/**
 * 内容值得落盘吗：至少一项填了 status / time / note / image
 * （避免"打开页面就产生一份空草稿"）
 * ⚠️ videoItems 必须一起看：只填视频监管项（尤其只贴了一张截图）时，
 *    若只看 items，草稿永远不落盘 —— 刷新即丢。
 */
function hasContent() {
    const filled = (v) => !!v && (v.status || v.time || v.note || v.image);
    return Object.values(memory.items).some(filled) || Object.values(memory.videoItems).some(filled);
}

/**
 * 内容签名（判断"内容有没有变化"，一致则跳过写入，省一次 IDB 事务 + 列表刷新）
 * ⚠️ 必须把 blob 摘掉再序列化：Blob 会被 JSON 静默变成 {}，
 *    留着 id/type/size/url 足以代表"这张图换了没有"，也不会去序列化二进制。
 */
const contentSig = () =>
    JSON.stringify([memory.items, memory.videoItems, memory.inspector], (key, value) =>
        key === "blob" ? undefined : value
    );

/** 剥掉一项里的图片二进制（localStorage 装不下 Blob，也不该装） */
const stripImage = (v) => (v?.image ? { ...v, image: imageMeta(v.image) } : v);

/**
 * 草稿箱（localStorage）用副本：二进制换成元信息
 * ⚠️ items（主 / 辅助项）与 videoItems 都要剥 —— 辅助项的截图也存在 items 里，
 *    漏一处就会让 JSON.stringify 把 Blob 静默变成 {}（草稿箱里"有图但打不开"）
 */
const stripImages = (map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [k, stripImage(v)]));
const boxSnapshot = () => ({
    items: stripImages(memory.items),
    videoItems: stripImages(memory.videoItems),
    inspector: memory.inspector,
});

/** 落盘收尾：清 pending + 通知（persistNow 的每条 return 路径都汇到这里） */
function done(savedAt) {
    setStatus(false, savedAt);
    notify();
}

function persistNow() {
    persistTimer = null;
    const key = currentKey();
    if (!key || !persistEnabled || !hasContent()) return done();

    // 草稿箱已满（5 份）且当前这份不在箱内 → 不再写，避免静默挤掉最早的那份
    const box = useDraftStore.getState().drafts;
    if (box.length >= MAX_DRAFTS && !box.some((d) => d.key === key)) return done();

    const sig = contentSig();
    if (sig === lastSig) return done();
    lastSig = sig;

    // IndexedDB 存正文（**原样带 Blob**，结构化克隆天然支持），它才是权威存储
    const record = {
        key, // 主键：航班键::类型（同航班不同类型各留一份）
        flightId: memory.flightId, // 草稿箱跳转 / 按航班清理用
        flightNo: memory.flightNo,
        templateId: memory.templateId,
        items: memory.items,
        videoItems: memory.videoItems,
        inspector: memory.inspector,
        status: "draft",
        updatedAt: new Date().toISOString(),
    };
    // localStorage 草稿箱只作为"最近草稿列表"的索引（只存图片元信息）
    idbPutDraft(record).catch((err) => console.warn("[checklist] 写入 IndexedDB 失败：", err));
    useDraftStore.getState().upsertDraft({ ...record, ...boxSnapshot() });
    done(record.updatedAt);
}

function schedulePersist() {
    if (!currentKey() || !persistEnabled) return;
    if (!statusSnap.draftPending) {
        setStatus(true);
        notify();
    }
    clearTimeout(persistTimer);
    persistTimer = setTimeout(persistNow, PERSIST_DEBOUNCE_MS);
}

/** 立即落盘（切换检查单类型 / 页面隐藏 / 卸载兜底），不改变写入规则 */
export function flushDraft() {
    clearTimeout(persistTimer);
    persistTimer = null;
    persistNow();
}

/** 已提交 / 锁定 → 关闭草稿写入 */
export function setPersistEnabled(v) {
    persistEnabled = !!v;
}

/** 重置"上次落盘签名"（提交成功后调用：重新编辑时首笔改动要能再次落盘） */
export function resetTracking() {
    lastSig = null;
}

/* ---------- 写入（模块级函数：引用永久稳定，组件可直接 import） ---------- */

/** 落盘 + 通知 —— 所有写入动作的唯一收尾 */
function commit() {
    schedulePersist();
    notify();
}

/** 把 map 里某个键的某个字段换掉（不可变更新：换新对象，订阅者靠引用判变化） */
const patched = (map, key, field, value) => ({ ...map, [key]: { ...(map[key] || {}), [field]: value } });

/** 主 / 辅助项写入（key = 'main-{节点uuid}' / 'aux-{辅助项uuid}'） */
export function setItemValue(key, field, value) {
    memory.items = patched(memory.items, key, field, value);
    commit();
}

/** 批量覆盖 items（时间公式引擎一次性写入多节点时间） */
export function setItems(next) {
    memory.items = next;
    commit();
}

/** 视频监管项写入（key = 视频项 uuid） */
export function setVideoItemField(uuid, field, value) {
    memory.videoItems = patched(memory.videoItems, uuid, field, value);
    commit();
}

/** 检查人 */
export function setInspector(v) {
    memory.inspector = v;
    commit();
}

/* ---------- 生命周期 ---------- */

/**
 * 整体替换填写数据 —— **唯一的"写入内存"入口**（读草稿 / 灌记录 / 清空都走它）
 * 传空（含 null —— 读不到草稿时就是 null）即空草案；
 * 同时清掉落盘签名，保证接下来的首笔改动一定会重新落盘。
 */
function applyData(data) {
    const { items, videoItems, inspector } = data || {};
    memory.items = items || {};
    memory.videoItems = videoItems || {};
    memory.inspector = inspector || "";
    lastSig = null;
    notify();
}

/**
 * 写入草稿上下文（进入页面 / 切换检查单类型时调用；不触发通知）
 * ⚠️ flightId 语义是**航班键**（航班 uuid），不是数据库自增 id ——
 *    草稿键由 flightId + templateId 共同决定（draftKeyOf），两者都要正确。
 */
export function setContext({ flightId, flightNo, templateId }) {
    if (flightId !== undefined) memory.flightId = flightId;
    if (flightNo !== undefined) memory.flightNo = flightNo;
    if (templateId !== undefined) memory.templateId = templateId;
}

/**
 * 打开某航班的草稿（从 IndexedDB 载入；没有就是空草案）
 * @param {string} flightKey 航班键（航班 uuid）
 * @param {string} [templateId] 指定检查单类型；**不传**则取该航班最近改过的那一份
 *        （草稿箱"继续编辑"只带航班键，类型要从草稿里读回来）
 * @returns {Promise<Object|null>} 载入的草稿记录（供调用方接着读 templateId）
 *
 * ⚠️ 无论有没有草稿，都按"载入结果"整体替换内存 —— 找不到草稿就是空草案。
 *    否则上一个航班的填写会残留在内存里，新航班看到的、落盘的都成了别人的数据。
 */
export async function openDraft(flightKey, templateId) {
    if (!flightKey) return null;
    memory.flightId = flightKey;
    if (templateId) memory.templateId = templateId;

    let rec = null;
    try {
        rec = templateId
            ? await idbGetDraft(draftKeyOf(flightKey, templateId))
            : // 不带类型：同一航班的几份草稿里取最近修改的那份
              (await idbGetDraftsByFlight(flightKey)).sort((a, b) =>
                  String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))
              )[0] || null;
    } catch (err) {
        console.warn("[checklist] 读取本地草稿失败（按空草案继续）：", err);
    }

    if (rec?.templateId) memory.templateId = rec.templateId;
    applyData(rec);
    return rec;
}

/**
 * 用后端记录覆盖草案（打开已有记录时调用；记录优先于本地草稿）
 * 字段口径与后端一致：video_supervision → videoItems。
 */
export function hydrateFromRecord(record) {
    if (!record) return;
    applyData({
        items: record.items,
        videoItems: record.video_supervision,
        inspector: record.inspector,
    });
}

/** 清空填写内容（切换检查单类型时调用；保留上下文） */
export function clearMemory() {
    clearTimeout(persistTimer);
    persistTimer = null;
    applyData();
}

/** 整体重置（离开检查单页 / reset() 时调用；上下文一并清空） */
export function hardReset() {
    clearTimeout(persistTimer);
    persistTimer = null;
    memory.flightId = null;
    memory.flightNo = "";
    memory.templateId = null;
    setStatus(false, null);
    applyData();
}

/**
 * 删一份草稿：草稿箱索引 + IndexedDB 正文（草稿箱 UI 的"删除"按钮用）
 * 两处必须一起删 —— 只删索引会留下取不到的孤儿正文，只删正文会留下打不开的卡片。
 */
export function dropDraft(key) {
    if (!key) return;
    useDraftStore.getState().removeDraft(key);
    idbDeleteDraft(key);
}

/* ============================================================
 * 二、模块级资产：检查单类型
 * ------------------------------------------------------------
 * ★ 键 = 模板文件名 = category = dropdown label = 落库 `checklist_category`
 *   （类型名本身就是"模板 id"，四处一致，绝不改键名）
 * ★ 键序 = 类型下拉菜单顺序（顺航 · 货运始发 · 货运过站 · 客运始发 · 客运过站）
 *   TemplateChooseDropdown 的 TYPE_ORDER 自维护顺序，改这里时需与它同步。
 * ============================================================ */

/** 检查单类型 → hex 主色 */
export const TYPE_COLORS = {
    顺航检查单: "#059669", // 翠绿
    货运始发航班: "#0891B2", // 深青
    货运过站航班: "#7C3AED", // 紫
    客运始发航班: "#D946EF", // 洋红
    客运过站航班: "#6B2608", // 深棕
};

/** 类型名 → 主色 */
export const typeColorOf = (label) => TYPE_COLORS[label];

/**
 * 类型规范顺序（= TYPE_COLORS 键序 = 下拉菜单顺序）
 * URL 的 ?checkTemplate= 参数用它的 **1 起始下标**：1=顺航检查单 … 5=客运过站航班
 */
export const TYPE_ORDER = Object.keys(TYPE_COLORS);

/** checkTemplate 参数值（'1'~'5'）→ 类型名；非法返回 null */
export const typeOfCheckTemplate = (v) => {
    const i = Number(v) - 1;
    return Number.isInteger(i) && i >= 0 && i < TYPE_ORDER.length ? TYPE_ORDER[i] : null;
};

/** 类型名 → checkTemplate 参数值（'1'~'5'）；非已知类型返回 null */
export const checkTemplateOfType = (label) => {
    const i = TYPE_ORDER.indexOf(label);
    return i >= 0 ? String(i + 1) : null;
};

/**
 * hex 主色 → 指定透明度的 rgba
 * 用于从单一主色派生浅底 / 浅边框
 * ⚠️ 禁止 Tailwind 动态拼接类名（JIT 扫不到会静默失效）→ 一律 inline style + 本函数
 */
export const withAlpha = (hex, alpha = 1) => {
    const h = String(hex || "")
        .replace("#", "")
        .trim();
    const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
    if (full.length !== 6) return hex;
    const n = parseInt(full, 16);
    if (Number.isNaN(n)) return hex;
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** 模板表：id → 模板对象（对象上补 id 字段，原件里没有，供组件取用） */
const TEMPLATES = Object.fromEntries(
    [
        ["客运始发航班", passengerInitFlight],
        ["客运过站航班", passengerBypassFlight],
        ["货运始发航班", cargoInitFlight],
        ["货运过站航班", cargoBypassFlight],
        ["顺航检查单", shunhangFlight],
    ].map(([id, tpl]) => [id, { ...tpl, id }])
);

/** 兜底模板 id：未匹配任何规则时的默认检查单（货运过站航班） */
export const FALLBACK_TEMPLATE_ID = "货运过站航班";

/** 按 id 取检查单模板（同步、零网络）；无匹配返回 null */
export const getTemplateById = (id) => TEMPLATES[String(id || "")] || null;

/* ============================================================
 * 三、会话层（useChecklistStore）
 * ============================================================ */

/** 已提交记录的可修改时限（小时）：超过即锁定只读，禁止再修改 / 提交 */
const LOCK_HOURS = 24;

/** 是否已锁定（已提交且距今超 24h）—— 纯函数，store 内部与组件选择器共用 */
export const isLockedBy = (recordStatus, checkedAt) =>
    recordStatus === "submitted" &&
    !!checkedAt &&
    Date.now() - new Date(checkedAt).getTime() > LOCK_HOURS * 3600 * 1000;

/**
 * 是否处于 24h 锁定态（已提交且超时）→ 禁止修改 / 提交
 * selector 返回布尔原始值 → Object.is 稳定，store 不变时不会引起重渲染
 */
export const useIsLocked = () => useChecklistStore((s) => isLockedBy(s.recordStatus, s.checkedAt));

/* ---------- 记录 ⇄ 航班 的装配（查看页 /checklists/:checkedId 用） ---------- */

/** 取字符串里的 YYYY-MM-DD（取不到返回空串；'10:30' 这类纯时间不会误判成日期） */
const datePartOf = (v) => String(v || "").match(/^\d{4}-\d{2}-\d{2}/)?.[0] || "";

/** 航班键归一：ecyilang 的 uuid 带 '-d' / '-a' 航段后缀，比对前先剥掉 */
const baseKey = (v) =>
    String(v || "")
        .trim()
        .replace(/-[da]$/, "");

/**
 * 记录主键归一
 * records_checklist.id 是**整数自增主键**，但 URL 参数到手永远是字符串
 * （后端 /api/checklist/:id 也只认纯数字，非数字直接 404）——
 * 所以这里统一收成「去空白的字符串」，别再拿 Number() 到处判有效性。
 * @param {string|number} v URL 上的记录 id
 * @returns {string|null} 非空字符串原样返回（去空白），否则 null
 */
const asRecordId = (v) => String(v ?? "").trim() || null;

/**
 * 按航班键找航班行（记录反查来源航班 / 打开某航班的检查单共用）
 * 比对由准到松：uuid 精确 → 剥掉航段后缀的 uuid（ecyilang 的 '-d' / '-a'）
 *             → 字符串化的 id → 尾部数字当主键（更早的写法是纯数字 id）
 * ★ 先查 store 的 rows（**原始行**）：从航班列表点进来时零请求。
 *   ⚠️ 不能读 flights —— 那是给页面渲染的三份数组（已按关键词 / 生鲜过滤 + 排序），
 *      可能正好被筛掉。缓存里没有才跨天全量拉一次。
 * 后端不可用返回 null —— 查看页用记录自带字段兜底，绝不因反查失败打不开。
 */
async function findFlightRow(flightKey) {
    const key = String(flightKey || "").trim();
    if (!key) return null;
    const base = baseKey(key);
    const numId = Number(key.match(/(\d+)$/)?.[1]) || null;
    const match = (f) =>
        f?.uuid === key ||
        (!!base && baseKey(f?.uuid) === base) ||
        String(f?.id) === key ||
        (!!numId && Number(f?.id) === numId);

    const cached = (useFipsStore.getState().rows || []).find(match);
    if (cached) return cached;
    try {
        return ((await fetchFlightRows()) || []).find(match) || null;
    } catch {
        return null;
    }
}

/**
 * 航班行（+ 可选的已落库记录）→ 统一的 flight 对象
 * 查看器 / 工具栏 / 信息区共用同一套字段（origin / destination / flightDate 等别名在此归一）。
 * 记录字段优先（记录是"当时填的"，航班行之后可能被改过）；没有记录时就是纯航班行。
 * @param {Object|null} row 来源航班行（反查失败时传 null，退化为记录自带字段）
 * @param {{record?: Object|null, flightKey?: string|null}} [opts]
 */
function toFlight(row, { record = null, flightKey = null } = {}) {
    return {
        ...(row || {}), // 来源航班整行（含 uuid 与各字段）
        id: row?.id ?? record?.flight_uuid ?? flightKey ?? null,
        uuid: row?.uuid || record?.flight_uuid || flightKey || null, // 草稿键：与"从航班列表进入"保持一致
        queryId: record?.flight_uuid ?? null, // 记录侧原始 flight_uuid，供回跳编辑路由使用
        flightNo: record?.flight_no || row?.flight_no || "",
        aircraftType: record?.aircraft_type || row?.aircraft_type || "",
        flightDate:
            record?.flight_date ||
            datePartOf(row?.in_out_time) ||
            datePartOf(row?.sobt) ||
            datePartOf(record?.created_at),
        origin: row?.origin_station || "",
        destination: row?.dest_station || "",
    };
}

/* ---------- store 本体 ---------- */

// 三列的固定顺序（与面板组 columns 的 key 一致；panels 为内存态，不持久化）
const PANEL_KEYS = ["main", "aux", "video"];

export const useChecklistStore = create((set, get) => {
    /* ============================================================
     * 提交（新建 / 更新）的公共部件 —— 两个动作只在"调哪个 API"上不同
     * ============================================================ */

    /**
     * 提交前置校验：航班/模板就位、未被 24h 锁定
     * @returns {{s: Object, d: Object}|null} 通过时返回 {当前状态, 草案快照}；不通过返回 null（saveError 已写入）
     */
    const prepareSubmit = () => {
        const s = get();
        if (!s.flight || !s.template) return null;
        if (isLockedBy(s.recordStatus, s.checkedAt)) {
            set({ saveError: `该检查单已提交超过 ${LOCK_HOURS} 小时，不可再修改` });
            return null;
        }
        return { s, d: getSnapshot() };
    };

    /**
     * 提交前把本机暂存的截图传到服务端（只传"有 blob 且还没 url"的那些）
     * ------------------------------------------------------------
     * 截图的完整生命周期：
     *   粘贴/选择 → 只是本机 Blob（存 IndexedDB 草稿，离线也不丢）
     *     ↓ 点提交
     *   uploadImage（原始二进制，不走 Base64）→ 服务端落盘 → 拿到 /api/uploads/xxx.png
     *     ↓
     *   内存里的 image 换成 { ...meta, url }（草稿随之变轻，重复提交不重传）
     *     ↓
     *   组 payload → 记录里只存 url，任何设备打开都能看到这张图
     *
     * ⚠️ 上传失败就抛出去 —— 宁可不落库，也不让"截图静默消失"。
     * @param {Object} d 草案快照
     * @returns {Promise<{items: Object, videoItems: Object}>} 可落库的两份填写数据
     *          （image 只含元信息 + url）—— **两处都要回传**，别只回 videoItems：
     *            · items      = 主 / 辅助项的填写（key = main-xxx / aux-xxx）
     *            · videoItems = 视频监管项（key = 视频项 uuid）
     *          漏掉 items 的话，辅助项的截图会被 JSON.stringify 变成 {}，图静默消失。
     */
    const uploadDraftImages = async (d) => {
        /** 扫一份填写数据，把"有 blob 还没 url"的图传上去，并同步回内存 */
        const uploadMap = async (map, syncImage) => {
            const list = Object.entries(map || {}).filter(([, v]) => v?.image?.blob && !v.image.url);
            if (!list.length) return map;
            const next = { ...map };
            for (const [key, v] of list) {
                const img = v.image;
                const uploaded = await checklistApi.uploadImage(img.blob, img.name);
                next[key] = { ...v, image: { ...imageMeta(img), url: uploaded.url } };
                syncImage(key, next[key].image); // 内存同步换 url（省掉下次重传）
            }
            return next;
        };

        return {
            items: await uploadMap(d.items, (key, image) => setItemValue(key, "image", image)),
            videoItems: await uploadMap(d.videoItems, (uuid, image) => setVideoItemField(uuid, "image", image)),
        };
    };

    /**
     * 组装提交载荷（新建 / 更新共用）
     * header 注入模板元信息（记录自描述：这份单子用的是哪个模板/版本）；
     * 其余字段口径与后端 service 一致（更新时后端对未传字段 COALESCE 保持原值）。
     *
     * ★ flightId 传的是**航班 uuid**（不是数字主键 id）。
     *   后端写入前会用 resolveFlightRef() 拿它到三张航班表里找宿主，
     *   找不着直接回 400 —— 所以传错值会当场报错，不会落成挂不上航班的孤儿记录。
     *   ecyilang 源的 uuid 带 '-d' / '-a' 航段后缀，后端 base_flight_uuid() 会剥掉，照传即可。
     */
    const buildPayload = (s, d, status) => ({
        flightId: s.flight.uuid || s.flight.id,
        flightNo: s.flight.flightNo,
        aircraftType: s.flight.aircraftType,
        checklistCategory: s.template.category, // 与下拉菜单对齐的模板名（如 货运始发航班）
        flightDate: s.flight.flightDate || null,
        header: {
            ...s.header,
            template: {
                uuid: s.template.uuid || null,
                category: s.template.category || null,
                checklistName: s.template.checklistName || null,
                schemaVersion: s.template.schemaVersion || null,
            },
        },
        // 主 / 辅助项 + 视频监管项：image 只带元信息 + url（blob 已在 uploadDraftImages 换成 url）
        items: d.items,
        videoSupervision: d.videoItems,
        inspector: d.inspector,
        status,
    });

    /**
     * 落库成功后的统一收尾（新建 / 更新共用）
     *   1) 记录元数据（工具栏徽章 + 24h 锁定基准）
     *   2) 记录页刷新（新增一条 / 分类或状态变了）
     *   3) 清该航班草稿（草稿箱 + IndexedDB）+ 重置落盘签名
     */
    const afterSaved = (record, status, s) => {
        set({
            saveStatus: "saved",
            checkedAt: record.updated_at || record.created_at || new Date().toISOString(),
            recordStatus: record.status || status,
            loadedRecord: record,
            saveError: null,
        });
        useRecordsStore.getState().refresh();
        const flightKey = s.flight?.uuid || s.flight?.id;
        if (flightKey) {
            useDraftStore.getState().removeDraftsByFlight(flightKey);
            idbDeleteDraftsByFlight(flightKey);
        }
        resetTracking();
    };

    return {
        // ============================================================
        // 1) 航班信息
        // ============================================================
        flight: null, // 当前航班信息
        header: {}, // 航班号 / 机型 等头部字段（随航班写入；公式引擎读 landingTimeLocal）

        /** 写入航班信息（进入检查单页 / 流程图页时调用），header 同步生成 */
        setFlight: (flight) =>
            set({
                flight,
                header: { flightNo: flight?.flightNo || "", aircraftType: flight?.aircraftType || "" },
            }),

        // ============================================================
        // 2) 当前模板
        // ============================================================
        template: null, // 检查单模板（JSON，主监控/辅助节点）

        /**
         * 加载检查单模板 —— **纯本地、零网络**
         * 模板已按 category 穷举静态化（EditorTemplateJson，编译期打包），直接查表即可；
         * 切换检查单类型不再有请求往返与 loading 空窗。
         *
         * ★ **默认类型由本 action 保证**：未命中（含传空）→ 落到 `FALLBACK_TEMPLATE_ID`（货运过站航班），
         *   所以 `template` 永不为空、组件侧不必再写 `|| 兜底`。
         * @param {string} templateId 模板 id（= 类型名 = checklist_category；可为空）
         * @returns {Promise<Object>} 模板对象
         */
        loadTemplate: async (templateId) => {
            const tpl = getTemplateById(templateId) || getTemplateById(FALLBACK_TEMPLATE_ID);
            // 视频监管数据不进 store：由各检查单面板组（Template/*.jsx）静态 import 自己那一份
            set({ template: tpl });
            return tpl;
        },

        /**
         * 打开某航班的检查单会话 —— **编辑器路由 /checklists/flight/:flightId 的唯一装载入口**
         * ------------------------------------------------------------
         * 为什么必须由 URL 驱动装载：编辑器是 store 驱动的（零 props），
         * 只换 URL 而不重装 store，页面就会继续显示**上一个航班**的数据，
         * 而且填写层还留着上一个航班的 items（草稿会落到错误的键上）。
         *
         * 装载顺序（一次到位）：
         *   1) 已是同一航班**且当前不在修改态** → 不重装（从航班列表点进来时 store 已装好，
         *      不重复请求/不冲草稿）；若同时指定了另一种检查单类型（草稿箱选了某一份草稿）
         *      → 转 switchChecklistType
         *      ⚠️ 修改态（recordId 非空）必须往下走：本入口是"新建/续草稿"语义，
         *         不清掉 recordId 的话提交会变成改旧记录（用户点"新建"却改了旧单子）
         *   2) reset()      清上一个航班的会话（含填写层内存）
         *   3) 反查航班行 → setFlight（uuid 身份 + 展示用驼峰别名）
         *   4) openDraft(航班键, 类型)  草稿按「航班键 × 类型」精确取；未指定类型则取最近一份
         *   5) loadTemplate(入参类型 > 草稿里的类型 > 兜底) + setContext（草稿键归属）
         *
         * @param {string} flightKey 航班键（URL 参数，= 航班 uuid）
         * @param {string} [templateId] 指定检查单类型（不传则沿用草稿里的类型）
         * @returns {Promise<Object|null>} 装载后的航班对象
         */
        openFlight: async (flightKey, templateId) => {
            if (!flightKey) return null;
            const s = get();
            const isSame = !!s.flight && String(s.flight.uuid || s.flight.id) === String(flightKey);

            // 同一航班 + 非修改态：只是"换一份草稿"（草稿箱选了另一种检查单类型）→ 交给 switchChecklistType
            if (isSame && !s.recordId) {
                if (templateId && templateId !== s.template?.id) await get().switchChecklistType(templateId);
                return s.flight;
            }

            // 换航班，或从"修改某条记录"切回新建态 → 一律重装（reset 会清掉 recordId，
            // 之后的提交才会走 POST 新建，而不是改掉那条旧记录）
            get().reset();
            const flight = toFlight(await findFlightRow(flightKey), { flightKey });
            set({
                flight,
                header: { flightNo: flight.flightNo, aircraftType: flight.aircraftType },
            });

            const rec = await openDraft(flightKey, templateId);
            const tpl = await get().loadTemplate(templateId || rec?.templateId);
            setContext({ flightId: flightKey, flightNo: flight.flightNo, templateId: tpl.id });
            return flight;
        },

        /**
         * 打开某条已落库记录进入**修改模式** —— 编辑器路由 `?record=<id>` 的装载入口
         * ------------------------------------------------------------
         * 与 openFlight（新建 / 续草稿）严格分成两条路，谁都不越界：
         *   - 本入口：记录 id 就是身份 → loadRecord 装配 航班 + 模板 + 记录元数据，
         *     并把落库内容灌进填写层；装好后 recordId 非空 → 提交走 updateRecord（PUT）
         *   - openFlight：永不带 recordId → 提交走 createRecord（POST 新建一条）
         * 记录 id 放在 URL 上，刷新 / 直链 / 从填写记录页点"修改"进来都是同一条路。
         * @param {string} recordId records_checklist.id（URL 参数，随机 uuid）
         * @param {string} [fallbackFlightKey] 记录取不到时的退路（URL 上的航班键）→ 退回新建态
         * @returns {Promise<Object|null>} 装载后的航班对象
         */
        openRecordForEdit: async (recordId, fallbackFlightKey) => {
            const id = asRecordId(recordId);
            if (!id) return null;
            const s = get();
            // 已经在同一条记录上（重渲染 / 前进后退）→ 不重装，避免冲掉刚改的内容
            if (String(s.recordId) === String(id) && s.flight) return s.flight;
            get().reset();
            const rec = await get().loadRecord(id);
            if (!rec && fallbackFlightKey) {
                // 记录不存在 / 已被别处删除（如填写记录页删掉了）→ 退回新建态，
                // 否则页面会卡在"正在加载检查单"上，用户看不出发生了什么。
                await get().openFlight(fallbackFlightKey);
                set({ saveError: "该检查单记录不存在或已被删除，已切换为新建" });
            }
            return get().flight;
        },

        /**
         * 切换检查单类型（下拉菜单选中）
         * ------------------------------------------------------------
         * 草稿键 = 航班键::类型 → **每种类型各有自己的一份草稿**，所以这里的语义是"换一份草稿"：
         *   1) flushDraft()      先把当前类型的草稿落盘（切换不丢已填内容）
         *   2) openDraft(航班键, 新类型)  有该类型草稿就恢复，没有就是空表
         *   3) loadTemplate()    换模板（放在填数据之后，避免"新模板 + 旧数据"的中间态）
         * 记录元数据一并清空（换了检查单，之前那条记录不再对应当前内容）——
         * ★ 含 recordId：换类型 = 另一张单子（不同模板的 items 结构都不同，合并会写坏数据），
         *   所以即使原本在修改某条记录，切类型后也变成"新建"；那条旧记录保持原样不动。
         * @param {string} tplId 模板 id（= 下拉项 label = checklist_category）
         */
        switchChecklistType: async (tplId) => {
            const s = get();
            if (!s.flight) return;
            const flightKey = s.flight.uuid || s.flight.id;
            flushDraft(); // 当前类型的填写先落盘（复合键：各类型各留一份，互不覆盖）
            set({
                selectedCheckNode: null,
                recordId: null,
                recordStatus: null,
                checkedAt: null,
                loadedRecord: null,
            });
            await openDraft(flightKey, tplId);
            await get().loadTemplate(tplId);
            setContext({ flightId: flightKey, flightNo: s.flight.flightNo, templateId: tplId });
        },

        // ============================================================
        // 3) 列显隐（内存态，跨航班保留）
        // ============================================================
        panels: ["main", "aux", "video"], // 可见列（main/aux/video 的子集，至少一列）

        /**
         * 切换某一列的显示（main / aux / video）
         * 至少保留一列：仅剩一列时再点它无效。
         * 结果按 PANEL_KEYS 顺序归一，顺序天然稳定。
         */
        togglePanel: (key) => {
            if (!PANEL_KEYS.includes(key)) return;
            const cur = get().panels;
            const has = cur.includes(key);
            if (has && cur.length <= 1) return; // 不允许把最后一列也关掉
            set({ panels: PANEL_KEYS.filter((k) => (k === key ? !has : cur.includes(k))) });
        },

        // ============================================================
        // 4) 流程图 / 小地图（内存态，跨航班保留）
        // ============================================================
        viewMode: "form", // form（检查项）| flow（流程图全屏）

        /** 视图模式；支持传函数 `v => next` */
        setViewMode: (next) => {
            const cur = get().viewMode;
            const value = typeof next === "function" ? next(cur) : next;
            if (value === cur) return;
            set({ viewMode: value });
        },
        toggleViewMode: () => get().setViewMode((v) => (v === "flow" ? "form" : "flow")),

        thumbVisible: false, // 右下角小地图开关

        setThumbVisible: (next) => {
            const value = !!next;
            if (value === get().thumbVisible) return;
            set({ thumbVisible: value });
        },
        toggleThumbVisible: () => get().setThumbVisible(!get().thumbVisible),

        // ============================================================
        // 5) 选中节点（卡片高亮 / 辅助栏 / 流程图共用）
        //    填写数据 items/videoItems/inspector 在填写层，不在本 store
        // ============================================================
        selectedCheckNode: null, // 原 currentStep

        /** 选中某个检查节点：卡片点击 / 流程图点选 → 驱动卡片高亮、辅助栏切换、流程图脉冲 */
        setSelectedCheckNode: (nodeId) => set({ selectedCheckNode: nodeId }),

        // ============================================================
        // 6) 后端交互（记录元数据 · 保存状态 · 新建 / 更新 / 删除）
        // ============================================================
        recordId: null, // 已落库的记录 id（空 → 提交走 create，否则 update）
        recordStatus: null, // draft | submitted | null
        checkedAt: null, // 时间基准 = updated_at（表结构已无 checked_at）
        loadedRecord: null, // 已加载的记录对象（查看模式展示用）

        saveStatus: "idle", // idle | saving | saved | error
        saveError: null, // 保存/提交失败提示（常驻，手动关闭）

        /** 关闭保存失败提示 */
        clearSaveError: () => set({ saveError: null }),

        /**
         * 写入记录元数据（加载记录 / 提交成功 / 切换类型时调用）
         * 只覆盖传入的键，未传的保持原值（与 React setState 的局部更新语义一致）。
         * @param {{recordStatus?: string|null, checkedAt?: string|null, loadedRecord?: Object|null}} meta
         */
        setRecordMeta: (meta) => set(meta),

        /**
         * 按记录主键加载检查单 —— **查看页（/checklists/:checkedId）的唯一数据入口**
         * ------------------------------------------------------------
         * 记录 id 就是身份：一次到位装配 航班 + 模板 + 记录元数据 三样，
         * 页面侧零 props 自订阅即可渲染（刷新 / 直链 / 提交后跳转都走这条路）。
         * 同时把已落库结果灌进填写层（hydrateFromRecord）——点"修改"进编辑器时
         * 看到的就是原填写内容，而不是空表。
         * @param {string} checkedId records_checklist.id（URL 参数，随机 uuid）
         * @returns {Promise<Object|null>} 记录对象；失败返回 null（saveError 已写入）
         */
        loadRecord: async (checkedId) => {
            const id = asRecordId(checkedId);
            if (!id) return null;
            set({ saveStatus: "idle", saveError: null });
            try {
                const record = await checklistApi.get(id);
                const tpl = getTemplateById(record.checklist_category) || getTemplateById(FALLBACK_TEMPLATE_ID);
                const flight = toFlight(await findFlightRow(record.flight_uuid), { record });
                set({
                    recordId: record.id,
                    loadedRecord: record,
                    recordStatus: record.status || null,
                    checkedAt: record.updated_at || record.created_at || null,
                    flight,
                    header: {
                        ...(record.header || {}),
                        flightNo: flight.flightNo,
                        aircraftType: flight.aircraftType,
                    },
                    template: tpl,
                    selectedCheckNode: null,
                });
                hydrateFromRecord(record);
                setContext({
                    flightId: flight.uuid || record.flight_uuid,
                    flightNo: flight.flightNo,
                    templateId: tpl.id,
                });
                return record;
            } catch (err) {
                set({ saveError: err.message || "加载检查单失败" });
                return null;
            }
        },

        // ---- 三个写动作：新建 / 更新 / 删除（一一对应 POST / PUT / DELETE）----
        // 为什么必须分开：POST 与 PUT 的语义完全不同 —— 以前只有一个 submit() 靠 recordId
        // 隐式分流，而后端 POST 又按 flight_uuid upsert，于是"点创建检查表"实际改掉了旧记录。
        // 现在按语义显式调用，且后端 POST 只 INSERT：
        //   新建态（recordId 为空）→ createRecord()   POST   新增一条
        //   修改态（有 recordId）  → updateRecord()   PUT    只改 id 那一条
        //   删除                   → deleteRecord()   DELETE 只删 id 那一条
        // 失败不抛错：写 saveError 由 SaveErrorToast 常驻展示。

        /**
         * **新建**检查单记录 —— POST /api/checklist（永远新增一条，绝不碰旧记录）
         * ------------------------------------------------------------
         * 同一航班可以有多份检查单（重填 / 换类型各一份），每份都是独立的一条记录。
         * 调用入口（都是"新建"语义的按钮）：
         *   - 编辑器提交按钮（新建态：URL 上没带 ?record）
         *   - 航班列表「创建检查表」→ reset() + openFlight()（recordId 已清空）
         *   - 详情页「新建检查单」→ 同上
         * ★ 成功后写回 recordId：本会话再提交就变成"更新刚建的这一条"。
         * @param {{status?: string}} [opts] status 默认 'submitted'
         * @returns {Promise<Object|null>} 新记录；失败 null（saveError 已写）
         */
        createRecord: async (opts = {}) => {
            const { status = "submitted" } = opts;
            const pre = prepareSubmit();
            if (!pre) return null;
            const { s, d } = pre;
            set({ saveStatus: "saving" });
            try {
                const { items, videoItems } = await uploadDraftImages(d); // 先把本机暂存的截图传上服务端
                const record = await checklistApi.create(buildPayload(s, { ...d, items, videoItems }, status));
                set({ recordId: record.id });
                afterSaved(record, status, s);
                return record;
            } catch (err) {
                set({ saveStatus: "error", saveError: err.message || "新建失败，请重试" });
                return null;
            }
        },

        /**
         * **更新**检查单记录 —— PUT /api/checklist/:id（只改 recordId 这一条）
         * 必须处于修改态（recordId 非空，来自 `?record=<id>` 或刚新建成功），否则拒绝执行 ——
         * 宁可报错也不隐式降级成新建，避免"以为在改、其实多出一条"。
         * @param {{status?: string}} [opts] status 默认 'submitted'
         * @returns {Promise<Object|null>} 更新后的记录；失败 null（saveError 已写）
         */
        updateRecord: async (opts = {}) => {
            const { status = "submitted" } = opts;
            const id = get().recordId;
            if (!id) {
                set({ saveError: '当前不是修改态（没有记录 id）—— 新建请走"创建检查表"入口' });
                return null;
            }
            const pre = prepareSubmit();
            if (!pre) return null;
            const { s, d } = pre;
            set({ saveStatus: "saving" });
            try {
                const { items, videoItems } = await uploadDraftImages(d); // 先把本机暂存的截图传上服务端
                const record = await checklistApi.update(id, buildPayload(s, { ...d, items, videoItems }, status));
                if (!record) throw new Error("记录不存在或已被删除");
                afterSaved(record, status, s);
                return record;
            } catch (err) {
                set({ saveStatus: "error", saveError: err.message || "更新失败，请重试" });
                return null;
            }
        },

        /**
         * **删除**检查单记录 —— DELETE /api/checklist/:id（只删这一条）
         * 后端会重算来源航班的 checklist_uuid（该航班还有别的检查单就指向最新一份，没有则置空）。
         * @param {string|number} [id] 记录 id；不传则删当前会话这条（recordId）
         * @returns {Promise<boolean>} 是否删除成功
         */
        deleteRecord: async (id) => {
            const target = id ?? get().recordId;
            if (!target) return false;
            set({ saveStatus: "saving" });
            try {
                await checklistApi.remove(target);
                // 删掉的正是当前会话这条 → 一并退出修改态（否则后续提交会打到一个不存在的 id）
                if (String(get().recordId) === String(target)) {
                    set({ recordId: null, loadedRecord: null, recordStatus: null, checkedAt: null });
                }
                set({ saveStatus: "idle", saveError: null });
                useRecordsStore.getState().refresh();
                return true;
            } catch (err) {
                set({ saveStatus: "error", saveError: err.message || "删除失败，请重试" });
                return false;
            }
        },

        /**
         * 提交（按当前态自动分流）—— recordId 在 → updateRecord（PUT），不在 → createRecord（POST）
         * 工具栏提交按钮用它；需要"必须新建 / 必须更新"的按钮直接调上面两个动作。
         * @returns {Promise<Object|null>} 落库后的记录
         */
        submit: async (opts = {}) => (get().recordId ? get().updateRecord(opts) : get().createRecord(opts)),

        // ============================================================
        // 整体清空（切换航班 / 离开检查单页）
        // ============================================================
        reset: () => {
            hardReset();
            set({
                template: null,
                recordId: null,
                flight: null,
                header: {},
                selectedCheckNode: null,
                saveStatus: "idle",
                saveError: null,
                recordStatus: null,
                checkedAt: null,
                loadedRecord: null,
                // 注：viewMode / thumbVisible / panels 为内存态布局，跨航班保留，不在此重置
            });
        },
    };
});
