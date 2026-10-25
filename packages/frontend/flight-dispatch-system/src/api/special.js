/**
 * ============================================================
 * special 资源 —— 生鲜航班保障节点台账
 * ------------------------------------------------------------
 * 后端路由：/api/special（对齐后端 test/all_http.txt）
 * 落地表：records_special（主键 id 是整数自增）
 *
 *   GET    /api/special?id=&flightUuid=&callsign=&date=&from=&to=
 *   GET    /api/special/:id
 *   POST   /api/special                新增（必填 callsign；可选 nodes / flightUuid）
 *   PUT    /api/special/:id            更新（局部；nodes 传 null 表示清空该列）
 *   DELETE /api/special/:id
 *
 * ★ 表里**没有 belongTime 列**（归属日期不再入库，分天按 createTime 的北京日算），
 *   也没有业务唯一约束 —— 所以 POST 永远新增，要覆盖必须带 id 走 PUT。
 *   → 「同一航班同一天只有一条」这件事由调用方（specialStore）自己判定：
 *     命中已有行就 update，否则 create。
 *
 * ★ 节点内容整包放在 **nodes**（JSONB）里，键名就是库列名（callsign / nodes）。
 *   行上的 createdDate / updateDate 是后端补的北京日，source / flight_uuid
 *   由外键列反推（没有关联航班时为 null）。
 * ============================================================
 */
import { request } from './http'

export const specialApi = {
  /**
   * 台账列表
   * @param {{id?:string, flightUuid?:string, callsign?:string,
   *          date?:string, from?:string, to?:string}} [params]
   * @returns {Promise<{total:number, items:Array}>}
   */
  list: (params = {}) => request('get', '/special', { params }),

  /** 单条详情（按主键 id） */
  get: (id) => request('get', `/special/${encodeURIComponent(id)}`),

  /** 新增一条台账（callsign 必填；nodes 缺省为 {}；可选 flightUuid 关联航班） */
  create: (data) => request('post', '/special', { data }),

  /** 更新（只更新传入字段；显式传 null 可清空 nodes） */
  update: (id, data) => request('put', `/special/${encodeURIComponent(id)}`, { data }),

  /** 删除（按主键） */
  remove: (id) => request('delete', `/special/${encodeURIComponent(id)}`),
}
