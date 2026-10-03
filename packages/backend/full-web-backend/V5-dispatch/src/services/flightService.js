/**
 * ============================================================
 * 航班 Service —— 业务逻辑层
 * ------------------------------------------------------------
 * 航班列表数据源 = **fips 表**（Excel 原样导入的历史航班流量）。
 * 原 `flights` 表已废弃删除，
 * 所以增 / 改 / 删也一并落在 fips 上 —— 全模块只有一个航班表在写。
 *
 *   listFlights / getFlight / createFlight / updateFlight / deleteFlight
 *   getFlightByUuid —— 按航班 uuid（= 三张表中的 id）反查航班
 *
 * ★ 航班身份 = 三张航班表的 **id**（随机 uuid v4）。
 *   fips.id / manual_fips.id / ecyilang.id 跨表碰撞概率可忽略 → 天然全局唯一，
 *   所以 checklist_records.flight_uuid / special_records.flight_uuid 存的就是它。
 *   （2026-10-03 之前是「整数 id + 独立 uuid 列 + flight_uuid_registry 名字簿」，
 *     那次重构把 uuid 列合并进 id，名字簿与触发器已整体删除。）
 * ============================================================
 */
import { query } from '../db/pool.js';
import { localDateStr } from '../utils/time.js';
import * as fipsService from './fipsService.js';
import * as manualFipsService from './manualFipsService.js';

/** 标准 UUID 形状 —— 所有航班主键都是它，拿它当"是不是合法航班键"的第一道筛子 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 查询航班列表（数据源：fips 表）
 * @param {Object} filter 过滤条件
 * @param {string} [filter.date]  精确日期（YYYY-MM-DD，该天无数据自动回退最近天）
 * @param {string} [filter.from]  范围起始日期
 * @param {string} [filter.to]    范围结束日期
 * @returns {Promise<{date: string|null, items: Array}>} date=实际数据日期
 */
export async function listFlights(filter = {}) {
  return fipsService.listFlights(filter);
}

/**
 * 查询单个航班详情
 * id 形如 'manual-<uuid>' / 'fips-<uuid>' / 裸 uuid；
 * 前缀只是历史写法，剥离后统一按 uuid 找（原来的整数主键已不存在）。
 * @param {string} id 航班主键
 * @returns {Promise<Object|null>} 航班对象；不存在返回 null
 */
export async function getFlight(id) {
  const s = String(id ?? '').trim();
  if (!s) return null;
  if (s.startsWith('manual-')) return getManualFlight(s);
  return fipsService.getFlightById(s);
}

/**
 * 按航班 uuid 反查航班（三张表的 id 都是随机 uuid，跨表天然唯一 → 挨个表试即可）
 * ★ 生鲜标记（fresh-air-cargo）等只拿到一个 uuid 的调用方靠它拿到航班号与日期。
 * ★ ecyilang 的航班键带航段后缀（'<id>-d' / '<id>-a'，
 *   见 ecyilangService 的前后端投影），库里存的是那条计划行的 id，
 *   所以查之前先把后缀剥掉。
 * @param {string} uuid 航班 uuid（可带 '-d' / '-a' 后缀）
 * @returns {Promise<{uuid: string, sourceTable: string, flightNo: string, flightDate: string|null}|null>}
 */
