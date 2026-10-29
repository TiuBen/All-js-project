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

/** 航司字典：IATA 二字码 → { icao, cn, en }
 *  航班号 ICAO 形态（O3 → CSS）与航司中英文名都从这张表来 */
async function airlineVariants() {
  const rows = await prisma.airplane_company_name_code.findMany();
  return new Map(
    rows
      .filter((r) => r.airplane_company_iata_code)
      .map((r) => [
        r.airplane_company_iata_code.trim(),
        {
          icao: r.airplane_company_icao_code ?? null,
          cn: String(r.chinese_airplane_company_name ?? '').trim() || null,
          // ★ 码表目前**没有英文名列** → 恒 null；哪天 schema 加了这列，这里自动生效，不用改代码
          en: String(r.english_airplane_company_name ?? '').trim() || null,
        },
      ])
  );
}

/** 任务性质字典：代码（short_en）→ 整行（short_en / short_cn / full_cn） */
async function flightTypeVariants() {
  const rows = await prisma.flight_type.findMany();
  return new Map(rows.map((r) => [String(r.short_en ?? '').trim(), r]));
}

/**
 * 任务性质查表（flight_type 表）
 * 中文展示值 = full_cn 优先，缺失退 short_cn，再缺失**默认 short_en**（用户口径）。
 * ★ 代码查不到不猜：中英文都退代码本身（= short_en），前端不会拿到 null 闪空。
 * @param {string|null} code 快照里的原始代码（如 'H/Z'）
 * @param {Map} flightTypes flightTypeVariants() 建好的字典
 * @returns {{ cn: string|null, en: string|null }}
 */
function flightTypeOf(code, flightTypes) {
  const key = String(code ?? '').trim();
  if (!key) return { cn: null, en: null };
  const hit = flightTypes.get(key);
  const shortEn = hit?.short_en ?? key;
  return {
    cn: hit?.full_cn || hit?.short_cn || shortEn,
    en: shortEn,
  };
}

/**
 * 拆航班号：IATA 形态（原值）+ 前两位换航司 ICAO 三字码
 *   O36961 → 航司 O3 → CSS → icao 形态 CSS6961
 * ★ 航司查不到时 icao 退回 IATA 原值（沿用老口径，前端切 ICAO 形态也不会空）
 * @returns {{ iata, icao, airline_iata, airline_icao, airline_cn, airline_en }}
 */
function flightNoVariants(no, airlines) {
  const iata = String(no ?? '').trim();
  if (!iata) {
    return { iata: null, icao: null, airline_iata: null, airline_icao: null, airline_cn: null, airline_en: null };
  }
  const airlineIata = iata.slice(0, 2);
  const hit = airlines.get(airlineIata) ?? null;
  return {
    iata,
    icao: hit?.icao ? `${hit.icao}${iata.slice(2)}` : iata,
    airline_iata: airlineIata,
    airline_icao: hit?.icao ?? null,
    airline_cn: hit?.cn ?? null,
    airline_en: hit?.en ?? null,
  };
}

/** 一行快照补字典变体：名称字段带英文名，IATA / ICAO 用字典现值（查不到退回已存的码） */
function withVariants(row, airports, airlines, flightTypes) {
  const a = airports.get(String(row.a_name ?? '').trim()) ?? null;
  const d = airports.get(String(row.d_name ?? '').trim()) ?? null;
  const aNo = flightNoVariants(row.a_flight_no_full, airlines);
  const dNo = flightNoVariants(row.d_flight_no_full, airlines);
  const aType = flightTypeOf(row.a_flight_type_code, flightTypes);
  const dType = flightTypeOf(row.d_flight_type_code, flightTypes);
  return {
    ...row,
    // —— 机场：英文名 / IATA / ICAO ——
    a_name_english: a?.english ?? row.a_name ?? null,
    d_name_english: d?.english ?? row.d_name ?? null,
    a_name_iata_code: a?.iata ?? row.a_name_iata_code ?? null,
    a_name_icao_code: a?.icao ?? row.a_name_icao_code ?? null,
    d_name_iata_code: d?.iata ?? row.d_name_iata_code ?? null,
    d_name_icao_code: d?.icao ?? row.d_name_icao_code ?? null,
    // —— 航班号：ICAO 形态 + 航司二字码 / 三字码 / 中英文名 ——
    a_flight_no_full_icao: aNo.icao,
    d_flight_no_full_icao: dNo.icao,
    a_airline_iata_code: aNo.airline_iata,
    a_airline_icao_code: aNo.airline_icao,
    a_airline_name_cn: aNo.airline_cn,
    a_airline_name_en: aNo.airline_en,
    d_airline_iata_code: dNo.airline_iata,
    d_airline_icao_code: dNo.airline_icao,
    d_airline_name_cn: dNo.airline_cn,
    d_airline_name_en: dNo.airline_en,
    // —— 任务性质：中文全称（缺失退简称再退代码）+ 代码本身（flight_type 表） ——
    a_flight_type_name_cn: aType.cn,
    a_flight_type_name_en: aType.en,
    d_flight_type_name_cn: dType.cn,
    d_flight_type_name_en: dType.en,
  };
}

