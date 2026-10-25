/**
 * ============================================================
 * fips —— 三张航班表共用一个 service
 * ------------------------------------------------------------
 * 读（GET）用 ?source= 指定表，取值就是表名（= Prisma delegate 名）：
 *   fips          历史流量明细
 *   ecyilang      航班计划快照
 *   manual_fips   手动添加的航班
 * ★ source 必填 —— 缺失或非法一律 400，没有默认值。
 *
 * 写（POST / PUT / DELETE）**只有 manual_fips 一张表**，接口不接受 source。
 *
 * 三张表都被 records_checklist / records_special 的外键指过来
 * （fips_uuid / ecyilang_uuid / manual_fips_uuid，均 ON DELETE SET NULL），
 * 所以读的时候顺手把「检查单数 / 台账数 / 是否生鲜」一起带出来。
 * ============================================================
 */
import { prisma } from '../db/prisma.js';
import { wallDayWhere } from '../utils/date.js';
import { badRequest, notFound } from '../utils/http.js';
import { cleanText, isUuid, pickColumns } from '../utils/values.js';

/** 三张航班表（表名 = delegate 名）；只有读接口用得上 */
const TABLES = {
  fips: {
    orderBy: [{ sobt: 'asc' }, { flight_no: 'asc' }],
    // ?date= 要比的日期列：date = 真 date 列，text = 'YYYY-MM-DD HH:mm:ss' 字符串列
    days: [['mapped_date', 'text'], ['source_date', 'text']],
  },
  ecyilang: {
    orderBy: [{ d_flight_date: 'asc' }, { d_plan_time: 'asc' }],
    days: [['d_flight_date', 'date'], ['a_flight_date', 'date']],
  },
  manual_fips: {
    orderBy: [{ sobt: 'asc' }, { flight_no: 'asc' }],
    days: [['sobt', 'text'], ['aldt', 'text']],
  },
};

/** 三张航班表的名字 —— ① 校验 ?source= ② 反查 flightUuid 属于哪张表 */
const MODELS = Object.keys(TABLES);

/** 唯一可写的表 */
const MANUAL = 'manual_fips';

/* ==================== 字典变体（花湖翼览展示形态，howto.md 方案 C：查询时补齐） ====================
 * raw 源的每个名称字段在返回时带上 英文名 / IATA / ICAO，前端 fetchFlights 再按
 * 设置页的展示形态开关（英文/中文、ICAO/IATA）挑值 —— 字典改了立即生效，不用重灌快照。
 * ★ 英文名缺失回退中文名（COALESCE 口径）；IATA / ICAO 缺失保留原值，不拿中文名顶。
 * ★ 字典很小（几十条），每次现查现建 Map，不做缓存。
 * ============================================================ */

/** 机场字典：中文名 → { english, iata, icao } */
async function airportVariants() {
  const rows = await prisma.airport_name_code.findMany();
  return new Map(
    rows.map((r) => [
      String(r.chinese_airport_name ?? '').trim(),
      {
        english: (r.english_airport_name ?? '').trim() || null,
        iata: r.airport_iata_code ?? null,
        icao: r.airport_icao_code ?? null,
      },
    ])
  );
}

/** 航司字典：IATA 二字码 → ICAO 三字码（航班号 ICAO 形态用，CZ3101 → CSN3101） */
async function airlineIcaoMap() {
  const rows = await prisma.airplane_company_name_code.findMany();
  return new Map(
    rows
      .filter((r) => r.airplane_company_iata_code && r.airplane_company_icao_code)
      .map((r) => [r.airplane_company_iata_code, r.airplane_company_icao_code])
  );
}

/** 航班号换航司 ICAO 三字码：取前两位查航司字典（IATA 二字码可能是字母+数字，如 O3），
 *  字典里查得到才替换，查不到原样返回 */
function flightNoIcao(no, airlines) {
  const s = String(no ?? '');
  const icao = airlines.get(s.slice(0, 2));
  return icao ? `${icao}${s.slice(2)}` : (no || null);
}

