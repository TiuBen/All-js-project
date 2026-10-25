/**
 * ============================================================
 * checkImage —— 检查项截图（image）的纯数据工具
 * ------------------------------------------------------------
 * 纯进纯出（无 React、无 store）：
 *   把「粘贴 / 拖拽 / 文件选择」拿到的 File 统一成前端内部用的 image 对象。
 *
 * 数据形状（每项可多张，images 是数组，见 cache.store 的 addImage）：
 *   { id, name, type, size, blob, url? }
 *     id    图片身份（本地生成，React key / 删除时按它对上）
 *     blob  本地二进制（粘贴 / 选择得到，File 本身就是 Blob）
 *     url   上传到服务端后的地址（提交落库只带它）
 *
 * ★ 不转 Base64：Blob 直接进 IndexedDB（结构化克隆天然支持），
 *   Base64 会膨胀 ~33% 且让 JSON 变得又大又慢。
 * ★ blob 与 url 二者可只存其一：本地新建的只有 blob（离线可用），
 *   从后端读回的只有 url。
 *
 *     现在的持久化由 store/cache.store.js 直接整条写 IndexedDB，不再需要。
 * ============================================================
 */

/** 截图粘贴时浏览器常给空文件名 → 兜底显示名（内部用） */
const IMAGE_NAME_FALLBACK = "截图.png";

/**
 * 生成图片 id（内部用）。
 * ⚠️ crypto.randomUUID 只在**安全上下文**可用（localhost / https）；
 *    局域网 IP（iPad 访问 http://192.168.x.x:5173）下它是 undefined，
 *    直接调用会抛错 → 这里带降级实现。
 */
function newImageId() {
    const c = typeof crypto !== "undefined" ? crypto : undefined;
    if (typeof c?.randomUUID === "function") return c.randomUUID();
    return `img-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 是不是可用的图片文件（三来源的统一判据，内部用） */
const isImageFile = (file) => String(file?.type || "").startsWith("image/");

/**
 * 单张截图的体积上限（8MB）：超过时提示用户，避免把草稿撑爆。
 * @usedBy components/BaseCheckInput.jsx（acceptImage 里判大小并给常驻提示）
 */
export const IMAGE_MAX_BYTES = 8 * 1024 * 1024;

/**
 * 用户文件 → image 对象（File 本身就是 Blob，直接挂到 blob 字段）。
 * @usedBy components/BaseCheckInput.jsx（acceptImage：通过校验后转成 image 交给 store）
 * @param {File|Blob} file 图片文件
 * @param {string} [name] 显式文件名（拖拽/粘贴拿不到 name 时用）
 * @returns {Object|null} image；非图片返回 null
 */
export function imageFromFile(file, name) {
    if (!isImageFile(file)) return null;
    return {
        id: newImageId(),
        name: name || file.name || IMAGE_NAME_FALLBACK,
        type: file.type || "image/png",
        size: file.size || 0,
        blob: file,
    };
}

/**
 * 从剪贴板取图片文件（Ctrl+V 用）。
 * 截图软件复制进来的是 image/png 的 Blob，通常没有文件名 —— imageFromFile 会补一个。
 * @usedBy components/BaseCheckInput.jsx（handlePaste：纯文字粘贴原样交给 textarea）
 * @param {DataTransfer} clipboardData event.clipboardData
 * @returns {File[]} 图片文件数组（空 = 用户在粘普通文字）
 */
export function filesFromClipboard(clipboardData) {
    const out = [];
    const items = clipboardData?.items;
    if (items && items.length) {
        for (const it of items) {
            if (!String(it.type || "").startsWith("image/")) continue;
            const f = it.getAsFile?.();
            if (f) out.push(f);
        }
    }
    // 兜底：个别浏览器只填 files 不填 items
    if (!out.length && clipboardData?.files?.length) {
        out.push(...Array.from(clipboardData.files).filter(isImageFile));
    }
    return out;
}

/**
 * 从拖拽事件取图片文件（拖图片/文件进来）。
 * @usedBy components/BaseCheckInput.jsx（handleDrop）
 * @param {DataTransfer} dataTransfer event.dataTransfer
 * @returns {File[]}
 */
export const filesFromDataTransfer = (dataTransfer) => Array.from(dataTransfer?.files || []).filter(isImageFile);