/**
 * 字段「对象化」：一行快照里三类标量字段换成对象，前端直接挑值渲染
 *
 *   d_name             → { d_name, d_name_english, d_name_iata_code, d_name_icao_code }
 *   d_flight_no_full   → { d_flight_no_full, d_flight_no_full_icao,
 *                          d_airline_iata_code, d_airline_icao_code,
 *                          d_airline_name_cn, d_airline_name_en }
 *   d_flight_type_code → { d_flight_type_code, d_flight_type_name_cn, d_flight_type_name_en }
 *   （a_ 侧同形）
 *
 * ★ 必须在 withVariants **之后**跑：对象里的英文名 / 码 / 中英文名直接取它补好的扁平值，
 *   「字典改了立即生效」只有一处实现。
 * ★ 对象里**第一条键 = 原字段名**，值就是原来的标量 → utils/ecyilangToFips 的 pick(key)
 *   靠 value[key] 取回标量，翻 fips 形状那条路径不用改。
 * ★ 整侧为空（该腿不存在）时返回 null 而不是全 null 的对象 —— 保留「空 = 无数据」语义，
 *   否则前端 / ecyilangToFips 判「这一侧有没有航班」会把空对象当真值。
 * ★ 扁平变体（d_name_english / d_flight_no_full_icao …）仍留在行上，老字段随时可退。
 * @param {Object} row withVariants 之后的快照行
 */
function nestVariants(row) {
  /** 组对象：全空 → null */
  const pack = (obj) =>
    Object.values(obj).every((v) => v === null || v === '') ? null : obj;

  const airport = (s) =>
    pack({
      [`${s}_name`]: row[`${s}_name`] || null,
      [`${s}_name_english`]: row[`${s}_name_english`] || null,
      [`${s}_name_iata_code`]: row[`${s}_name_iata_code`] || null,
      [`${s}_name_icao_code`]: row[`${s}_name_icao_code`] || null,
    });

  const flightNo = (s) =>
    pack({
      [`${s}_flight_no_full`]: row[`${s}_flight_no_full`] || null,
      [`${s}_flight_no_full_icao`]: row[`${s}_flight_no_full_icao`] || null,
      [`${s}_airline_iata_code`]: row[`${s}_airline_iata_code`] || null,
      [`${s}_airline_icao_code`]: row[`${s}_airline_icao_code`] || null,
      [`${s}_airline_name_cn`]: row[`${s}_airline_name_cn`] || null,
      [`${s}_airline_name_en`]: row[`${s}_airline_name_en`] || null,
    });

  const task = (s) =>
    pack({
      [`${s}_flight_type_code`]: row[`${s}_flight_type_code`] || null,
      [`${s}_flight_type_name_cn`]: row[`${s}_flight_type_name_cn`] || null,
      [`${s}_flight_type_name_en`]: row[`${s}_flight_type_name_en`] || null,
    });

  const out = { ...row };
  for (const s of ['d', 'a']) {
    out[`${s}_name`] = airport(s);
    out[`${s}_flight_no_full`] = flightNo(s);
    out[`${s}_flight_type_code`] = task(s);
  }
  return out;
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
  // ★ 取该航班的**全部**台账行（不是只取最新一条）：生鲜是「按腿」的 ——
  //   一条 ecyilang 快照有进港 / 离港两条腿，必须知道每条腿自己的 callsign 有没有被标，
  //   才能交给 ecyilangToFips 算腿级生鲜（一个航班台账行本来就个位数，不心疼）
  specials: { select: { callsign: true, nodes: true }, orderBy: { createTime: 'desc' } },
};