/** 一行快照补字典变体：名称字段带英文名，IATA / ICAO 用字典现值（查不到退回已存的码） */
function withVariants(row, airports, airlines) {
  const a = airports.get(String(row.a_name ?? '').trim()) ?? null;
  const d = airports.get(String(row.d_name ?? '').trim()) ?? null;
  return {
    ...row,
    a_name_english: a?.english ?? row.a_name ?? null,
    d_name_english: d?.english ?? row.d_name ?? null,
    a_name_iata_code: a?.iata ?? row.a_name_iata_code ?? null,
    a_name_icao_code: a?.icao ?? row.a_name_icao_code ?? null,
    d_name_iata_code: d?.iata ?? row.d_name_iata_code ?? null,
    d_name_icao_code: d?.icao ?? row.d_name_icao_code ?? null,
    a_flight_no_full_icao: flightNoIcao(row.a_flight_no_full, airlines),
    d_flight_no_full_icao: flightNoIcao(row.d_flight_no_full, airlines),
  };
}

/** manual_fips 允许写入的列（= schema 里的标量字段，主键除外） */
const MANUAL_COLUMNS = [
  'task',
  'flight_no',
  'origin_station',
  'dest_station',
  'landing_station',
  'in_out_time',
  'sobt',
  'eobt',
  'atot',
  'sibt',
  'eldt',
  'aldt',
  'corridor',
  'runway',
  'stand',
  'aircraft_type',
  'landing_time',
];

/** 子表指向三张航班表的外键列（写入时先全部清空、再设其中一个） */
const FK_COLUMNS = MODELS.map((model) => `${model}_uuid`);

/* ==================== 读 ==================== */

/** 读操作统一带的关联投影：检查单数 / 台账数 / 最新一条台账（取生鲜标记） */
const LINK_INCLUDE = {
  _count: { select: { checklists: true, specials: true } },
  specials: { select: { nodes: true }, orderBy: { createTime: 'desc' }, take: 1 },
};

/** 行 → API 对象：拍平 _count，把最新台账的生鲜标记提到顶层 */
function toApi(source, row) {
  const { _count, specials, ...rest } = row;
  const fresh = specials?.[0]?.nodes?.freshMark ?? null;
  return {
    ...rest,
    source,
    uuid: rest.id,
    checklistCount: _count?.checklists ?? 0,
    specialCount: _count?.specials ?? 0,
    is_fresh: Boolean(fresh),
    fresh_content: fresh,
  };
}

/** ?source= → 表名（必填，缺失 / 非法 → 400） */
function sourceOf(source) {
  const name = cleanText(source);
  if (!name) throw badRequest(`缺少 source，可选：${MODELS.join(' / ')}`);
  if (!TABLES[name]) throw badRequest(`未知的 source「${name}」，可选：${MODELS.join(' / ')}`);
  return name;
}

/**
 * 航班列表
 * @param {string} source fips / ecyilang / manual_fips（必填）
 * @param {Object} [query] { date, from, to }
 * @param {Object} [opts] { raw } raw=true → **不做 fips 形状映射、不带关联计数**，
 *   原样返回快照行（含 changelog / flight_readable_id）—— 给 RawEcyilangTable 直接铺原始数据
 */
export async function list(source, query = {}, opts = {}) {
  const name = sourceOf(source);
  const cfg = TABLES[name];
  const where = wallDayWhere(cfg.days, query);

  if (opts.raw) {
    let rows = await prisma[name].findMany({ where: where ?? undefined, orderBy: cfg.orderBy });
    // 花湖翼览源：查询时补字典变体（英文名 / IATA / ICAO / 航班号 ICAO 形态）——
    // 前端 fetchFlights 再按设置页的展示形态开关挑值，RawEcyilangTable / Dialog 不用感知
    if (name === 'ecyilang') {
      const [airports, airlines] = await Promise.all([airportVariants(), airlineIcaoMap()]);
      rows = rows.map((r) => withVariants(r, airports, airlines));
    }
    // uuid = id 的别名：toApi 出来的行都有 uuid（Sidebar 建草稿 / URL flightUuid 都用它），
    // raw 行也对齐，前端两条路径的选中行为一致
    const items = rows.map((r) => ({ ...r, uuid: r.id }));
    return { source: name, raw: true, total: items.length, items };
  }

  const rows = await prisma[name].findMany({
    where: where ?? undefined,
    orderBy: cfg.orderBy,
    include: LINK_INCLUDE,
  });

  return {
    source: name,
    total: rows.length,
    items: rows.map((row) => toApi(name, row)),
  };
}

/**
 * 航班详情
 * @param {string} source fips / ecyilang / manual_fips（必填）
 * @param {string} id 航班 uuid
 */
