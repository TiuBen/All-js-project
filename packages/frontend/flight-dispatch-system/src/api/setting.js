/**
 * ============================================================
 * setting 资源 —— 码表维护（航司码 / 机场码）
 * ------------------------------------------------------------
 * 后端路由：/api/setting/:kind（对齐后端 test/all_http.txt）
 *
 *   kind 只有两个合法值（其它值后端回 404）：
 *     airlines → airplane_company_name_code  航司码
 *     airports → airport_name_code           机场码
 *
 *   GET    /api/setting/:kind?q=     列表（q 模糊匹配中文名 / 英文名 / IATA / ICAO）
 *   GET    /api/setting/:kind/:id    单条（:id 整数自增主键）
 *   POST   /api/setting/:kind        新增
 *   PUT    /api/setting/:kind/:id    更新（局部；显式传 null / 空串清空该列）
 *   DELETE /api/setting/:kind/:id    删除（不存在也回 200）
 *
 * ★ 字段名 = **数据库原始列名**，不做驼峰转换：
 *     airlines  id / chinese_airplane_company_name / airplane_company_iata_code / airplane_company_icao_code
 *     airports  id / chinese_airport_name / english_airport_name / airport_iata_code / airport_icao_code
 * ★ 唯一性由数据库 UNIQUE 约束把关（每张表 3 个唯一列），撞了统一回 409。
 * ============================================================
 */
import { request } from './http'

/** 码表种类 */
export const SETTING_KINDS = ['airlines', 'airports']

export const settingApi = {
  /**
   * 码表列表
   * @param {'airlines'|'airports'} kind
   * @param {{q?:string}} [params] q 命中中文名 / 英文名 / IATA / ICAO 任一即可
   * @returns {Promise<{total:number, items:Array}>}
   */
  list: (kind, params = {}) => request('get', `/setting/${kind}`, { params }),

  /** 单条 */
  get: (kind, id) => request('get', `/setting/${kind}/${encodeURIComponent(id)}`),

  /** 新增（中文名列必填；重复 → 409） */
  create: (kind, data) => request('post', `/setting/${kind}`, { data }),

  /** 更新（局部更新） */
  update: (kind, id, data) =>
    request('put', `/setting/${kind}/${encodeURIComponent(id)}`, { data }),

  /** 删除 */
  remove: (kind, id) => request('delete', `/setting/${kind}/${encodeURIComponent(id)}`),
}
