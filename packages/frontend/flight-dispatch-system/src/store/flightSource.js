/**
 * ============================================================
 * 航班列表「数据源」统一出口
 * ------------------------------------------------------------
 * 页面与 Store 只从这里取航班列表的 store / HTTP 客户端，
 * 不直接 import 具体某一个（manualFipsStore 或 ecyilangStore），
 * 这样新增数据源时只需改 dataSource.js 与本文件。
 *
 * 当前两种源（编译期二选一，见 config/dataSource.js）：
 *   manual   → manual_fips 表，可增删改
 *   ecyilang → ecyilang 表（航班计划快照），只读
 * ============================================================
 */
import { IS_ECYILANG, IS_READONLY_SOURCE, FLIGHT_SOURCE_LABEL, READONLY_HINT } from '../config/dataSource'
import { manualFipsApi, ecyilangApi } from '../api'
import { useManualFipsStore } from './manualFipsStore'
import { useEcyilangStore } from './ecyilangStore'

export { FLIGHT_SOURCE_LABEL, IS_READONLY_SOURCE, READONLY_HINT }

/** 当前生效的航班列表 store（两种 store 的对外接口一致） */
export const useFlightStore = IS_ECYILANG ? useEcyilangStore : useManualFipsStore

/**
 * 当前生效的航班列表 HTTP 客户端
 * ⚠️ list() 必须返回 { items } —— checklistStore 反查航班时依赖这个形状。
 *    ecyilang 的接口名是 /flights，这里做一层别名适配。
 */
export const flightSourceApi = IS_ECYILANG
  ? {
      list: () => ecyilangApi.listFlights(),
      create: ecyilangApi.create,
      update: ecyilangApi.update,
      remove: ecyilangApi.remove,
    }
  : manualFipsApi
