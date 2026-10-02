/**
 * ============================================================
 * 航班列表数据源开关
 * ------------------------------------------------------------
 * 由构建模式对应的环境变量决定（编译期常量，运行期不会变）：
 *   - pnpm dev / build        VITE_FLIGHT_SOURCE 未设置 → manual
 *                             → manual_fips 表（手动添加航班，可增删改）
 *   - pnpm testWW             .env.testWW 设 VITE_FLIGHT_SOURCE=ecyilang
 *                             → ecyilang 表（航班计划抓包快照，只读）
 *
 * 页面/Store 不直接读 import.meta.env，统一从这里取，避免开关散落各处。
 * ============================================================
 */

/** 原始环境变量值 */
const RAW_SOURCE = import.meta.env.VITE_FLIGHT_SOURCE

/** 归一化后的数据源标识：'ecyilang' | 'manual' */
export const FLIGHT_SOURCE = RAW_SOURCE === 'ecyilang' ? 'ecyilang' : 'manual'

/** 是否使用 ecyilang（航班计划）数据源 */
export const IS_ECYILANG = FLIGHT_SOURCE === 'ecyilang'

/** 该数据源是否只读（快照数据不允许在前端增删改） */
export const IS_READONLY_SOURCE = IS_ECYILANG

/** 侧边栏底部展示的数据源说明 */
export const FLIGHT_SOURCE_LABEL = IS_ECYILANG
    ? '数据源：后端航班计划（ecyilang）'
    : '数据源：手动添加航班'

/** 只读数据源上执行写操作时的提示语 */
export const READONLY_HINT = IS_ECYILANG
    ? '当前为航班计划快照（只读），不能增删改航班'
    : ''
