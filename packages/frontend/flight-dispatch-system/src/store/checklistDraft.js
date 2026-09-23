import { useCallback, useSyncExternalStore } from 'react'
import { useDraftStore, MAX_DRAFTS } from './draftStore'
import { imageMeta } from '../utils/checkImage'

// ============================================================
// checklistDraft —— 检查单填写层（非受控草案 · 内存 + IndexedDB）
// ------------------------------------------------------------
// 架构（UUID 即身份）：
//   静态模板（EditorTemplateJson，编译期内联，只管"检查什么"）
//        ↓ react render
//   每个检查项独立组件（非受控：DOM 持值，defaultValue 只管首挂）
//        ↓ 用户修改
//   本模块（内存 draft + 防抖写 IndexedDB，可存 Blob/图片）
//        ↓ 最后 Submit
//   checklistStore.submit() 一次性收集 UUID + 结果 → POST 后端
//
// ★ Zustand（checklistStore）不再保存 items/videoItems/inspector ——
//   填写数据只活在本模块的内存里；谁需要响应式，谁用文件底部的
//   useMainItem / useAuxItem / useVideoCheckItem / useDraftVersion 订阅。
//
// ★ 响应式模型（与原来"store 逐项订阅"等价的重渲染保证）：
//   - 全局一个 version 计数，任何改动 notify() 一次
//   - 每个单项 hook 的 getSnapshot 只返回自己那一项的引用；
//     未被改动的项引用不变 → Object.is 命中 → 该组件不重渲染
//   - 引擎/流程图等需要"整份 items"的场景订阅 version 数字
//
// ★ 持久化：一个航班一份草稿（IndexedDB store `checklist_drafts`，
//   keyPath = flightId），防抖 800ms 合并写入；同时 upsert 进 draftStore
//   草稿箱（localStorage，仅文本摘要），草稿箱列表 UI（DraftDropdown /
//   PageLayout 徽标 / ChecklistSelectPage）无需感知本次迁移。
//   ⚠️ 图片等大二进制以后只放 IndexedDB，禁止进 localStorage。
// ============================================================

const DB_NAME = 'flight_dispatch'
// v2：草稿主键由「航班键」升为「航班键::模板id」复合键（见 draftKeyOf）
//     升级时删掉旧 object store 重建（草稿是本地临时数据，旧键无法迁移到新键）
const DB_VERSION = 2
const STORE_NAME = 'checklist_drafts'
const DRAFT_DEBOUNCE_MS = 800

/**
 * 草稿键 = 航班键 + 检查单类型：`{flightKey}::{templateId}`
 * ------------------------------------------------------------
 * 一个航班 × 一种检查单类型 = 一份草稿。两个维度都不可少：
 *   - 只用航班键：切换检查单类型会互相覆盖（同航班的不同类型表结构完全不同）
 *   - 只用模板 id：多个航班的同类型草稿会撞成一份（拿到别的航班的填写）
 * @param {string} flightKey 航班键（manual_fips.uuid）
 * @param {string} templateId 模板 id（= 类型名 = checklist_category）
 */
export const draftKeyOf = (flightKey, templateId) => `${flightKey || ''}::${templateId || ''}`

// ---- IndexedDB 基础（Promise 化；SSR / 不支持时静默降级为纯内存） ----
function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'))
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME)
      db.createObjectStore(STORE_NAME, { keyPath: 'key' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** 按草稿键取一条草稿 */
async function idbGet(key) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

/** 取某航班的全部草稿（草稿总数上限 5，全量读出后过滤即可，无需建索引） */
async function idbGetByFlight(flightKey) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).getAll()
    req.onsuccess = () =>
      resolve((req.result || []).filter((r) => r.flightId === flightKey))
    req.onerror = () => reject(req.error)
  })
}

/** 同一航班的多份草稿里取最近修改的一份（草稿箱"继续编辑"用） */
function pickLatest(list) {
  return [...(list || [])].sort((a, b) =>
    String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')),
  )[0] || null
}

async function idbPut(record) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).put(record)
    req.onsuccess = () => resolve(true)
    req.onerror = () => reject(req.error)
  })
}

