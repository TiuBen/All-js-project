/**
 * ============================================================
 * API 统一出口 —— 一个后端资源一个文件
 * ------------------------------------------------------------
 *   http.js       axios 实例 + 拦截器 + request 助手（底座）
 *                 ★ 航班数据源 source 也在这里统一拼（值从 utils/flightSource.js 取）
 *   fips.js       航班（/api/fips，读哪张表由 http.js 按当前数据源决定）
 *   checklist.js  检查单填写记录 + 截图上传（/api/checklist）
 *   special.js    生鲜保障台账（/api/special）
 *   setting.js    码表维护（/api/setting/airlines | airports）
 *   userLog.js    用户登录日志（/api/user-log，切换用户时写）
 *   user.js       值班员花名册（/api/user，检查单 / 台账 / 登录日志引用它）
 *
 * ★ 这里的方法与后端 test/all_http.txt 一一对应，后端没有的接口一律不提供。
 * ★ 数据源本身的读写（getSource / setSource）是纯本地缓存操作，不在本目录 ——
 *   见 utils/flightSource.js。
 *
 * 用法：`import { fipsApi, checklistApi } from '../api'`
 *       也可以按需直接从具体文件 import（如 `from '../api/fips'`）。
 * ============================================================
 */
export { API_BASE, request } from './http'
export { fipsApi } from './fips'
export { checklistApi } from './checklist'
export { specialApi } from './special'
export { settingApi, SETTING_KINDS } from './setting'
export { userLogApi } from './userLog'
export { userApi } from './user'
