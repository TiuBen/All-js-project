/**
 * ============================================================
 * special Service —— 生鲜航班保障节点台账（SQL 访问层）
 * ------------------------------------------------------------
 * 业务自然键 = (callsign, "belongTime") —— 一天一个航班一份，
 * 建表时已建唯一索引，所以「新增」走 upsert 语义不会写出重复行。
 *
 * ★ flight_uuid 由数据库函数 resolve_flight_uuid(callsign, belongTime) 自动解析
 *   （航班号做 IATA/ICAO 互转后到 fips / manual_fips / ecyilang 里找，即 SQL 函数
 *   resolve_flight_uuid，定义见 prisma/migrations/0_init/migration.sql）
 *   —— 调用方不需要也不会手工传这个字段。
 *   定时/改名时重新解析；解析不出来（三张表都没这个航班）保留原值，不清空。
 *
 * ⚠️ 三处容易踩的坑，本模块统一处理：
 *   1) 列名是驼峰 → SQL 里必须加双引号（"belongTime" / "nodesTime" …）。
 *   2) DATE 列经 SELECT * 会被 node-postgres 解析成 JS Date，JSON 化后按 UTC
 *      输出，+08:00 下整体退一天 → 一律用 SPECIAL_SELECT 显式 ::text 取文本。
 *   3) 更新 / upsert 都要顺手刷新 "updateTime"。
 * ============================================================
 */
import { query } from '../db/pool.js';
// TABLE 就是本模块唯一操作的那张表（'special_records'）
import { SPECIAL_TABLE as TABLE, SPECIAL_SELECT } from '../db/tableMeta.js';