// ---- 内存草案（Zustand 之外唯一的事实来源） ----
const memory = {
  flightId: null,   // 当前草稿归属的**航班键**（= manual_fips.uuid；openDraft 时写入）
  flightNo: '',
  templateId: null, // 当前检查单类型；与 flightId 共同构成草稿键（见 draftKeyOf）
  items: {},        // { "main-{节点uuid}" | "aux-{辅助项uuid}": { status, time, note, auto } }
  videoItems: {},   // { "<视频项uuid>": { status, note, image } }  image 见 utils/checkImage.js（每项最多 1 张，blob 可存）
  inspector: '',
}

// ---- 响应式：version + listeners（useSyncExternalStore 的数据源） ----
let version = 0
const listeners = new Set()
function notify() {
  version += 1
  listeners.forEach((l) => l())
}
export const subscribeDraft = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const getDraftVersion = () => version

/** 读整份内存草案（submit 组 payload / 公式引擎 / 流程图 statusMap 用；引用稳定） */
export const getSnapshot = () => memory

// ---- 草稿保存状态（供工具栏 DraftStatus 展示；保持引用稳定） ----
let statusSnap = { draftPending: false, draftSavedAt: null }
export const getDraftStatus = () => statusSnap
function setDraftStatus(pending, savedAt) {
  statusSnap = { draftPending: pending, draftSavedAt: savedAt ?? statusSnap.draftSavedAt }
}

// ---- 落盘（防抖合并写入） ----
let persistTimer = null
let lastDraftSig = null
let persistEnabled = true // 已提交/锁定 → setEnabled(false)，不再产生草稿

/** 内容是否值得落盘：至少一项填了 status / time / note / image（避免"打开页面就产生空草稿"）
 *  ⚠️ videoItems 必须一起看：只填视频监管项（尤其只贴了一张截图）时，
 *     若只检查 items，草稿永远不会落盘 —— 刷新即丢。 */
function hasContent() {
  const filled = (v) => !!v && (v.status || v.time || v.note || v.image)
  return Object.values(memory.items).some(filled) || Object.values(memory.videoItems).some(filled)
}

/**
 * 落盘签名（判断"内容有没有变化"，一致则跳过 IndexedDB 事务）
 * ⚠️ 必须把 blob 摘掉再序列化：Blob 会被 JSON 静默变成 {}，
 *    保留 id/type/size/url 就足以代表"这张图换了没有"，且不会试图序列化二进制。
 */
function contentSig() {
  return JSON.stringify(
    [memory.items, memory.videoItems, memory.inspector],
    (key, value) => (key === 'blob' ? undefined : value),
  )
}

/** 剥掉一项里的 image 二进制（localStorage 装不下 Blob，也不该装） */
const stripImage = (v) => (v?.image ? { ...v, image: imageMeta(v.image) } : v)
const stripImages = (map) =>
  Object.fromEntries(Object.entries(map).map(([k, v]) => [k, stripImage(v)]))

/** 草稿箱（localStorage）用副本：二进制换成元信息，绝不把 Blob 写进 localStorage
 *  ⚠️ items（主 / 辅助项）与 videoItems 都要剥 —— 辅助项的截图现在也存在 items 里，
 *     漏一处就会让 JSON.stringify 把 Blob 静默变成 {}（草稿箱里显示"有图但打不开"） */
function boxSnapshot() {
  return {
    items: stripImages(memory.items),
    videoItems: stripImages(memory.videoItems),
    inspector: memory.inspector,
  }
}

/**
 * 当前草案的草稿键（航班键 + 模板 id）
 * 两者缺一不算"有归属"→ 返回空串，调用方据此短路（不落盘、不通知）
 */
function currentKey() {
  return memory.flightId && memory.templateId ? draftKeyOf(memory.flightId, memory.templateId) : ''
}

function finishPersist() {
  setDraftStatus(false)
  notify()
}

