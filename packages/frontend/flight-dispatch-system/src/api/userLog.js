/**
 * ============================================================
 * userLog 资源 —— 用户登录日志（谁在什么时间登录 / 登出）
 * ------------------------------------------------------------
 * 后端路由：/api/user-log（对齐后端 test/all_http.txt）
 * 落地表：user_login_log（主键 id 是整数自增）
 *
 *   GET    /api/user-log?username=&date=&from=&to=
 *   GET    /api/user-log/:id
 *   POST   /api/user-log                登录（必填 username）
 *   POST   /api/user-log/:id/logout     登出（服务端盖 logout_time）
 *   DELETE /api/user-log/:id
 *
 * ★ 一趟「切换用户」是**两个请求**：先 logout(上一场的 id) 再 login(新人)。
 *   所以前端必须把登录返回的 id 存住 —— 就存在 app.store 的 loginLogId 里
 *   （见那边 login / logout 两个 action），刷新页面也不该丢，否则这一场
 *   就永远盖不上 logout_time。
 *
 * ★ 没有 update：时间列不让客户端改。login_time 由数据库 now() 盖，
 *   logout_time 只走 logout 这一个动作（时间由服务端决定，不吃本机时钟）。
 *
 * ★ 行上的字段名 = 库里的原始列名：login_time / logout_time（带时区的绝对时刻），
 *   后端另补 loginDate / logoutDate（北京日）方便分天。
 * ============================================================
 */
import { request } from './http'

export const userLogApi = {
  /**
   * 日志列表
   * @param {{username?:string, date?:string, from?:string, to?:string}} [params]
   *        date 口径 = login_time 的北京日
   * @returns {Promise<{total:number, items:Array}>}
   */
  list: (params = {}) => request('get', '/user-log', { params }),

  /** 单条日志（按主键 id） */
  get: (id) => request('get', `/user-log/${encodeURIComponent(id)}`),

  /**
   * 登录：新增一行（不要传时间，服务端盖）
   * @param {{username:string}} data
   * @returns {Promise<{id:number, username:string, login_time:string, logout_time:null}>}
   */
  login: (data) => request('post', '/user-log', { data }),

  /**
   * 登出：给这一场盖上 logout_time（服务端时间）
   * @param {number|string} id 登录时拿到的行 id
   * @returns {Promise<Object>} 更新后的整行；重复登出 → 409
   */
  logout: (id) => request('post', `/user-log/${encodeURIComponent(id)}/logout`),

  /** 删除单条日志（清理用） */
  remove: (id) => request('delete', `/user-log/${encodeURIComponent(id)}`),
}
