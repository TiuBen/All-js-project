/**
 * ============================================================
 * special —— 生鲜航班保障节点台账（records_special）
 * ------------------------------------------------------------
 * 一行 = 「某个航班的保障节点」快照，节点内容整包放在 nodes（JSONB）里。
 *
 * ★ 库里已没有 belongTime 列 —— 需要分天时统一按 createTime 的北京日算。
 * ★ 库里没有业务唯一约束 —— 所以 POST 永远新增一条（不会 409），
 *   要覆盖必须带 id 走 PUT /:id。
 *
 * ★ 这一层不用 include：外键列就在行里，linkOf 直接反推归属航班，零额外查询。
 * ★ inspector_id（检查人）指向 user 表：写入前由 userService.inspectorIdOf 校验存在，
 *   读（list / get）带 include 把 user 对象一并带出；写路径不带 include。
 * ============================================================
 */
import { jsonValue, prisma } from '../db/prisma.js';
import { cnDay, cnDayWhere } from '../utils/date.js';
import { badRequest, notFound } from '../utils/http.js';
import { cleanText, pickColumns, toInt } from '../utils/values.js';
import * as fipsService from './fipsService.js';
import * as userService from './userService.js';

/** 允许写入的列（主键与 createTime / updateTime 除外；inspector_id 单独处理） */
const COLUMNS = ['callsign', 'nodes'];

/** 读行的统一出口：检查人对象一并带出 */
const INCLUDE = { inspector: true };

/** 行 → API 对象：补 source / flight_uuid + 北京创建/更新日 */
function toApi(row) {
  if (!row) return null;
  return {
    ...row,
    ...fipsService.linkOf(row),
    createdDate: cnDay(row.createTime),
    updateDate: cnDay(row.updateTime),
  };
}

/**
 * 列表
 * @param {Object} [query] { callsign, flightUuid, date, from, to }
 */
export async function list(query = {}) {
  const and = [];

  const callsign = cleanText(query.callsign);
  if (callsign) and.push({ callsign });

  const byFlight = fipsService.flightWhere(query.flightUuid);
  if (byFlight) and.push(byFlight);

  const byDay = cnDayWhere('createTime', query);
  if (byDay) and.push(byDay);

  const items = await prisma.records_special.findMany({
    where: and.length ? { AND: and } : undefined,
    orderBy: { id: 'desc' },
    include: INCLUDE,
  });
  return { total: items.length, items: items.map(toApi) };
}

/** 详情（:id 是整数自增主键） */
export async function get(id) {
  const key = toInt(id);
  if (key === null) throw notFound(`records_special 里没有 id=${id} 的记录`);
  const row = await prisma.records_special.findUnique({ where: { id: key }, include: INCLUDE });
  if (!row) throw notFound(`records_special 里没有 id=${id} 的记录`);
  return toApi(row);
}

/**
 * 新增
 * @param {Object} body { callsign, nodes?, flightUuid? }
 */
export async function create(body = {}) {
  const data = pickColumns(body, COLUMNS);
  if (!cleanText(data.callsign)) throw badRequest('callsign（航班号）不能为空');
  if (data.nodes === undefined) data.nodes = {};

  if (cleanText(body.flightUuid)) {
    const flight = await fipsService.resolveFlight(body.flightUuid);
    Object.assign(data, fipsService.fkPatch(flight.source, flight.id));
  }

  // 检查人：inspectorId（数字，严格）或 inspectorName（姓名，对不上留空）→ inspector_id；没传不改
  const inspectorId = await userService.inspectorIdFromBody(body);
  if (inspectorId !== undefined) data.inspector_id = inspectorId;

  const now = new Date();
  // 写路径不带 include：先落库拿 id，再单查补关联（get 里带检查人对象）
  const row = await prisma.records_special.create({
    data: { ...data, createTime: now, updateTime: now },
    select: { id: true },
  });
  return get(row.id);
}

/** 更新（局部更新；nodes 传 null 表示清空该列） */
export async function update(id, body = {}) {
  const key = toInt(id);
  if (key === null) throw notFound(`records_special 里没有 id=${id} 的记录`);

  const data = pickColumns(body, COLUMNS);
  if ('callsign' in data && !cleanText(data.callsign)) delete data.callsign; // NOT NULL
  if ('nodes' in data) data.nodes = jsonValue(data.nodes);

  if (body.flightUuid !== undefined) {
    const flightUuid = cleanText(body.flightUuid);
    const flight = flightUuid ? await fipsService.resolveFlight(flightUuid) : null;
    Object.assign(data, fipsService.fkPatch(flight?.source ?? null, flight?.id ?? null));
  }

  // 检查人：inspectorId（数字，严格）或 inspectorName（姓名，对不上留空）→ inspector_id；没传不改
  const inspectorId = await userService.inspectorIdFromBody(body);
  if (inspectorId !== undefined) data.inspector_id = inspectorId;

  if (Object.keys(data).length === 0) return get(key);

  // schema 里没有 @updatedAt，得自己刷新
  const { count } = await prisma.records_special.updateMany({
    where: { id: key },
    data: { ...data, updateTime: new Date() },
  });
  if (!count) throw notFound(`records_special 里没有 id=${id} 的记录`);
  return get(key);
}

/** 删除（deleteMany：不存在就回 404） */
export async function remove(id) {
  const key = toInt(id);
  if (key === null) throw notFound(`records_special 里没有 id=${id} 的记录`);
  const { count } = await prisma.records_special.deleteMany({ where: { id: key } });
  if (!count) throw notFound(`records_special 里没有 id=${id} 的记录`);
  return { ok: true, id: key };
}