/** 行 → API 对象：拍平 _count，把最新台账的生鲜标记提到顶层 */
function toApi(source, row) {
  const { _count, specials, ...rest } = row;
  const ledger = specials ?? [];
  // 快照级口径（fips / manual_fips 直接用；ecyilang 由 ecyilangToFips 再按腿细分）
  const fresh = ledger[0]?.nodes?.freshMark ?? null;
  return {
    ...rest,
    source,
    uuid: rest.id,
    checklistCount: _count?.checklists ?? 0,
    specialCount: _count?.specials ?? 0,
    is_fresh: Boolean(fresh),
    fresh_content: fresh,
    // 已标生鲜的航班号清单 —— ecyilangToFips 拿它逐腿比对（腿级 is_fresh 的唯一依据）
    fresh_callsigns: ledger.filter((s) => s.nodes?.freshMark).map((s) => s.callsign).filter(Boolean),
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
 *   原样返回快照行（含 changelog / flight_readable_id）—— 给 RawEcyilangTable 直接铺原始数据；
 *   ecyilang 的 raw 行**一律**做字典变体 + 对象化（无开关）：
 *   d_name / a_name = 机场四件套，d_flight_no_full / a_flight_no_full = 航班号对象（含航司中英文），
 *   d_flight_type_code / a_flight_type_code = 任务性质对象（含中英文）
 */
export async function list(source, query = {}, opts = {}) {
  const name = sourceOf(source);
  const cfg = TABLES[name];
  const where = wallDayWhere(cfg.days, query);

  if (opts.raw) {
    let rows = await prisma[name].findMany({
      where: where ?? undefined,
      orderBy: cfg.orderBy,
      // 生鲜标记：取该航班的台账行（要 callsign 才能分清是「到」还是「离」那条腿）
      ...(name === 'ecyilang'
        ? {
            include: {
              specials: {
                select: { nodes: true, callsign: true },
                orderBy: { createTime: 'desc' },
              },
            },
          }
        : {}),
    });
    // 花湖翼览源：查询时补字典变体（英文名 / IATA / ICAO / 航班号 ICAO 形态 / 任务性质中英文）
    // 再把三类字段对象化 —— 前端拿到就能直接挑值，不用自己拼
    if (name === 'ecyilang') {
      const [airports, airlines, flightTypes] = await Promise.all([
        airportVariants(),
        airlineVariants(),
        flightTypeVariants(),
      ]);
      rows = rows.map(({ specials, ...r }) => {
        // ★ 生鲜是「按腿」的：一条快照有 a / d 两条航班，靠台账的
        //   （该快照 uuid 已由 include 限定）**callsign 匹配哪条腿的航班号**来定。
        //   callsign 存的是**当时页面显示的形态**（IATA 原值或 ICAO 形态都可能，
        //   比如 CSS7404 / O37338）→ 两边都按「IATA + ICAO，忽略大小写」比。
        const v = withVariants(r, airports, airlines, flightTypes);
        const forms = (iata, icao) =>
          new Set(
            [iata, icao]
              .filter(Boolean)
              .map((x) => String(x).trim().toUpperCase())
          );
        const aForms = forms(v.a_flight_no_full, v.a_flight_no_full_icao);
        const dForms = forms(v.d_flight_no_full, v.d_flight_no_full_icao);
        const freshRows = (specials ?? []).filter((s) => s.nodes?.freshMark);
        const same = (set, callsign) => set.size > 0 && set.has(String(callsign ?? '').trim().toUpperCase());
        const aFresh = freshRows.some((s) => same(aForms, s.callsign));
        const dFresh = freshRows.some((s) => same(dForms, s.callsign));
        return {
          ...nestVariants(v),
          // ★ 原始航班号（库里的大写值，如 O37404）单独透出：
          //   页面上的航班号可能是 ICAO 形态（CSS7404），但写台账（records_special.callsign）
          //   必须用原始值 —— 前端标记 / 取消都取这两个字段
          a_flight_no_raw: v.a_flight_no_full ?? null,
          d_flight_no_raw: v.d_flight_no_full ?? null,
          a_is_fresh: aFresh,
          d_is_fresh: dFresh,
          is_fresh: aFresh || dFresh,
          fresh_content: freshRows[0]?.nodes?.freshMark ?? null,
        };
      });
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