function persistNow() {
  persistTimer = null
  const key = currentKey()
  if (!key || !persistEnabled) return finishPersist()
  if (!hasContent()) return finishPersist()
  // 草稿箱已满（5 份）且当前这份不在箱内时，不再自动写入，避免静默挤掉最早的草稿
  const box = useDraftStore.getState().drafts
  const alreadyInBox = box.some((d) => d.key === key)
  if (box.length >= MAX_DRAFTS && !alreadyInBox) return finishPersist()

  // 签名只比内容，内容一致则跳过写入（省 IDB 事务 + drafts 列表刷新）
  const sig = contentSig()
  if (sig === lastDraftSig) return finishPersist()
  lastDraftSig = sig

  // IndexedDB 记录：**原样带 Blob**（结构化克隆天然支持），这是图片真正的归宿
  const record = {
    key,                          // 主键：航班键::模板id（同航班不同类型各留一份）
    flightId: memory.flightId,    // 航班键（草稿箱跳转 / 按航班清理用）
    flightNo: memory.flightNo,
    templateId: memory.templateId,
    items: memory.items,
    videoItems: memory.videoItems,
    inspector: memory.inspector,
    status: 'draft',
    updatedAt: new Date().toISOString(),
  }
  // IndexedDB 是权威存储；localStorage 草稿箱只作为"最近草稿列表"的索引
  // （只存图片元信息 —— 二进制出不了 localStorage，也不该出）
  idbPut(record).catch((err) => console.warn('[checklistDraft] 写入 IndexedDB 失败：', err))
  useDraftStore.getState().upsertDraft({ ...record, ...boxSnapshot() })
  setDraftStatus(false, record.updatedAt)
  notify()
}

function schedulePersist() {
  if (!currentKey() || !persistEnabled) return
  if (!statusSnap.draftPending) {
    setDraftStatus(true)
    notify()
  }
  clearTimeout(persistTimer)
  persistTimer = setTimeout(persistNow, DRAFT_DEBOUNCE_MS)
}

// ---- 写入 API（模块级函数：引用永久稳定，组件可直接 import） ----

/** 主/辅助项写入（key = `main-{节点uuid}` / `aux-{辅助项uuid}`） */
export function setItemValue(key, field, value) {
  memory.items = { ...memory.items, [key]: { ...(memory.items[key] || {}), [field]: value } }
  schedulePersist()
  notify()
}

/** 批量覆盖 items（时间公式引擎用：一次性写入多节点时间） */
export function setItems(next) {
  memory.items = next
  schedulePersist()
  notify()
}

/** 视频监管项写入（key = 视频项 uuid） */
export function setVideoItemField(uuid, field, value) {
  memory.videoItems = { ...memory.videoItems, [uuid]: { ...(memory.videoItems[uuid] || {}), [field]: value } }
  schedulePersist()
  notify()
}

/** 检查人 */
export function setInspector(v) {
  memory.inspector = v
  schedulePersist()
  notify()
}

// ---- 生命周期 ----

/**
 * 写入草稿上下文（进入页面 / 切换检查单类型时调用；不触发通知）
 * ⚠️ flightId 语义是**航班键**（manual_fips.uuid），不是数据库自增 id ——
 *    草稿键由 flightId + templateId 共同决定（draftKeyOf），两者都要正确。
 */
export function setContext(ctx) {
  if (ctx.flightId !== undefined) memory.flightId = ctx.flightId
  if (ctx.flightNo !== undefined) memory.flightNo = ctx.flightNo
  if (ctx.templateId !== undefined) memory.templateId = ctx.templateId
}

/**
 * 打开某航班的草稿（从 IndexedDB 载入；无则空草案）
 * @param {string} flightKey 航班键（manual_fips.uuid）
 * @param {string} [templateId] 指定检查单类型；**不传**则取该航班最近一份草稿
 *        （草稿箱"继续编辑"只带航班键，类型要从草稿里读回来）
 * @returns {Promise<Object|null>} 载入的草稿记录（供调用方接着读 templateId）
 *
 * ⚠️ 无论有没有草稿，都要按"载入结果"整体替换内存 —— 找不到草稿就是空草案。
 *    否则上一个航班的填写会残留在内存里，新航班看到的/落盘的都成了别人的数据。
 */
export async function openDraft(flightKey, templateId) {
  if (!flightKey) return null
  memory.flightId = flightKey
  if (templateId) memory.templateId = templateId

  let rec = null
  try {
    rec = templateId
      ? await idbGet(draftKeyOf(flightKey, templateId))
      : pickLatest(await idbGetByFlight(flightKey))
  } catch (err) {
    console.warn('[checklistDraft] 读取 IndexedDB 草稿失败（按空草案继续）：', err)
  }

  memory.items = rec?.items || {}
  memory.videoItems = rec?.videoItems || {}
  memory.inspector = rec?.inspector || ''
  if (rec?.templateId) memory.templateId = rec.templateId
  lastDraftSig = null
  notify()
  return rec
}

