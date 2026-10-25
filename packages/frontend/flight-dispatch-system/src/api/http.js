/**
 * ============================================================
 * axios 实例 —— 全站唯一的 HTTP 客户端（api 目录的底座）
 * ------------------------------------------------------------
 * ★ 航班数据源（source）全部在这里拼 —— 资源模块（fips.js …）一律不传：
 *     GET    /api/fips[/:id]  → source = 当前数据源（读本地缓存，默认 ecyilang）
 *     DELETE /api/fips/:id    → source = manual_fips（硬编码：删除只落 manual_fips）
 *     POST / PUT /api/fips    → 不带 source（后端固定写 manual_fips）
 *   这样「哪张表」只有一个决定点，不会因为某个调用方漏传 / 传错而打到别的表上。
 *
 * ★ 「当前数据源是谁 / 怎么切」不归这里管 —— 那是纯本地缓存读写，在
 *   utils/flightSource.js（getSource / setSource）。本文件每次发请求现读，
 *   所以切源之后不需要刷新页面，下一个请求就是新源。
 *
 * ★ 只有 /api/fips 需要注入 source，别的资源一律不加：
 *     三张航班表**共用一个路由**，不靠参数说不了读哪张 —— 这是 fips 独有的问题；
 *     /api/checklist（记录自带航班外键，筛的是航班号 / 类型 / 创建日）、
 *     /api/special（生鲜台账）、/api/setting/*（码表）都跟"当前数据源"无关，
 *     后端也不读它们的 source —— 硬塞只会被静默忽略，反而让人以为筛过了。
 *
 * ★ 响应拦截器：后端的错误体统一是 { error: "说明" }，
 *   这里直接抛成 Error（消息取 error 字段），调用方只管 try/catch。
 *
 * 地址：开发环境用相对路径 /api（vite proxy → localhost:5183）；
 *       生产构建可用 VITE_API_BASE 覆盖（如 https://x/api）。
 * ============================================================
 */
import axios from 'axios'
import { WRITABLE_FLIGHT_SOURCE } from '../config/dataSource'
import { getSource } from '../utils/flightSource'

/** 后端 API 前缀 */
export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

/** 正则里的特殊字符转义（API_BASE 可被环境变量覆盖，不能直接拼进正则） */
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** 命中「航班列表」与「单条航班」的 URL（与 API_BASE 联动，改前缀不用改这段） */
const FIPS_LIST_RE = new RegExp(`^${escapeRe(API_BASE)}/fips$`)
const FIPS_ITEM_RE = new RegExp(`^${escapeRe(API_BASE)}/fips/[^/]+$`)

const http = axios.create({ baseURL: '/' })

http.interceptors.request.use((config) => {
  const method = (config.method || '').toLowerCase()
  const url = config.url || ''

  // /api/fips 的 source 一律在这里拼，资源模块不传
  if (FIPS_LIST_RE.test(url) || FIPS_ITEM_RE.test(url)) {
    const params = { ...(config.params || {}) }

    if (method === 'get') {
      // 读：用当前数据源（本地缓存，默认 ecyilang）
      params.source = getSource()
    } else if (method === 'delete') {
      // 删：写接口只落 manual_fips，无条件覆盖 —— 不给误删别的表的机会
      params.source = WRITABLE_FLIGHT_SOURCE
    } else {
      // 增 / 改：后端固定写 manual_fips，不收 source（调用方多传的也丢掉）
      delete params.source
    }

    config.params = params
  }

  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error || err.message || `HTTP ${err.response?.status ?? '?'}`
    const wrapped = new Error(message)
    wrapped.status = err.response?.status
    wrapped.data = err.response?.data
    return Promise.reject(wrapped)
  },
)

/**
 * 发一次请求，直接拿响应体（各资源模块只用它）
 * @param {'get'|'post'|'put'|'patch'|'delete'} method
 * @param {string} path   API_BASE 之后的路径（形如 '/fips/xxx'）
 * @param {{params?:Object, data?:any, headers?:Object}} [options]
 *        params → 查询串（axios 自动跳过 undefined / null）
 * @returns {Promise<any>} 解析后的 JSON
 */
export async function request(method, path, options = {}) {
  const { params, data, headers } = options
  const res = await http.request({ method, url: `${API_BASE}${path}`, params, data, headers })
  return res.data
}

/**
 * 发一次请求，返回原始响应（上传图片这类需要看 header / status 的场景）
 */
export const rawRequest = (method, path, options = {}) => {
  const { params, data, headers } = options
  return http.request({ method, url: `${API_BASE}${path}`, params, data, headers })
}

export default http
