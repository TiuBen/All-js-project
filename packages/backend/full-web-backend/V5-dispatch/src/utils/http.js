/**
 * ============================================================
 * HTTP 层小工具：错误类型 + 异步包装
 * ------------------------------------------------------------
 * service / controller 里**抛** HttpError 来表达「该回什么状态码」，
 * 业务代码不用到处写 res.status(4xx).json(...)；
 * server.js 的全局错误中间件统一读 err.status 落成 JSON。
 * ============================================================
 */

export class HttpError extends Error {
  /**
   * @param {number} status HTTP 状态码
   * @param {string} message 客户端可见的说明
   */
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const badRequest = (message) => new HttpError(400, message);
export const notFound = (message) => new HttpError(404, message);
export const methodNotAllowed = (message) => new HttpError(405, message);
export const conflict = (message) => new HttpError(409, message);
export const payloadTooLarge = (message) => new HttpError(413, message);
export const unsupportedMedia = (message) => new HttpError(415, message);

/** Prisma：update / delete 没命中记录 */
export const isRecordNotFound = (err) => err?.code === 'P2025';
/** 唯一约束冲突：Prisma P2002 / PG 原生 23505 */
export const isUniqueViolation = (err) => err?.code === 'P2002' || err?.code === '23505';

/**
 * 唯一约束冲突 → 给客户端的说明
 * ⚠️ 实测 Prisma 7 + driver adapter 下 **`meta.target` 拿不到列名**：
 *    meta 里只有 `driverAdapterError.cause.{originalCode:23505, originalMessage:'…违反唯一约束"xxx_key"'}`
 *    （约束名，不是列名），所以实际落到通用文案。target 分支留给将来能拿到列名的情况。
 */
export function uniqueConflictMessage(err) {
  const target = err?.meta?.target;
  const hit = Array.isArray(target) ? target.join(' / ') : target;
  return hit ? `${hit} 已存在（唯一约束）` : '该记录已存在（唯一约束冲突）';
}

/**
 * 包住 async 路由处理器，把 reject 丢给全局错误中间件
 * （Express 4 不会自动 catch promise，没有这层就得每个 handler 写 try/catch）
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
