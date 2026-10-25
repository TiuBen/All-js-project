/**
 * ============================================================
 * ecyilangRow.js —— 原始抓包行 → ecyilang 插入对象（纯函数，无副作用）
 * ------------------------------------------------------------
 * 被两个脚本共用：
 *   db_seed.js              整目录重灌（db_seed/ecyilang/*.json）
 *   addNewEcyilangToDb.js   只灌指定的某一份新快照
 *
 * ★ 为什么要抽出来：这套换算里有**日期/时间的时区口径**（见下），
 *   两个脚本各抄一份的话，改了其中一处、另一处没跟上 → 数据会静默差一天/差 8 小时。
 *   这里只放纯函数（不 import prisma），谁都能调。
 *
 * ★ 口径（与 src/utils/date.js 的 wall* 系一致）：
 *   原始 date 列形如 '2026-09-29T08:00:00'（T 后面是抓包带上的，语义只有日期）；
 *   timestamp 列是**北京时间墙上时间**，不带时区，且时间可能带跨天后缀 '(+1)' / '(-1)'。
 *   统一用 Date.UTC(...) 构造，让 JS Date 的 UTC 部分正好等于目标墙上时间，
 *   这样 Prisma 序列化出去的字面量就是库里要存的值（读写对称，不随会话时区漂移）。
 * ============================================================
 */

/** 空值判定：null / undefined / 空串 / 纯空白 都算「没有值」 */
export const isBlank = (v) => v === null || v === undefined || String(v).trim() === ''

/**
 * 日期串 → { year, month, day }（月从 1 开始）
 * 原始值形如 '2026-09-29T08:00:00'，T 后面的时分秒只是抓包带上的，语义上只有日期。
 * @param {string|null} v
 */
export function parseDay(v) {
  if (isBlank(v)) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v).trim())
  if (!m) return null
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) }
}

/**
 * 时间串 → { hour, minute, second, offsetDays }
 * 原始值形如 '05:00'，可能带跨天后缀 '(+1)' / '(-1)'（d_plan_time 25 条、a_plan_time 106 条）。
 * 后面的 (n) 表示**相对所属航班日期**再挪 n 天。
 * @param {string|null} v
 */
export function parseClock(v) {
  if (isBlank(v)) return null
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\(([+-]\d+)\))?$/.exec(String(v).trim())
  if (!m) return null
  return {
    hour: Number(m[1]),
    minute: Number(m[2]),
    second: Number(m[3] || 0),
    offsetDays: m[4] ? Number(m[4]) : 0,
  }
}

/**
 * date 列：'2026-09-29T08:00:00' → JS Date（2026-09-29T00:00:00Z）
 * 只取日期部分，T08:00:00 丢弃。
 */
export function toDate(v) {
  const day = parseDay(v)
  if (!day) return null
  return new Date(Date.UTC(day.year, day.month - 1, day.day, 0, 0, 0))
}

/**
 * timestamp(0) 列：**日期 + 时间**（都是北京时间墙上时间，不带时区）
 *
 *   'd_flight_date = 2026-09-29' + d_plan_time '05:00'      → 2026-09-29 05:00:00
 *   'd_flight_date = 2026-09-29' + d_plan_time '01:05(+1)'  → 2026-09-30 01:05:00
 *   'a_flight_date = 2026-09-29' + a_plan_time '23:20(-1)'  → 2026-09-28 23:20:00
 *
 * 写入 `timestamp without time zone` 列时 PG 只取字面量的日期与时间部分，
 * 库里落成 '2026-09-29 05:00:00'，读回来又是 2026-09-29T05:00:00.000Z。
 *
 * @param {string|null} dayValue  所属侧的日期原始值（d_* 用 d_flight_date，a_* 用 a_flight_date）
 * @param {string|null} clockValue 时间原始值（可带跨天后缀）
 * @returns {Date|null}
 */
export function toDateTime(dayValue, clockValue) {
  const day = parseDay(dayValue)
  const clock = parseClock(clockValue)
  if (!day || !clock) return null
  return new Date(
    Date.UTC(day.year, day.month - 1, day.day + clock.offsetDays, clock.hour, clock.minute, clock.second),
  )
}

/** 文本列：空串原样保留（业务上 d_state_name / a_state_name 空串 = 已取消），只把 undefined 收敛成 null */
export const toText = (v) => (v === undefined ? null : v)

/** date 列 */
export const DATE_COLUMNS = ['d_flight_date', 'a_flight_date']

