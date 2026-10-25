/**
 * ============================================================
 * ecyilang → fips 形状（只在响应出口翻一次）
 * ------------------------------------------------------------
 * ecyilang 是**快照**表：一行 = 本站的一离一进两条航段
 *   d_* = 本站起飞那条腿（d_name 是它的目的地）
 *   a_* = 前方飞来本站落地那条腿（a_name 是它的前方机场）
 * 两侧可能只有一侧有值 → 一行快照最多翻成**两条** fips 形状的行（leg = 'd' | 'a'）。
 *
 * 翻出来的行 = fips 的列（取不到就是 null）+ service 的包装字段
 * （source / uuid / checklistCount / specialCount / is_fresh / fresh_content）+ leg。
 * ecyilang 独有的列（d_state_name / d_country_type / k_h …）字典里 fips_key 为 null，
 * 表示没有对应的 fips 列，不进响应。
 *
 * 用法（见 controllers/fipsController.js）：
 *   if (data.source === 'ecyilang') data.items = ecyilangToFips(data.items)
 * ============================================================
 */
import { wallDay, wallMinute } from './date.js'

/** fips / manual_fips 两张表的列（manual_fips 是 fips 去掉来源列的子集） */
const FIPS_KeyNames = {
    id: 'id',
    task: 'task',
    flight_no: 'flight_no',
    origin_station: 'origin_station',
    dest_station: 'dest_station',
    landing_station: 'landing_station',
    in_out_time: 'in_out_time',
    sobt: 'sobt',
    eobt: 'eobt',
    atot: 'atot',
    sibt: 'sibt',
    eldt: 'eldt',
    aldt: 'aldt',
    corridor: 'corridor',
    runway: 'runway',
    stand: 'stand',
    aircraft_type: 'aircraft_type',
    source_file: 'source_file',
    source_date: 'source_date',
    mapped_date: 'mapped_date',
    created_at: 'created_at',
}

/**
 * ecyilang 模型字段字典（列名 → 对应的 fips 列）
 *   side: 'd' 离港侧 / 'a' 进港侧 / 'k' 两侧共用
 *   fips_key: null = 该列在 fips 里没有对应列
 */
const ECYILANG_COLUMNS = [
    /* =========================================================
     * 离港侧
     * ========================================================= */

    // 离港航班号
    {
        ecyilang_key: 'd_flight_no_full',
        fips_key: FIPS_KeyNames.flight_no,
        side: 'd',
    },

    // 离港航班归属日期
    {
        ecyilang_key: 'd_flight_date',
        fips_key: FIPS_KeyNames.mapped_date,
        side: 'd',
    },

    // 离场任务性质代码（H/Z、H/G…）
    {
        ecyilang_key: 'd_flight_type_code',
        fips_key: FIPS_KeyNames.task,
        side: 'd',
    },

    // 计划起飞时间
    {
        ecyilang_key: 'd_plan_time',
        fips_key: FIPS_KeyNames.sobt,
        side: 'd',
    },

    // 离港时间（预计或实际）
    {
        ecyilang_key: 'd_time',
        fips_key: FIPS_KeyNames.atot,
        side: 'd',
    },

    // 离港机型
    {
        ecyilang_key: 'd_jx',
        fips_key: FIPS_KeyNames.aircraft_type,
        side: 'd',
    },

    // 离港目的地机场
    {
        ecyilang_key: 'd_name',
        fips_key: FIPS_KeyNames.dest_station,
        side: 'd',
    },

    // 离港目的地机场 IATA 三字码
    {
        ecyilang_key: 'd_name_iata_code',
        fips_key: null,
        side: 'd',
    },

    // 离港目的地机场 ICAO 四字码
    {
        ecyilang_key: 'd_name_icao_code',
        fips_key: FIPS_KeyNames.dest_station,
        side: 'd',
    },

    // 离港航班类型（DOM 国内 / INT 国际 / REG 地区）
    {
        ecyilang_key: 'd_country_type',
        fips_key: null,
        side: 'd',
    },

    // 离港座位代码
    {
        ecyilang_key: 'd_craft_seat_code',
        fips_key: null,
        side: 'd',
    },

    // 离港状态
    {
        ecyilang_key: 'd_state_name',
        fips_key: null,
        side: 'd',
    },

    // 离港不正常状态
    {
        ecyilang_key: 'd_abnormal_state',
        fips_key: null,
        side: 'd',
    },

    /* =========================================================
     * 进港侧
     * ========================================================= */

    // 进港航班号
    {
        ecyilang_key: 'a_flight_no_full',
        fips_key: FIPS_KeyNames.flight_no,
        side: 'a',
    },

    // 进港航班归属日期
    {
        ecyilang_key: 'a_flight_date',
        fips_key: FIPS_KeyNames.mapped_date,
        side: 'a',
    },

    // 进港任务性质代码
    {
        ecyilang_key: 'a_flight_type_code',
        fips_key: FIPS_KeyNames.task,
        side: 'a',
    },

    // 前方（起飞）计划起飞时间
    {
        ecyilang_key: 'a_plan_time',
        fips_key: FIPS_KeyNames.sobt,
        side: 'a',
    },

    // 进港时间
    {
        ecyilang_key: 'a_time',
        fips_key: FIPS_KeyNames.aldt,
        side: 'a',
    },

    // 进港机型
    {
        ecyilang_key: 'a_jx',
        fips_key: FIPS_KeyNames.aircraft_type,
        side: 'a',
    },

    // 进港起飞机场
    {
        ecyilang_key: 'a_name',
        fips_key: FIPS_KeyNames.origin_station,
        side: 'a',
    },

    // 进港起飞机场 IATA 三字码
    {
        ecyilang_key: 'a_name_iata_code',
        fips_key: null,
        side: 'a',
    },

    // 进港起飞机场 ICAO 四字码
    {
        ecyilang_key: 'a_name_icao_code',
        fips_key: FIPS_KeyNames.origin_station,
        side: 'a',
    },

    // 进港航班类型
    {
        ecyilang_key: 'a_country_type',
        fips_key: null,
        side: 'a',
    },

    // 进港座位代码
    {
        ecyilang_key: 'a_craft_seat_code',
        fips_key: null,
        side: 'a',
    },

    // 进港状态
    {
        ecyilang_key: 'a_state_name',
        fips_key: null,
        side: 'a',
    },

    // 进港不正常状态
    {
        ecyilang_key: 'a_abnormal_state',
        fips_key: null,
        side: 'a',
    },

    /* =========================================================
     * 两侧共用
     * ========================================================= */

    // 客/货标识
    {
        ecyilang_key: 'k_h',
        fips_key: null,
        side: 'k',
    },

    // 快照导入时间
    {
        ecyilang_key: 'created_at',
        fips_key: FIPS_KeyNames.created_at,
        side: 'k',
    },
    {
        ecyilang_key: 'id',
        fips_key: FIPS_KeyNames.id,
        side: 'k',
    },
]

