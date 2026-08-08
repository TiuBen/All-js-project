/**
 * ============================================================
 * 异步路由处理器包装器
 * ------------------------------------------------------------
 * Express 4 的 async 路由抛出的异常不会自动进入错误中间件，
 * 统一用本包装器捕获并交给 next(err)，由全局错误处理器兜底。
 *
 * 用法：
 *   router.get('/', asyncHandler(async (req, res) => {
 *     const data = await service.list();
 *     res.json(data);
 *   }));
 * ============================================================
 */

/**
 * 包装异步处理函数，自动捕获异常
 * @param {Function} fn 异步处理函数 (req, res, next) => Promise
 * @returns {Function} 包装后的中间件
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
