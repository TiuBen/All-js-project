/**
 * ============================================================
 * checklist 资源 —— 检查单填写记录 + 检查项截图上传
 * ------------------------------------------------------------
 * 后端路由：/api/checklist（对齐后端 test/all_http.txt）
 * 落地表：records_checklist（主键 id 是**整数自增**，不是 uuid）
 *
 *   GET    /api/checklist?flightUuid=&callsign=&category=&date=&from=&to=
 *   GET    /api/checklist/:id
 *   POST   /api/checklist                      永远 INSERT 一条新记录
 *   POST   /api/checklist/uploads?name=x.png   上传截图（原始二进制）
 *   PUT    /api/checklist/:id                  只改这一条
 *   PATCH  /api/checklist/:id                  同上（同一 handler）
 *   DELETE /api/checklist/:id
 *
 * ★ 这里**没有 source 参数**（也不该有）：records_checklist 自己就带三个航班外键
 *   （fips_uuid / ecyilang_uuid / manual_fips_uuid），归属哪张表由写入时的
 *   flightUuid 决定、由后端归一成 source 随行返回；列表筛的是航班 / 航班号 /
 *   类型 / 创建日，跟"当前数据源"无关。
 *   api/http.js 注入 source 只针对 /api/fips —— 那才是三张表共用一个路由、
 *   必须靠参数区分读哪张的地方。这里硬塞 source 只会被后端静默忽略。
 * ============================================================
 */
import { request, rawRequest } from './http'

export const checklistApi = {
  /**
   * 填写记录列表
   * @param {{flightUuid?:string, callsign?:string, category?:string,
   *          date?:string, from?:string, to?:string}} [params]
   * @returns {Promise<{total:number, items:Array}>}
   */
  list: (params = {}) => request('get', '/checklist', { params }),

  /** 单条记录 */
  get: (id) => request('get', `/checklist/${encodeURIComponent(id)}`),

  /** 新建记录（必填 checklistCategory；可选 flightUuid / callsign / items…） */
  create: (data) => request('post', '/checklist', { data }),

  /** 更新记录（局部更新；已提交超 24h 回 409） */
  update: (id, data) => request('put', `/checklist/${encodeURIComponent(id)}`, { data }),

  /** 更新记录（PATCH 别名，与 PUT 同一 handler） */
  patch: (id, data) => request('patch', `/checklist/${encodeURIComponent(id)}`, { data }),

  /** 删除记录（只删这一条） */
  remove: (id) => request('delete', `/checklist/${encodeURIComponent(id)}`),

  /**
   * 上传检查项截图：请求体就是图片**原始二进制**（不走 Base64、不用 FormData）
   * ⚠️ Content-Type 必须是 image/*，后端只对这个类型走 express.raw；
   *    类型不对就解析不出 req.body（所以这里不能用默认的 application/json）。
   * @param {Blob} blob 图片二进制（粘贴 / 选中的截图）
   * @param {string} [name] 原始文件名（仅用于展示与类型兜底）
   * @returns {Promise<{url:string, name:string, type:string, size:number}>}
   */
  uploadImage: async (blob, name = '') => {
    const res = await rawRequest('post', '/checklist/uploads', {
      params: { name },
      data: blob,
      headers: { 'Content-Type': blob.type || 'image/png' },
    })
    return res.data
  },
}
