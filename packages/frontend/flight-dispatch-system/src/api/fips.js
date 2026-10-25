/**
 * ============================================================
 * fips 资源 —— 航班（三张航班表共用一个入口）
 * ------------------------------------------------------------
 * 后端路由：/api/fips（对齐后端 test/all_http.txt）
 *
 *   GET    /api/fips                列表
 *   GET    /api/fips/:id            详情
 *   POST   /api/fips                新增（固定落 manual_fips）
 *   PUT    /api/fips/:id            更新（固定写 manual_fips）
 *   DELETE /api/fips/:id            删除（固定落 manual_fips）
 *
 * ★ source（读哪张表）**不由本文件拼** —— 统一交给 api/http.js 的请求拦截器：
 *     GET  → 当前数据源（本地缓存，默认 ecyilang，见 config/dataSource.js）
 *     DELETE → 强制 manual_fips；POST/PUT → 不带 source
 *   所以这里的函数签名里没有 source 参数，调用方也不用关心。
 *
 * ★ 行形状：三个源都返回**平铺的表格行**（flight_no / sobt / is_fresh …，
 *   对应 FipsPage 的列 key）。
 * ============================================================
 */
import { request } from './http'

export const fipsApi = {
  /**
   * 航班列表（读哪张表由 http.js 按当前数据源决定）
   * @param {{date?:string, from?:string, to?:string}} [params] 日期过滤
   * @returns {Promise<{source:string, total:number, items:Array}>}
   */
  list: (params = {}) => request('get', '/fips', { params }),

  /** 单条航班（返回含 checklistCount / specialCount / is_fresh 的投影） */
  get: (id) => request('get', `/fips/${encodeURIComponent(id)}`),

  /** 新增手动航班（落 manual_fips 表；来源 source 由后端写死） */
  create: (data) => request('post', '/fips', { data }),

  /** 更新手动航班（局部更新，只写 manual_fips 表） */
  update: (id, data) => request('put', `/fips/${encodeURIComponent(id)}`, { data }),

  /** 删除手动航班（同一事务里先清子表检查单 / 生鲜台账，再删航班） */
  remove: (id) => request('delete', `/fips/${encodeURIComponent(id)}`),
}