export async function getFlightByUuid(uuid) {
  if (!uuid) return null;
  const raw = String(uuid).trim();
  const base = raw.replace(/-[da]$/, '');
  // 形状先过：不是 uuid 就直接查无（否则 PG 会抛 invalid input syntax for type uuid）
  if (!UUID_RE.test(base)) return null;

  // fips：日期取 mapped_date
  const fips = await query(
    `SELECT id::text AS uuid, flight_no, mapped_date AS flight_date
       FROM fips WHERE id = $1`,
    [base],
  );
  if (fips.rows.length) return { ...fips.rows[0], sourceTable: 'fips' };

  // manual_fips：日期从 aldt / landing_time 里取
  const man = await query(
    `SELECT id::text AS uuid, flight_no,
            COALESCE(NULLIF(LEFT(aldt, 10), ''), NULLIF(LEFT(landing_time, 10), '')) AS flight_date
       FROM manual_fips WHERE id = $1`,
    [base],
  );
  if (man.rows.length) return { ...man.rows[0], sourceTable: 'manual_fips' };

  // ecyilang：一行是「离港 + 进港」成对航班，取有值的那一侧。
  // 后缀里带了航段信息（-d 离港 / -a 进港），优先取对应那一侧，
  // 该侧为空时再退到另一侧（原航班号的展示口径与前端一致）。
  const side = /-d$/.test(raw) ? 'd' : /-a$/.test(raw) ? 'a' : null;
  const first = side === 'a' ? 'a' : 'd';
  const second = first === 'a' ? 'd' : 'a';
  const ecy = await query(
    `SELECT id::text AS uuid,
            COALESCE(NULLIF(${first}_flight_no_full, ''), NULLIF(${second}_flight_no_full, '')) AS flight_no,
            LEFT(COALESCE(NULLIF(${first}_flight_date, ''), NULLIF(${second}_flight_date, '')), 10) AS flight_date
       FROM ecyilang WHERE id = $1`,
    [base],
  );
  if (ecy.rows.length) return { ...ecy.rows[0], sourceTable: 'ecyilang' };

  return null;
}

/**
 * 把「航班引用」解析成真正的 flight uuid
 * ------------------------------------------------------------
 * ★ 为什么必须存在这道关口：
 *   checklist_records.flight_uuid / special_records.flight_uuid 的落库值，
 *   必须能在三张航班表里找到宿主 —— 否则就是挂不上航班的孤儿记录：
 *   航班列表关联不到，也没人会再去清它。
 *   放进去一个非 uuid 的值，那条记录会在下次重启时被**静默删除**，
 *   用户填好的检查单凭空消失。
 *   → 所以宁可写入时就明确报错（调用方回 400），也绝不能把非法值存进库。
 *
 * 只接受一种写法：标准 uuid（可带 ecyilang 的 '-d' / '-a' 航段后缀），
 * 并且必须**确实存在于三张表之一** —— 拼错的 uuid 不算合法。
 * （'fips-5' / 裸数字 '5' 那套整数主键写法随 2026-10-03 的主键 UUID 化一并失效，
 *   原来的转换分支已删除；前端 checklistStore 早已改成提交 flight.uuid。）
 *
 * @param {string|number} ref 航班引用
 * @returns {Promise<{uuid: string, flightNo: string|null, sourceTable: string, legacy: boolean}|null>}
 *          解析不出来返回 null，调用方应回 400
 */
export async function resolveFlightRef(ref) {
  const raw = String(ref ?? '').trim();
  if (!raw) return null;
  if (!UUID_RE.test(raw.replace(/-[da]$/, ''))) return null;

  const hit = await getFlightByUuid(raw);
  if (!hit) return null;
  // 原样返回（带上 ecyilang 的航段后缀）—— base_flight_uuid() 在 SQL 侧会剥掉，
  // 且保留后缀能让 getFlightByUuid 下次仍能定位到正确的航段侧。
  return { uuid: raw, flightNo: hit.flight_no, sourceTable: hit.sourceTable, legacy: false };
}

/**
 * 手动添加航班（manual_fips 行）→ 前端兼容航班对象
 * 手动航班只有 航班号/机型/停机位/落地时间，构造前端所需的最小结构
 * @param {string} id 形如 'manual-<uuid>'
 * @returns {Promise<Object|null>} 兼容对象或 null
 */
