/**
 * ============================================================
 * checklist —— 检查单填写记录（records_checklist）
 * ------------------------------------------------------------
 * 一个航班可以有多份检查单（不同 checklist_category），所以 POST 永远 INSERT
 * 一条新记录；要改已有记录必须走 PUT /:id。
 *
 * ★ 航班关联：表里有三个可空外键列（fips_uuid / ecyilang_uuid / manual_fips_uuid），
 *   调用方只传一个 flightUuid（航班 uuid），由 fipsService.resolveFlight 判定归属表，
 *   fkPatch 保证「三个外键里最多一个非空」。
 *   → 对外只暴露归一后的 source / flight_uuid。
 *
 * ★ inspector_id（检查人）指向 user 表：写入前由 userService.inspectorIdOf 校验存在，
 *   读（list / get）带 include 把 user 对象一并带出（前端直接用 inspector.name）。
 *   写路径仍然不带 include —— create/update 只落库，读完再单查补关联。
 * ============================================================
 */
import { jsonValue, prisma } from '../db/prisma.js';
import { cnDay, cnDayWhere, hoursSince } from '../utils/date.js';
import { badRequest, conflict, notFound } from '../utils/http.js';
import { cleanText, pickColumns, toInt } from '../utils/values.js';
import * as fipsService from './fipsService.js';
import * as userService from './userService.js';

/** 允许写入的列（= schema 里的标量字段，主键与 created_at 除外；inspector_id 单独处理） */
const COLUMNS = [
  'callsign',
  'aircraft_type',
  'checklist_category',
  'items',
  'video_supervision',
  'status',
];

/** 读行的统一出口：检查人对象一并带出 */
const INCLUDE = { inspector: true };

/** 已提交超过这个小时数就锁住不给改 */
const EDIT_LOCK_HOURS = 24;

/** 行 → API 对象：补 source / flight_uuid + 北京创建日 */
function toApi(row) {
  if (!row) return null;
  return {
    ...row,
    ...fipsService.linkOf(row),
    // 列表按「北京创建日」过滤，这里回显同一口径，前端不用自己算时区
    createdDate: cnDay(row.created_at),
  };
}

/**
 * 列表
 * @param {Object} [query] { flightUuid, callsign, category, date, from, to }
 */
export async function list(query = {}) {
  const and = [];

  const byFlight = fipsService.flightWhere(query.flightUuid);
  if (byFlight) and.push(byFlight);

  const callsign = cleanText(query.callsign);
  if (callsign) and.push({ callsign });

  const category = cleanText(query.category);
  if (category) and.push({ checklist_category: category });

  const byDay = cnDayWhere('created_at', query);
  if (byDay) and.push(byDay);

  const items = await prisma.records_checklist.findMany({
    where: and.length ? { AND: and } : undefined,
    orderBy: { id: 'desc' },
    include: INCLUDE,
  });
  return { total: items.length, items: items.map(toApi) };
}

/** 详情（:id 是整数自增主键） */
export async function get(id) {
  const key = toInt(id);
  if (key === null) throw notFound(`records_checklist 里没有 id=${id} 的记录`);
  const row = await prisma.records_checklist.findUnique({ where: { id: key }, include: INCLUDE });
  if (!row) throw notFound(`records_checklist 里没有 id=${id} 的记录`);
  return toApi(row);
}

/**
 * 新增
 * @param {Object} body { flightUuid?, callsign, aircraftType?, checklistCategory, items?, ... }
 *                       flightUuid 可选：不传就是一份「不挂航班」的记录
 */
export async function create(body = {}) {
  const data = pickColumns(body, COLUMNS);
  if (!cleanText(data.checklist_category)) throw badRequest('checklistCategory（检查单类型）不能为空');

  if (cleanText(body.flightUuid)) {
    const flight = await fipsService.resolveFlight(body.flightUuid);
    Object.assign(data, fipsService.fkPatch(flight.source, flight.id));
  }

  // 检查人：inspectorId（数字，严格）或 inspectorName（姓名，对不上留空）→ inspector_id；没传不改
  const inspectorId = await userService.inspectorIdFromBody(body);
  if (inspectorId !== undefined) data.inspector_id = inspectorId;

  // 写路径不带 include：先落库拿 id，再单查补关联（get 里带检查人对象）
  const row = await prisma.records_checklist.create({ data, select: { id: true } });
  return get(row.id);
}

/** 更新（局部更新；已提交且超过 24 小时 → 409 锁定） */
export async function update(id, body = {}) {
  const key = toInt(id);
  if (key === null) throw notFound(`records_checklist 里没有 id=${id} 的记录`);

  const current = await prisma.records_checklist.findUnique({ where: { id: key }, include: INCLUDE });
  if (!current) throw notFound(`records_checklist 里没有 id=${id} 的记录`);
  if (current.status === 'submitted' && hoursSince(current.created_at) >= EDIT_LOCK_HOURS) {
    throw conflict(`该记录已提交超过 ${EDIT_LOCK_HOURS} 小时，不能再修改`);
  }

  const data = pickColumns(body, COLUMNS);
  // checklist_category 是 NOT NULL：显式传空 = 不改
  if ('checklist_category' in data && !cleanText(data.checklist_category)) delete data.checklist_category;

  if (body.flightUuid !== undefined) {
    const flightUuid = cleanText(body.flightUuid);
    const flight = flightUuid ? await fipsService.resolveFlight(flightUuid) : null;
    Object.assign(data, fipsService.fkPatch(flight?.source ?? null, flight?.id ?? null));
  }

  // JSON 列：显式传 null 表示清空该列（要写 SQL NULL，不能只是 JSON null）
  if ('items' in data) data.items = jsonValue(data.items);
  if ('video_supervision' in data) data.video_supervision = jsonValue(data.video_supervision);

  // 检查人：inspectorId（数字，严格）或 inspectorName（姓名，对不上留空）→ inspector_id；没传不改
  const inspectorId = await userService.inspectorIdFromBody(body);
  if (inspectorId !== undefined) data.inspector_id = inspectorId;

  if (Object.keys(data).length === 0) return toApi(current);
  data.updated_at = new Date(); // schema 没有 @updatedAt，得自己刷

  const { count } = await prisma.records_checklist.updateMany({ where: { id: key }, data });
  if (!count) throw notFound(`records_checklist 里没有 id=${id} 的记录`);
  return get(key);
}

/** 删除（deleteMany：不存在就回 404） */
export async function remove(id) {
  const key = toInt(id);
  if (key === null) throw notFound(`records_checklist 里没有 id=${id} 的记录`);
  const { count } = await prisma.records_checklist.deleteMany({ where: { id: key } });
  if (!count) throw notFound(`records_checklist 里没有 id=${id} 的记录`);
  return { ok: true, id: key };
}
