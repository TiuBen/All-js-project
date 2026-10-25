/**
 * ============================================================
 * user 资源 —— 值班员花名册（检查单 / 台账 / 登录日志的检查人都指向它）
 * ------------------------------------------------------------
 * 后端路由：/api/user（对齐后端 test/all_http.txt）
 * 落地表：user（主键 id 整数自增，name 唯一）
 *
 *   GET    /api/user?name=     列表（name 模糊筛；按 id 升序）
 *   GET    /api/user/:id       单个
 *   POST   /api/user           新增 { name, telephone? }；重名 → 409
 *   PUT    /api/user/:id       更新（局部更新）
 *   DELETE /api/user/:id       删除；被检查单 / 台账 / 登录日志引用 → 409
 *
 * ★ 行字段：{ id, name, telephone }（= 库里原始列名）。
 * ★ 检查单 / 台账写 inspectorId（user 的 id）即可，后端校验存在性；
 *   读记录时行上带 inspector 对象（{ id, name, telephone }），显示用 inspector.name。
 * ============================================================
 */
import { request } from './http'

export const userApi = {
  /**
   * 花名册列表
   * @param {{name?:string}} [params] name 模糊筛
   * @returns {Promise<{total:number, items:Array<{id:number,name:string,telephone:string|null}>}>}
   */
  list: (params = {}) => request('get', '/user', { params }),

  /** 单个用户（按主键 id） */
  get: (id) => request('get', `/user/${encodeURIComponent(id)}`),

  /** 新增 { name, telephone? }；重名 → 409 */
  create: (data) => request('post', '/user', { data }),

  /** 更新（局部更新；没传的键不动） */
  update: (id, data) => request('put', `/user/${encodeURIComponent(id)}`, { data }),

  /** 删除；被检查单 / 台账 / 登录日志引用 → 409 */
  remove: (id) => request('delete', `/user/${encodeURIComponent(id)}`),
}