/**
 * 标准 UUID 形状 —— 主键是随机 uuid v4（2026-10-03 起）。
 * 路径参数先过这道筛子：不像 uuid 就直接查无，
 * 否则 PG 会抛 `invalid input syntax for type uuid`（500 而不是 404）。
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** 日期规整：只接受 YYYY-MM-DD（或带时间的串取其日期部分），非法返回 null */
export function normalizeDate(v) {
  const m = String(v ?? '').match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${m[1]}-${p(m[2])}-${p(m[3])}`;
}

/**
 * 查询台账列表
 * @param {Object} [filter]
 * @param {string} [filter.date]      精确归属日期 YYYY-MM-DD
 * @param {string} [filter.from]      起始日期（含）
 * @param {string} [filter.to]        结束日期（含）
 * @param {string} [filter.callsign]  航班号模糊匹配（不区分大小写）
 * @returns {Promise<Array>} special 行
 */
export async function listRows(filter = {}) {
  const { date, from, to, callsign } = filter;
  const params = [];
  const where = [];
  if (date) {
    params.push(normalizeDate(date) || date);
    where.push(`"belongTime" = $${params.length}`);
  }
  if (from) {
    params.push(normalizeDate(from) || from);
    where.push(`"belongTime" >= $${params.length}`);
  }
  if (to) {
    params.push(normalizeDate(to) || to);
    where.push(`"belongTime" <= $${params.length}`);
  }
  if (callsign) {
    params.push(`%${callsign}%`);
    where.push(`callsign ILIKE $${params.length}`);
  }
  let sql = `SELECT ${SPECIAL_SELECT} FROM ${TABLE}`;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  // (callsign, belongTime) 上有唯一索引，两者已能定序，不需要再拿 id 兜
  // （id 是随机 uuid，当排序键没有任何业务含义）
  sql += ` ORDER BY "belongTime", callsign`;
  const { rows } = await query(sql, params);
  return rows;
}

/**
 * 按主键查一条
 * @param {string} id 主键（uuid）
 * @returns {Promise<Object|null>}
 */
export async function getRowById(id) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return null;
  const { rows } = await query(`SELECT ${SPECIAL_SELECT} FROM ${TABLE} WHERE id = $1`, [key]);
  return rows[0] || null;
}

/**
 * 按业务键 (callsign, belongTime) 查一条
 * @param {string} callsign
 * @param {string} belongTime YYYY-MM-DD
 * @returns {Promise<Object|null>}
 */
export async function getByKey(callsign, belongTime) {
  const day = normalizeDate(belongTime);
  if (!callsign || !day) return null;
  const { rows } = await query(
    `SELECT ${SPECIAL_SELECT} FROM ${TABLE} WHERE callsign = $1 AND "belongTime" = $2`,
    [String(callsign), day],
  );
  return rows[0] || null;
}

/**
 * 每日条数（侧边栏日历徽标 / 数据概览用）
 * @returns {Promise<Array<{date: string, count: number}>>}
 */
export async function listDateCounts() {
  const { rows } = await query(`
    SELECT "belongTime"::text AS date, COUNT(*)::int AS count
    FROM ${TABLE}
    GROUP BY "belongTime"
    ORDER BY "belongTime"
  `);
  return rows;
}

/**
 * 新增一条台账（同 key 已存在时由唯一索引报冲突，交由 controller 转 409）
 * @param {Object} data { callsign, belongTime, nodesTime? }
 * @returns {Promise<Object>}
 */
export async function createRow(data = {}) {
  const callsign = String(data.callsign);
  const { rows } = await query(
    `INSERT INTO ${TABLE} (callsign, "belongTime", "nodesTime", flight_uuid)
     VALUES ($1, $2, $3, resolve_flight_uuid($4, $2))
     RETURNING ${SPECIAL_SELECT}`,
    [
      callsign,
      normalizeDate(data.belongTime),
      data.nodesTime ?? {},
      // ⚠️ callsign 要传两次、用两个占位符：$1 由 callsign 列（varchar）定型，
      //    $4 只喂给 resolve_flight_uuid 的第一个形参（text）。同一个占位符
      //    同时出现在这两处会被 PG 判为「推断出不一致的类型」而直接报错。
      callsign,
    ],
  );
  return rows[0];
}

/**
 * 新增或覆盖（按业务键）—— 前端「把本页填的节点存进台账」走这个
 * 已存在则只覆盖 "nodesTime"（不覆盖 id / "createTime"），并刷新 "updateTime"。
 * flight_uuid 一并重算；解析不出来时**保留原值**，避免把已有的关联清空。
 * @param {Object} data { callsign, belongTime, nodesTime }
 * @returns {Promise<Object>}
 */
export async function upsertByKey(data = {}) {
  const callsign = String(data.callsign);
  const { rows } = await query(
    `INSERT INTO ${TABLE} (callsign, "belongTime", "nodesTime", flight_uuid)
     VALUES ($1, $2, $3, resolve_flight_uuid($4, $2))
     ON CONFLICT (callsign, "belongTime")
     DO UPDATE SET "nodesTime" = EXCLUDED."nodesTime",
                   flight_uuid  = COALESCE(EXCLUDED.flight_uuid, ${TABLE}.flight_uuid),
                   "updateTime" = now()
     RETURNING ${SPECIAL_SELECT}`,
    // callsign 传两次的原因同 createRow（$1 走列类型 varchar，$4 走函数形参 text）
    [callsign, normalizeDate(data.belongTime), data.nodesTime ?? {}, callsign],
  );
  return rows[0];
}

/**
 * 更新一条（只更新传入的字段；显式传 null 可清空 nodesTime）
 * 任何更新都会刷新 "updateTime"。
 * 改了 callsign 或 belongTime 时重算 flight_uuid（用改后的值解析）。
 * @param {string} id 主键（uuid）
 * @param {Object} data { callsign?, belongTime?, nodesTime? }
 * @returns {Promise<Object|null>}
 */
export async function updateRow(id, data = {}) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return null;
  const sets = [];
  const params = [];
  if (data.callsign !== undefined) {
    params.push(String(data.callsign));
    sets.push(`callsign = $${params.length}`);
  }
  if (data.belongTime !== undefined) {
    params.push(normalizeDate(data.belongTime));
    sets.push(`"belongTime" = $${params.length}`);
  }
  if (data.nodesTime !== undefined) {
    params.push(data.nodesTime);
    sets.push(`"nodesTime" = $${params.length}`);
  }
  if (sets.length === 0) return getRowById(key);

  // 业务键变了 → 重算 flight_uuid：COALESCE(本次传入值, 库里现值)
  if (data.callsign !== undefined || data.belongTime !== undefined) {
    params.push(data.callsign !== undefined ? String(data.callsign) : null); // $n
    const pCallsign = `$${params.length}`;
    params.push(data.belongTime !== undefined ? normalizeDate(data.belongTime) : null); // $n+1
    const pBelong = `$${params.length}`;
    sets.push(
      `flight_uuid = resolve_flight_uuid(COALESCE(${pCallsign}, callsign), COALESCE(${pBelong}, "belongTime"))`,
    );
  }

  sets.push(`"updateTime" = now()`);
  params.push(key);
  const { rows } = await query(
    `UPDATE ${TABLE} SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${SPECIAL_SELECT}`,
    params,
  );
  return rows[0] || null;
}

/**
 * 删除一条
 * @param {string} id 主键（uuid）
 * @returns {Promise<boolean>}
 */
export async function deleteRow(id) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return false;
  const { rowCount } = await query(`DELETE FROM ${TABLE} WHERE id = $1`, [key]);
  return rowCount > 0;
}

/** 台账总条数 + 覆盖的日期范围（列表接口的概览字段） */
export async function getOverview() {
  const { rows } = await query(`
    SELECT COUNT(*)::int AS total,
           MIN("belongTime")::text AS "from",
           MAX("belongTime")::text AS "to",
           COUNT(DISTINCT "belongTime")::int AS days
    FROM ${TABLE}
  `);
  return rows[0] || { total: 0, from: null, to: null, days: 0 };
}
