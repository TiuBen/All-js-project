/**
 * ============================================================
 * checkImage —— 检查项截图（image）的纯数据工具
 * ------------------------------------------------------------
 * 纯进纯出（无 React、无 store），UI 与持久化两层共用同一套口径：
 *   BaseCheckInput（填写交互） · CheckImage（缩略图 / 大图） ·
 *   checklistDraft（落盘/签名） · checklistStore.buildPayload（提交后端） ·
 *   AuxiliaryList / VideoCheckView（只读展示）→ 现为查看页三个 CheckList
 *   （MainCheckList / AuxiliaryCheckList / VideoCheckList）
 *
 * 数据形状 —— **每个检查项最多 1 张**（不设计数组，业务上不需要）：
 *   null | {
 *     id,        // 图片身份（本地生成，用于 React key 与落盘签名）
 *     name,      // 文件名（截图粘贴时浏览器常给空名 → 兜底"截图.png"）
 *     type,      // image/png ...
 *     size,      // 字节数（仅元信息，可用于签名/展示）
 *     blob,      // 本地二进制：粘贴/选择得到，File 本身就是 Blob
 *     url,       // 上传到服务端后的地址（提交落库只带它）
 *   }
 *
 * ★ 三个关键约定：
 *   1. **不转 Base64**：Blob 直接进 IndexedDB（结构化克隆天然支持），
 *      Base64 会膨胀 ~33% 且让 JSONB / localStorage 变得又大又慢。
 *   2. **blob 与 url 二者可只存其一**：本地新建的图片只有 blob（离线可用），
 *      从后端读回的图片只有 url。
 *   3. **落库 / localStorage 只写元信息**（imageMeta）：二进制永远不进 JSON，
 *      否则 JSON.stringify(Blob) 会静默退化成 {}，图片无声消失。
 * ============================================================
 */

/** 截图粘贴时浏览器常给空文件名 → 兜底显示名 */
export const IMAGE_NAME_FALLBACK = '截图.png'

/** 单张截图的体积上限（8MB）：超过时提示用户，避免把草稿/提交撑爆 */
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024

/**
 * 生成图片 id
 * ⚠️ crypto.randomUUID 只在**安全上下文**可用（localhost / https）；
 *    局域网 IP（iPad 访问 http://192.168.x.x:5173）下它是 undefined，
 *    直接调用会抛错 → 这里带降级实现。
 */
export function newImageId() {
  const c = typeof crypto !== 'undefined' ? crypto : undefined
  if (typeof c?.randomUUID === 'function') return c.randomUUID()
  return `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** 是不是可用的图片文件（粘贴 / 拖拽 / 文件选择三处的统一判据） */
export const isImageFile = (file) => String(file?.type || '').startsWith('image/')

/**
 * 用户文件 → image 对象
 * File 本身就是 Blob 的一种，直接挂到 blob 字段（不再区分 file / blob 两个字段）
 * @param {File|Blob} file 图片文件
 * @param {string} [name] 显式文件名（拖拽/粘贴拿不到 name 时用）
 * @returns {Object|null} image；非图片返回 null
 */
export function imageFromFile(file, name) {
  if (!isImageFile(file)) return null
  return {
    id: newImageId(),
    name: name || file.name || IMAGE_NAME_FALLBACK,
    type: file.type || 'image/png',
    size: file.size || 0,
    blob: file,
  }
}

/**
 * 从剪贴板取图片文件（Ctrl+V 用）
 * 截图软件（Win+Shift+S / macOS ⌘⇧4）复制进来的是 image/png 的 Blob，
 * 通常没有文件名 —— imageFromFile 会补一个。
 * @param {DataTransfer} clipboardData event.clipboardData
 * @returns {File[]} 图片文件数组（可能为空 = 用户在粘普通文字）
 */
export function filesFromClipboard(clipboardData) {
  const out = []
  const items = clipboardData?.items
  if (items && items.length) {
    for (const it of items) {
      if (!String(it.type || '').startsWith('image/')) continue
      const f = it.getAsFile?.()
      if (f) out.push(f)
    }
  }
  // 兜底：个别浏览器只填 files 不填 items
  if (!out.length && clipboardData?.files?.length) {
    out.push(...Array.from(clipboardData.files).filter(isImageFile))
  }
  return out
}

/** 从拖拽事件取图片文件（拖图片/文件进来） */
export const filesFromDataTransfer = (dataTransfer) =>
  Array.from(dataTransfer?.files || []).filter(isImageFile)

/**
 * 去掉二进制，只留元信息 —— 落库 payload / localStorage 草稿箱专用
 * @returns {Object|null} { id, name, type, size, url? }
 */
export function imageMeta(image) {
  if (!image) return null
  const { blob, ...meta } = image
  return meta
}

/**
 * 落盘签名（判断"这张图变了没有"）
 * ⚠️ 不能直接用 JSON.stringify(image)：Blob 会被序列化成 {}，
 *    两张不同的截图会得到同一个签名 → 落盘被误判为"没变化"而跳过。
 */
export function imageSig(image) {
  if (!image) return ''
  return [image.id, image.type, image.size, image.url || 'blob'].join(':')
}

/** 只留元信息、且剥掉未上传的本地二进制（数据流：提交前） */
export const hasBinary = (image) => !!image?.blob

/** 可展示的图片来源：服务端 url 优先，否则由调用方用 blob 建 objectURL */
export const imageUrl = (image) => image?.url || null