export async function get(source, id) {
  const name = sourceOf(source);
  const key = cleanText(id);
  if (!key || !isUuid(key)) throw notFound(`${name} 里没有这个航班：${id}`);
  const row = await prisma[name].findUnique({ where: { id: key }, include: LINK_INCLUDE });
  if (!row) throw notFound(`${name} 里没有这个航班：${id}`);
  return toApi(name, row);
}

/* ==================== 写（固定 manual_fips） ==================== */

/** 新增航班 */
export async function create(body = {}) {
  const data = pickColumns(body, MANUAL_COLUMNS);
  // flight_no 是 NOT NULL 列
  if (!cleanText(data.flight_no)) throw badRequest('flightNo（航班号）不能为空');

  const { id } = await prisma[MANUAL].create({ data, select: { id: true } });
  return get(MANUAL, id);
}

/** 更新航班（局部更新，没传的列不动） */
export async function update(id, body = {}) {
  const key = cleanText(id);
  if (!key || !isUuid(key)) throw notFound(`${MANUAL} 里没有这个航班：${id}`);

  const data = pickColumns(body, MANUAL_COLUMNS);
  // flight_no 是 NOT NULL：显式传空表示「不改」，而不是清空
  if ('flight_no' in data && !cleanText(data.flight_no)) delete data.flight_no;
  if (Object.keys(data).length === 0) return get(MANUAL, key);

  const { count } = await prisma[MANUAL].updateMany({ where: { id: key }, data });
  if (!count) throw notFound(`${MANUAL} 里没有这个航班：${id}`);
  return get(MANUAL, key);
}

/**
 * 删除航班
 * ------------------------------------------------------------
 * ★ 子表外键是 ON DELETE SET NULL：**必须先删子行，再删航班**。
 *   反过来的话，父行一删子行的外键立刻变 NULL，后面的 deleteMany 一条都匹配不到，
 *   留下一堆「三个外键全空」的孤儿行。
 */
export async function remove(id) {
  const key = cleanText(id);
  if (!key || !isUuid(key)) throw notFound(`${MANUAL} 里没有这个航班：${id}`);
  const found = await prisma[MANUAL].findUnique({ where: { id: key }, select: { id: true } });
  if (!found) throw notFound(`${MANUAL} 里没有这个航班：${id}`);

  const [checklists, specials] = await prisma.$transaction([
    prisma.records_checklist.deleteMany({ where: { manual_fips_uuid: key } }),
    prisma.records_special.deleteMany({ where: { manual_fips_uuid: key } }),
    prisma[MANUAL].delete({ where: { id: key }, select: { id: true } }),
  ]);
  return {
    ok: true,
    source: MANUAL,
    id: key,
    checklists: checklists.count,
    specials: specials.count,
  };
}

/* ==================== 给 checklist / special 复用 ==================== */

/**
 * 解析子表传来的 flightUuid（航班 uuid）到底属于哪张航班表
 * @param {string} flightUuid
 * @returns {Promise<{source:string, fk:string, id:string}>}
 */
export async function resolveFlight(flightUuid) {
  const id = cleanText(flightUuid);
  if (!id || !isUuid(id)) throw badRequest(`flightUuid 必须是航班 uuid：${flightUuid}`);

  for (const model of MODELS) {
    const hit = await prisma[model].findUnique({ where: { id }, select: { id: true } });
    if (hit) return { source: model, fk: `${model}_uuid`, id };
  }
  throw notFound(`找不到航班 ${id}`);
}

/**
 * 外键列补丁：三个外键列全部清空，再把选中的那个设为 id
 * → 一条记录永远只关联一个航班，不会出现「两个外键同时有值」的脏数据
 * @param {string|null} source
 * @param {string|null} id
 */
export function fkPatch(source, id) {
  const patch = {};
  for (const fk of FK_COLUMNS) patch[fk] = null;
  if (source && TABLES[source]) patch[`${source}_uuid`] = id;
  return patch;
}

/** 从一行记录反推它挂在哪个航班上（直接读三个外键列，零额外查询） */
export function linkOf(row) {
  const fk = FK_COLUMNS.find((column) => row?.[column]);
  return { source: fk ? fk.replace(/_uuid$/, '') : null, flight_uuid: fk ? row[fk] : null };
}

/** 按航班 uuid 生成「只看这个航班」的 where 片段 */
export function flightWhere(flightUuid) {
  const id = cleanText(flightUuid);
  if (!id) return null;
  // 非法 uuid → 查无（而不是退化成「不过滤」）
  return isUuid(id) ? { OR: FK_COLUMNS.map((fk) => ({ [fk]: id })) } : { id: -1 };
}