/**
 * timestamp(0) 列 → 它该用哪一侧的日期做基准
 *   离港的 d_plan_time / d_time  用 d_flight_date
 *   进港的 a_plan_time / a_time  用 a_flight_date
 */
export const TIME_COLUMNS = {
  d_plan_time: 'd_flight_date',
  d_time: 'd_flight_date',
  a_plan_time: 'a_flight_date',
  a_time: 'a_flight_date',
}

/** 本侧日期缺失时可以退而用对侧日期的字段 */
export const FALLBACK_DATE = {
  d_flight_date: 'a_flight_date',
  a_flight_date: 'd_flight_date',
}

/** 灌装过程中的异常/统计（只用于末尾报告，不影响写入） */
export function newStats() {
  return {
    /** 每个时间列实际套用了几次跨天偏移 */
    shifted: { d_plan_time: 0, d_time: 0, a_plan_time: 0, a_time: 0 },
    /** 本侧日期为空、退回对侧日期的次数 */
    fallback: 0,
    /** 时间有值但两侧日期都没有 → 只能留 null 的字段 */
    orphan: [],
    /** 压根解析不了的原始值 */
    unparsable: [],
  }
}

/**
 * 机场码表行 → Map<机场中文名, {iata, icao}>
 * 两个调用方给的行来源不同（一份读 db_seed/setting/airportNameCode.json、
 * 一份读库里的 airport_name_code 表），但字段名是同一套。
 * @param {Array<{chinese_airport_name?:string, airport_iata_code?:string|null, airport_icao_code?:string|null}>} rows
 */
export function airportMapOf(rows) {
  return new Map(
    (rows || []).map((r) => [
      String(r.chinese_airport_name ?? '').trim(),
      { iata: r.airport_iata_code ?? null, icao: r.airport_icao_code ?? null },
    ]),
  )
}

/**
 * 原始行 → ecyilang 插入对象
 * @param {Object} raw 原始 JSON 行（23 个键）
 * @param {Map<string, {iata: string|null, icao: string|null}>} airportMap 机场中文名 → 码
 * @param {ReturnType<typeof newStats>} stats
 */
export function toEcyilangRow(raw, airportMap, stats) {
  const row = {}
  for (const [k, v] of Object.entries(raw)) {
    if (DATE_COLUMNS.includes(k)) {
      row[k] = toDate(v)
    } else if (TIME_COLUMNS[k]) {
      if (isBlank(v)) {
        // 时间本身就没有 → 直接 NULL（此时用哪侧日期都无所谓，不计入 fallback 统计）
        row[k] = null
      } else {
        // ① 找基准日期：先本侧，本侧空则退回对侧
        const ownField = TIME_COLUMNS[k]
        let dayValue = raw[ownField]
        if (isBlank(dayValue) && !isBlank(raw[FALLBACK_DATE[ownField]])) {
          dayValue = raw[FALLBACK_DATE[ownField]]
          stats.fallback += 1
        }
        // ② 日期 + 时间（+ 跨天偏移）
        row[k] = toDateTime(dayValue, v)
        if (isBlank(dayValue)) stats.orphan.push(k)
        else if (parseClock(v)?.offsetDays) stats.shifted[k] += 1
        else if (row[k] === null) stats.unparsable.push(`${k}=${JSON.stringify(v)}`)
      }
    } else {
      row[k] = toText(v)
    }
  }

  // 由 d_name / a_name 回填 IATA / ICAO（schema 里这四个字段的注释就是「导入时补全」）
  const d = airportMap.get(String(raw.d_name ?? '').trim())
  const a = airportMap.get(String(raw.a_name ?? '').trim())
  row.d_name_iata_code = d?.iata ?? null
  row.d_name_icao_code = d?.icao ?? null
  row.a_name_iata_code = a?.iata ?? null
  row.a_name_icao_code = a?.icao ?? null
  return row
}

/**
 * 一批原始行覆盖了哪几天 → 升序的 'YYYY-MM-DD' 数组
 * 取 d_flight_date / a_flight_date 上出现过的日期（空值跳过）。
 * 用途：单独导入一份快照时，先按这几天的旧行清掉，避免同一份数据灌两次翻倍。
 * ★ 实测所有快照里都不会出现「两侧日期都空」的行，所以每行至少落在上面某一天里。
 * @param {Object[]} rows
 */
export function daysOfRows(rows) {
  const days = new Set()
  for (const raw of rows || []) {
    for (const key of DATE_COLUMNS) {
      const day = parseDay(raw?.[key])
      if (day) days.add(`${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`)
    }
  }
  return [...days].sort()
}