/** 本场 ICAO 四字码（ecyilang 的本场侧没有列，映射时按腿补） */
const LOCAL_STATION = 'ZHEC'

/** fips 的全部列：输出行先按它把键铺满（值为 null），前端 f[col] ?? '—' 直接可用 */
const FIPS_COLUMNS = Object.values(FIPS_KeyNames)

/**
 * 一整段 ecyilang 快照 → 拉平成 fips 形状的行（一行 0 ~ 2 条腿）
 * @param {Array<Object>} rows service 返回的 ecyilang 行（已包 source / uuid / 计数）
 * @returns {Array<Object>} fips 形状的行
 */
export function ecyilangToFips(rows) {
    return rows.flatMap((row) => {
        /**
         * 取本行的某个源列；空值 → null。
         * ★ ecyilang 的 *_flight_date / *_time 是**无时区**列，驱动按 UTC 还回来
         *   （见 utils/date.js），不转就差 8 小时；其余列（航班号 / 机场码 / created_at）原样返回。
         */
        const pick = (key) => {
            const value = row[key]
            if (value === null || value === undefined || value === '') return null
            if (key.endsWith('_flight_date')) return wallDay(value) // → '2026-09-29'
            if (key.endsWith('_time')) return wallMinute(value) // → '2026-09-29 03:00'
            return value
        }

        // 本行有哪些腿：该侧有航班号或计划起飞时间才算（只有航班类型代码的残行不出腿）
        const sides = []
        if (pick('d_flight_no_full') || pick('d_plan_time')) sides.push('d')
        if (pick('a_flight_no_full') || pick('a_plan_time')) sides.push('a')

        return sides.map((side) => {
            const out = {}
            for (const key of FIPS_COLUMNS) out[key] = null // 键铺满

            // 按字典搬列：只认这一侧的列（side = 'k' 的两侧都认）
            // ★ 空值不覆盖已写入的值 —— 字典里 d_name 在前、d_name_icao_code 在后，
            //   靠这个顺序实现「优先四字码，没有才退中文名」
            for (const item of ECYILANG_COLUMNS) {
                if (!item.fips_key) continue
                if (item.side !== 'k' && item.side !== side) continue
                const value = pick(item.ecyilang_key)
                if (value !== null) out[item.fips_key] = value
            }

            // 机场三列：远端取「四字码，没有退中文名」；本场侧在字典里没有来源，按腿补
            if (side === 'd') {
                // 本站起飞：起飞 = 本场；目的地 / 落地 = 远端（单腿航班的落地就是目的地）
                const remote = pick('d_name_icao_code') || pick('d_name')
                out.origin_station = LOCAL_STATION
                out.dest_station = remote
                out.landing_station = remote
            } else {
                // 本站落地：起飞 = 远端；目的地 / 落地 = 本场
                out.origin_station = pick('a_name_icao_code') || pick('a_name')
                out.dest_station = LOCAL_STATION
                out.landing_station = LOCAL_STATION
            }

            // service 的包装字段原样带出去（生鲜标记、检查单数都在里面）
            out.source = row.source
            out.leg = side
            out.uuid = row.id // 原始快照行 uuid（同行的两条腿相同）
            out.checklistCount = row.checklistCount ?? 0
            out.specialCount = row.specialCount ?? 0
            out.is_fresh = Boolean(row.is_fresh)
            out.fresh_content = row.fresh_content ?? null
            // ★ id 要**按腿唯一**：两条腿共用一个 uuid，前端拿 id 当 key 与选中态，
            //   不拆开的话两行会同时高亮、React 还会告警重复 key
            out.id = `${row.id}:${side}`
            return out
        })
    })
}