/**
 * 用后端记录覆盖草案（打开已有记录时调用；记录优先于本地草稿）
 * 字段口径与后端一致：video_supervision → videoItems。
 */
export function hydrateFromRecord(record) {
  if (!record) return
  memory.items = record.items || {}
  memory.videoItems = record.video_supervision || {}
  memory.inspector = record.inspector || ''
  notify()
}

/** 清空填写内容（切换检查单类型时调用；保留上下文） */
export function clearMemory() {
  memory.items = {}
  memory.videoItems = {}
  memory.inspector = ''
  lastDraftSig = null
  clearTimeout(persistTimer)
  persistTimer = null
  notify()
}

/** 整体重置（离开检查单页 / reset() 时调用；上下文一并清空） */
export function hardReset() {
  clearMemory()
  memory.flightId = null
  memory.flightNo = ''
  memory.templateId = null
  setDraftStatus(false, null)
  notify()
}

/** 立即落盘（页面隐藏 / 卸载兜底），不改变写入规则 */
export function flushDraft() {
  clearTimeout(persistTimer)
  persistTimer = null
  persistNow()
}

/** 已提交/锁定 → 关闭草稿写入 */
export function setPersistEnabled(v) {
  persistEnabled = !!v
}

/** 删除一份草稿（草稿箱单条删；传草稿键，草稿箱索引由调用方同步删 draftStore） */
export async function removeIdbDraft(key) {
  if (!key) return
  try {
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const req = tx.objectStore(STORE_NAME).delete(key)
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn('[checklistDraft] 删除 IndexedDB 草稿失败：', err)
  }
}

/** 删除某航班的**全部**草稿（提交成功后调用：该航班所有检查单类型的草稿一并清） */
export async function removeIdbDraftsByFlight(flightKey) {
  if (!flightKey) return
  try {
    const list = await idbGetByFlight(flightKey)
    if (!list.length) return
    const db = await openDb()
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      list.forEach((r) => store.delete(r.key))
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('[checklistDraft] 删除航班的 IndexedDB 草稿失败：', err)
  }
}

/** 重置"上次落盘签名"（提交成功后调用，重新编辑时首笔改动要能再次落盘） */
export function resetTracking() {
  lastDraftSig = null
}

// ============================================================
// 细粒度订阅 hooks
// ============================================================

/**
 * 订阅单项填写数据（key = `main-{节点uuid}` / `aux-{辅助项uuid}`）
 * getSnapshot 只取自己那一项 → 其他项变化时引用不变，本组件不重渲染。
 */
export const useDraftItem = (key) =>
  useSyncExternalStore(subscribeDraft, () => memory.items[key] || null, () => memory.items[key] || null)

/** 订阅单个主监控节点（key = `main-{节点uuid}`） */
export const useMainItem = (nodeUuid) => useDraftItem(`main-${nodeUuid}`)

/** 订阅单个辅助监控项（key = `aux-${aux.uuid}`） */
export const useAuxItem = (key) => useDraftItem(key)

/** 订阅单项视频监管数据（key = 视频项 uuid） */
export const useVideoCheckItem = (uuid) =>
  useSyncExternalStore(subscribeDraft, () => memory.videoItems[uuid] || null, () => memory.videoItems[uuid] || null)

/**
 * 取单项视频项的写入器：(field, value) => void
 * 把通用 setVideoItemField 绑定 uuid 后返回；useCallback 保证引用稳定（memo 生效的前提）。
 */
export const useVideoCheckSetter = (uuid) => {
  return useCallback((field, value) => setVideoItemField(uuid, field, value), [uuid])
}

/** 草稿保存状态（draftPending / draftSavedAt，引用稳定）—— 工具栏 DraftStatus 用 */
export const useDraftStatus = () => useSyncExternalStore(subscribeDraft, getDraftStatus, getDraftStatus)

/** 草稿版本号（任何填写改动 +1）—— 引擎 / 流程图等"需要整份 items"的场景用 */
export const useDraftVersion = () => useSyncExternalStore(subscribeDraft, getDraftVersion, getDraftVersion)
