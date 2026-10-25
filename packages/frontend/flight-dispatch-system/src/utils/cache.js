/**
 * ============================================================
 * cache —— 浏览器本地缓存工具层（全部基于 IndexedDB，零依赖）
 * ------------------------------------------------------------
 * 只做「最薄的一层」：打开库、按键读写删，不掺杂任何业务概念。
 * 业务语义（草稿、整理数据、提交）在 store/cache.store.js 里组织；
 * 组件也只允许走 store/cache.store.js，**不要直接 import 本文件** ——
 * 这样以后想换存储实现（比如换成后端暂存接口），只改这两层即可。
 *
 * 库结构（库名 / store 名改这里即可，上下游不用动）：
 *   - drafts：草稿元信息 { uuid, note, images: [{id,name,type,size}], ... }
 *   - images：图片二进制 Blob（结构化克隆原生支持 Blob，绝不转 Base64）
 *
 *   现在正文按「草稿键::节点 uuid」一条条存，见 utils/checklistCache.js 的键规则。
 *
 * 注意：预览用的 objectURL 只活在内存里，本层不落库也不管理。
 * ============================================================
 */

const DB_NAME = "mutil-type-input-cache";
const DB_VERSION = 1;
const DRAFT_STORE = "drafts"; // 主键 keyPath: uuid
const IMAGE_STORE = "images"; // 主键：图片 id（out-of-line key，值就是 Blob）

let dbPromise = null;

/**
 * 单例打开数据库（内部用）。
 * 升级被其他页面阻塞时明确报错，避免静默卡死（用户开着两个标签页时常见）。
 */
function openDB() {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;

            if (!db.objectStoreNames.contains(DRAFT_STORE)) {
                db.createObjectStore(DRAFT_STORE, { keyPath: "uuid" });
            }

            if (!db.objectStoreNames.contains(IMAGE_STORE)) {
                db.createObjectStore(IMAGE_STORE);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
            dbPromise = null;
            reject(request.error);
        };
        request.onblocked = () => {
            dbPromise = null;
            reject(new Error("本地数据库升级被其他页面阻塞，请关闭其他标签页后重试"));
        };
    });

    return dbPromise;
}

/** 把 IDBRequest 包成 Promise，省得每个函数都手写 onsuccess / onerror（内部用） */
function toPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ============================================================
// 草稿（文字 + 图片元信息）
// ============================================================

/**
 * 读一条草稿，不存在返回 undefined。
 * @usedBy store/cache.store.js（initItem 恢复本地草稿）
 * @param {string} uuid 草稿键（= 「草稿键::节点 uuid」，由 checklistCache 拼）
 */
export async function getDraft(uuid) {
    const db = await openDB();
    return toPromise(db.transaction(DRAFT_STORE, "readonly").objectStore(DRAFT_STORE).get(uuid));
}

/**
 * 写一条草稿（整条覆盖，uuid 相同即更新）。
 * @usedBy store/cache.store.js（防抖落库 / 失焦落库 / 卸载兜底 flushItem）
 * @param {{uuid:string}} record 整条记录
 */
export async function putDraft(record) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(DRAFT_STORE, "readwrite");

        tx.objectStore(DRAFT_STORE).put(record);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

/**
 * 删除一条草稿（不删图片 Blob，图片由调用方按 id 自己清）。
 * @usedBy store/cache.store.js（清空单个填写项）
 * @param {string} uuid
 */
export async function deleteDraft(uuid) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(DRAFT_STORE, "readwrite");

        tx.objectStore(DRAFT_STORE).delete(uuid);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

/**
 * 读全部草稿（按前缀过滤 / 收集整份草稿时用）。
 * @usedBy store/cache.store.js（collectByPrefix / hasLocalData / clearByPrefix）
 */
export async function getAllDrafts() {
    const db = await openDB();
    return toPromise(db.transaction(DRAFT_STORE, "readonly").objectStore(DRAFT_STORE).getAll());
}

// ============================================================
// 图片（Blob，按图片 id 存取）
// ============================================================

/**
 * 存一张图片的二进制。
 * @usedBy store/cache.store.js（addImage，粘贴 / 拖拽 / 选择三来源统一入口）
 * @param {string} id   图片 id
 * @param {Blob} blob   图片二进制（绝不转 Base64）
 */
export async function putImage(id, blob) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(IMAGE_STORE, "readwrite");

        tx.objectStore(IMAGE_STORE).put(blob, id);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

/**
 * 取一张图片的二进制。
 * @usedBy store/cache.store.js（initItem 恢复图片，现造 objectURL 预览）
 * @param {string} id
 * @returns {Promise<Blob|undefined>}
 */
export async function getImage(id) {
    const db = await openDB();
    return toPromise(db.transaction(IMAGE_STORE, "readonly").objectStore(IMAGE_STORE).get(id));
}

/**
 * 删一张图片的二进制。
 * @usedBy store/cache.store.js（removeImage / submit 后清理）
 * @param {string} id
 */
export async function deleteImage(id) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(IMAGE_STORE, "readwrite");

        tx.objectStore(IMAGE_STORE).delete(id);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}