async function getManualFlight(id) {
  const row = await manualFipsService.getManualFipsById(String(id).replace(/^manual-/, ''));
  if (!row) return null;
  const landing = row.aldt || row.landing_time || null;
  const landingDate = landing ? String(landing).slice(0, 10) : localDateStr();
  return {
    id,
    uuid: row.id || null,
    flightNo: row.flight_no,
    aircraftType: row.aircraft_type || '',
    // 航班类别：优先取手动航班的 checklist_category（货运/客运，决定检查单模板）；缺省按货运处理
    category: row.checklist_category || '货运航班',
    flightType: '常规航班',
    origin: '—',
    destination: '鄂州',
    flightDate: landingDate,
    landingTimeUtc: landing,
    status: '计划',
    // 已关联检查单：checklist_uuid 存 checklist_records.id（无则 false）
    hasChecklist: !!row.checklist_uuid,
    checklistId: row.checklist_uuid || null,
    // 原始字段透传
    raw: {
      task: row.task,
      originStation: row.origin_station,
      destStation: row.dest_station,
      landingStation: row.landing_station,
      sobt: row.sobt,
      eobt: row.eobt,
      atot: row.atot,
      sibt: row.sibt,
      eldt: row.eldt,
      aldt: row.aldt,
      corridor: row.corridor,
      runway: row.runway,
      stand: row.stand,
      source: 'manual-fips',
    },
  };
}

/**
 * 新增航班 —— 落到 fips 表
 * 入参沿用前端 flightsApi 的 camelCase 形状，这里映射到 fips 的列：
 *   flightNo → flight_no        flightDate → mapped_date
 *   departureTimeUtc → atot     landingTimeUtc → aldt
 *   aircraftType → aircraft_type   category → checklist_category
 * （status / flightType / hasChecklist 在 fips 里没有对应列：
 *   fips 记录的都是已飞完的航班，有没有检查单看 checklist_uuid。）
 * @param {Object} data 航班数据（camelCase）
 * @returns {Promise<Object>} 创建的航班
 */
export async function createFlight(data = {}) {
  const { rows } = await query(
    `INSERT INTO fips
      (flight_no, mapped_date, aircraft_type, atot, aldt, checklist_category, task)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      data.flightNo || '',
      data.flightDate || localDateStr(),
      data.aircraftType || null,
      toLocalTime(data.departureTimeUtc),
      toLocalTime(data.landingTimeUtc),
      data.category || '货运航班',
      data.task || null,
    ],
  );
  return fipsService.rowToFlight(rows[0]);
}

/**
 * 更新航班（只更新传入的字段，未传字段保持不变）—— 作用于 fips
 * @param {string|number} id fips 主键 uuid（可带历史 'fips-' 前缀）
 * @param {Object} data 要更新的字段（camelCase）
 * @returns {Promise<Object|null>} 更新后的航班；不存在返回 null
 */
export async function updateFlight(id, data = {}) {
  const key = String(id ?? '').trim().replace(/^fips-/, '');
  if (!UUID_RE.test(key)) return null;
  const { rows } = await query(
    `UPDATE fips SET
       flight_no          = COALESCE($1, flight_no),
       mapped_date        = COALESCE($2, mapped_date),
       aircraft_type      = COALESCE($3, aircraft_type),
       atot               = COALESCE($4, atot),
       aldt               = COALESCE($5, aldt),
       checklist_category = COALESCE($6, checklist_category)
     WHERE id = $7
     RETURNING *`,
    [
      data.flightNo ?? null,
      data.flightDate ?? null,
      data.aircraftType ?? null,
      toLocalTime(data.departureTimeUtc),
      toLocalTime(data.landingTimeUtc),
      data.category ?? null,
      key,
    ],
  );
  return rows.length ? fipsService.rowToFlight(rows[0]) : null;
}

/**
 * 删除航班 —— 作用于 fips
 * @param {string|number} id fips 主键 uuid（可带历史 'fips-' 前缀）
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteFlight(id) {
  const key = String(id ?? '').trim().replace(/^fips-/, '');
  if (!UUID_RE.test(key)) return false;
  const { rowCount } = await query('DELETE FROM fips WHERE id = $1', [key]);
  return rowCount > 0;
}

/**
 * ISO 时间串 → fips 存法（本地时间 'YYYY-MM-DD HH:mm:ss'）
 * fips 的时间列都是 VARCHAR(19)，不存时区，统一按本地时间截断。
 * @param {string|null|undefined} v
 * @returns {string|null}
 */
function toLocalTime(v) {
  if (!v) return null;
  return String(v)
    .replace('T', ' ')
    .replace(/\.\d+/, '')
    .replace(/Z$/, '')
    .replace(/[+-]\d{2}:?\d{2}$/, '')
    .slice(0, 19);
}
