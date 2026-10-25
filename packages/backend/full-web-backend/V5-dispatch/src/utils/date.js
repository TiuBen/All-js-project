/**
 * ============================================================
 * 时间口径（dayjs）
 * ------------------------------------------------------------
 * 库里有两类时间列，读回来之后 JS Date 的语义**完全不同**，混用就差 8 小时：
 *
 *  A. 无时区的 date / timestamp
 *     —— ecyilang 的 d_flight_date / d_plan_time / d_time …（schema 里 @db.Date、@db.Timestamp）
 *     PG 原样存「墙上时间」，驱动把它当 UTC 还给你。
 *     → 想拿回墙上时间本身，按 **UTC** 读，用 wall* 系列。
 *
 *  B. timestamptz 绝对时刻
 *     —— records_checklist.created_at / records_special.createTime 等
 *     → 想展示成北京时间、想按「北京日」分天，用 cn* 系列。
 *
 * config.pgTimezoneOptions 已把 PG 会话时区钉死为 UTC，所以 A 类不会随环境漂移。
 * 中国无夏令时，北京日与 UTC 就固定差 8 小时。
 * ============================================================
 */
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/** 业务时区：本项目一律按北京时间展示、分日 */
export const CN_TZ = 'Asia/Shanghai';

const DAY_FMT = 'YYYY-MM-DD';
const DT_FMT = 'YYYY-MM-DD HH:mm:ss';

/**
 * 把任意日期输入规整成 'YYYY-MM-DD'（'2026-09-29' / '2026-09-29T08:00:00' / Date 都认）
 * @returns {string|null} 不合法返回 null
 */
export function normalizeDay(value) {
  if (value === null || value === undefined || value === '') return null;
  const s = String(value).trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (!m) return null;
  const day = `${m[1]}-${m[2]}-${m[3]}`;
  return dayjs.utc(day).isValid() ? day : null;
}

/** 日期 + n 天（返回 'YYYY-MM-DD'） */
export function addDays(day, n) {
  const d = normalizeDay(day);
  return d ? dayjs.utc(d).add(n, 'day').format(DAY_FMT) : null;
}

/**
 * 'YYYY-MM-DD' → 写库用的 Date（给 date / 无时区 timestamp 列）
 * 例：('2026-09-29') → 2026-09-29T00:00:00.000Z，落库就是 2026-09-29 00:00:00
 */
export function parseWallDay(day) {
  const d = normalizeDay(day);
  return d ? new Date(`${d}T00:00:00.000Z`) : null;
}

/**
 * 「墙上日期」区间 → Date 边界（给 date / 无时区 timestamp 列）
 * @param {string} from 起始日（含）
 * @param {string} [to] 结束日（含）；省略 = 只有 from 这一天
 * @returns {{gte?:Date, lt?:Date}|null}
 */
export function wallDayRange(from, to) {
  const f = normalizeDay(from);
  const t = normalizeDay(to) ?? f;
  if (!f && !t) return null;
  const range = {};
  if (f) range.gte = parseWallDay(f);
  if (t) range.lt = parseWallDay(addDays(t, 1));
  return range;
}

/* ==================== A 类：按 UTC 读回「墙上时间」 ==================== */

/** 无时区时间列 → 'YYYY-MM-DD' */
export const wallDay = (value) => (value ? dayjs.utc(value).format(DAY_FMT) : null);
/** 无时区时间列 → 'YYYY-MM-DD HH:mm:ss' */
export const wallDateTime = (value) => (value ? dayjs.utc(value).format(DT_FMT) : null);
/**
 * 无时区时间列 → 'YYYY-MM-DD HH:mm'（**不带秒**）
 * 取它当字符串时「秒」是噪声：前端按 `/(\d{1,2}:\d{2})$/` 截 HH:mm，
 * 'HH:mm:ss' 结尾会截到 'ss' 那段（如 03:00:00 截出 00:00），必须去掉秒。
 */
export const wallMinute = (value) => (value ? dayjs.utc(value).format('YYYY-MM-DD HH:mm') : null);
/** 无时区时间列 → 'HH:mm' */
export const wallTime = (value) => (value ? dayjs.utc(value).format('HH:mm') : null);

/* ==================== B 类：按北京时间读「绝对时刻」 ==================== */

/** 绝对时刻 → 北京日 'YYYY-MM-DD' */
export const cnDay = (value) => (value ? dayjs(value).tz(CN_TZ).format(DAY_FMT) : null);
/** 绝对时刻 → 北京时间 'YYYY-MM-DD HH:mm:ss' */
export const cnDateTime = (value) => (value ? dayjs(value).tz(CN_TZ).format(DT_FMT) : null);
/** 绝对时刻 → 北京时间 'YYYY-MM-DD HH:mm'（日志前缀用，秒是噪声） */
export const cnMinute = (value) => (value ? dayjs(value).tz(CN_TZ).format('YYYY-MM-DD HH:mm') : null);

/** 今天（北京日） */
export const todayCn = () => dayjs().tz(CN_TZ).format(DAY_FMT);

/**
 * 「北京日」区间 → UTC 边界（给 timestamptz 列做范围查询）
 * @param {string} from 起始日（含）
 * @param {string} [to] 结束日（含）；省略 = 只有 from 这一天
 * @returns {{gte?:Date, lt?:Date}|null}
 */
export function cnDayRangeUtc(from, to) {
  const f = normalizeDay(from);
  const t = normalizeDay(to) ?? f;
  if (!f && !t) return null;
  const range = {};
  if (f) range.gte = dayjs.tz(`${f} 00:00:00`, CN_TZ).toDate();
  if (t) range.lt = dayjs.tz(`${t} 00:00:00`, CN_TZ).add(1, 'day').toDate();
  return range;
}

/* ==================== ?date= / ?from= / ?to= → Prisma where ==================== */

/**
 * B 类列（timestamptz）按「北京日」过滤
 * @param {string} column 列名，如 'created_at' / 'createTime'
 * @param {{date?:string, from?:string, to?:string}} query
 * @returns {Object|null} 没传日期时返回 null
 */
export function cnDayWhere(column, { date, from, to } = {}) {
  const range = date ? cnDayRangeUtc(date) : cnDayRangeUtc(from, to);
  return range ? { [column]: range } : null;
}

/**
 * A 类列（无时区 date / 'YYYY-MM-DD HH:mm:ss' 字符串）按「墙上日期」过滤
 * @param {Array<[string, 'date'|'text']>} days 要比较的列（多列 OR 起来）
 * @param {{date?:string, from?:string, to?:string}} query
 * @returns {Object|null} 没传日期时返回 null
 */
export function wallDayWhere(days, { date, from, to } = {}) {
  const day = normalizeDay(from ?? date);
  const end = normalizeDay(to ?? date) ?? day;
  if (!day && !end) return null;
  const range = wallDayRange(from ?? date, to ?? date);

  return {
    OR: days.map(([column, kind]) => {
      const bound = {};
      if (kind === 'date') {
        // 真 date 列：当天 00:00 ≤ x < 次日 00:00
        if (day) bound.gte = range.gte;
        if (end) bound.lt = range.lt;
      } else {
        // 字符串列：字典序即时间序；上界用 `${end}~` 覆盖 end 日全天
        if (day) bound.gte = day;
        if (end) bound.lte = `${end}~`;
      }
      return { [column]: bound };
    }),
  };
}

/** 从某个时刻到现在过了多少小时（不足 1 小时返回小数） */
export const hoursSince = (value) => (value ? dayjs().diff(dayjs(value), 'hour', true) : Infinity);
