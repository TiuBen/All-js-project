/**
 * ============================================================
 * 检查单记录 Service —— 业务逻辑层
 * ------------------------------------------------------------
 * 封装 checklist_records 表的全部数据访问：
 *   listRecords / getRecord / createRecord / updateRecord / deleteRecord
 *
 * ★ 三个写动作 = 三个 REST 动词，语义互不重叠（绝无隐式覆盖）：
 *   - createRecord  POST   → **永远 INSERT 一条新记录**（不再按 flight_uuid upsert）
 *   - updateRecord  PUT    → 只改 id 指定的那一条
 *   - deleteRecord  DELETE → 只删 id 指定的那一条
 *   一个航班可以有多份检查单（同航班重填 / 换类型各一份），所以 flight_uuid
 *   上没有唯一约束，只有普通索引。
 *
 * 其它规则：
 *   - 已提交且超过 24 小时的记录锁定，禁止再修改（前端 + 后端双重拦截），
 *     锁定基准时间 = updated_at（最后一次修改/提交时间）；
 *   - 每次增/删/改后重算来源表（fips / manual_fips）的 checklist_uuid
 *     （= 该航班最新一份检查单 id，一份都不剩则 NULL），供航班列表展示"已有检查单"。
 *     ecyilang 没有这个列（外部快照表），见 CHECKLIST_LINK_TABLES 的说明。
 *   - 表结构：不存 checked_at，时间字段只有 created_at（创建）/ updated_at（修改）。
 *
 * ★ flight_uuid（原列名 flight_id）指向航班：三张航班表的 **id 就是随机 uuid v4**，
 *   跨表碰撞概率可忽略 → 天然跨表唯一（2026-10-03 主键 UUID 化之前是
 *   「整数 id + 独立 uuid 列 + flight_uuid_registry 名字簿」，那套已整体删除），
 *   所以一个字段就能唯一定位航班，
 *   不需要再记"来自哪张表"。历史值（'fips-123' / 'manual-5' / 裸数字 '5'）已在
 *   一次性迁移脚本里统一迁移成 uuid。
 *
 * ★ 写入关口：createRecord 收到的是前端字段名 flightId，但**值**必须先经
 *   flightService.resolveFlightRef() 解析成真 uuid 才落库 ——
 *   旧写法（裸数字 / 'fips-1' / 'manual-2'）随整数主键一并失效，转不出来直接 400。
 *   绝不放行非法值：孤儿清理每次启动都跑，非法值会在下次重启时把记录悄悄删掉。
 * ============================================================
 */
import { query } from '../db/pool.js';
import * as flightService from './flightService.js';

/** 提交后可修改的时限（小时）：超过则锁定 */
export const EDIT_LOCK_HOURS = 24;

/** 标准 UUID 形状 —— 本表与三张航班表的主键都是它，先过筛子再进 SQL（否则 PG 抛类型错） */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 需要同步 checklist_uuid 的来源表
 * ------------------------------------------------------------
 * ⚠️ 只有 fips / manual_fips 有 checklist_uuid 列，**ecyilang 没有**：
 *   它是外部系统同步来的航班计划快照（整个批次会被 --replace 重灌），
 *   前端切到 ecyilang 数据源时也不展示"已有检查单"。
 *   所以这里刻意**不用** flightRefSchema 的 FLIGHT_TABLES（那个含 ecyilang，
 *   用于孤儿清理时只需要 id，没这个问题）——
 *   早先直接遍历 FLIGHT_TABLES，一旦给 ecyilang 航班建检查单就会在
 *   `UPDATE ecyilang SET checklist_uuid = ...` 上抛
 *   `column "checklist_uuid" does not exist`，接口 500。
 */
const CHECKLIST_LINK_TABLES = ['fips', 'manual_fips'];

/**
 * 24 小时锁定校验：记录已提交且最后修改时间距今超过 EDIT_LOCK_HOURS → 抛 409
 * @param {Object} record 已存在的记录行
 */
function assertEditable(record) {
  if (record?.status !== 'submitted') return;
  const ts = record.updated_at ? new Date(record.updated_at).getTime() : 0;
  if (ts && Date.now() - ts > EDIT_LOCK_HOURS * 3600 * 1000) {
    const err = new Error(`该检查单已提交超过 ${EDIT_LOCK_HOURS} 小时，不可再修改`);
    err.status = 409;
    throw err;
  }
}

/**
 * 重算并同步来源表的 checklist_uuid
 * ------------------------------------------------------------
 * ★ 口径 = **该航班最新一份检查单的 id**（一个航班可以有多份）：
 *   列表页只用它回答"这个航班有没有检查单"，所以增/改/删之后整体重算最省心 ——
 *   删掉最新那份会自动指回上一份，一份都不剩则置 NULL，不会留下悬空 id。
 * ★ flight_uuid 在三张航班表里天然唯一，所以挨个表试一遍即可：命中哪张表就更新哪张表。
 *   两张表都是空跑一次 UPDATE ... WHERE id = ...（走主键索引，代价可忽略）。
 * ★ 比对时用 base_flight_uuid() 剥掉 ecyilang 的 '-d' / '-a' 航段后缀 ——
 *   前端拿到的是带后缀的航班键，而库里存的是那条计划行的 id（uuid）。
 *   （ecyilang 航班不会命中：它没有 checklist_uuid 列，见 CHECKLIST_LINK_TABLES。）
 * @param {string} flightUuid checklist_records.flight_uuid
 */
async function syncChecklistUuid(flightUuid) {
  // 航班键可能带 ecyilang 的 '-d' / '-a' 航段后缀，先剥掉
  // （SQL 里 base_flight_uuid() 也在剥，这里剥是为了让外层能直接拿它当 uuid 比）
  const base = String(flightUuid ?? '').trim().replace(/-[da]$/, '');
  // 非 uuid 的存量值直接跳过：外层按 uuid 比较（$2::uuid），脏值会让 PG 抛类型错 → 接口 500
  if (!UUID_RE.test(base)) return;

  for (const table of CHECKLIST_LINK_TABLES) {
    // 子查询取最新一份；没有记录时子查询为 NULL（正好把关联清掉）
    // ⚠️ 两个占位符必须分开：$1 是 text（喂给 base_flight_uuid 做文本比对），
    //    $2 是 uuid（比主键 id）。同一个参数被推断成两种类型时 PG 会直接
    //    `inconsistent types deduced for parameter` 报错 —— id 从整数换成 uuid
    //    之后就必须这么写了（以前 `WHERE uuid = ...` 两边都是 varchar 没问题）。
    // ⚠️ 排序不能用 r.id：主键已是随机 uuid，排出来没有时间含义（原来是自增 id）。
    const { rowCount } = await query(
      `UPDATE ${table} SET checklist_uuid = (
         SELECT r.id::text FROM checklist_records r
         WHERE base_flight_uuid(r.flight_uuid) = $1
         ORDER BY r.created_at DESC NULLS LAST, r.updated_at DESC NULLS LAST
         LIMIT 1
       ) WHERE id = $2::uuid`,
      [base, base],
    );
    if (rowCount > 0) return;
  }
}

/**
 * 查询检查单填写记录
 * @param {Object} filter 过滤条件
 * @param {string} [filter.flightId]  按航班过滤
 * @param {string} [filter.category]  按检查单分类（货运航班 / 客运航班）过滤
 * @param {string} [filter.date]      精确日期（按"检查日期"，本地东8区）
 * @param {string} [filter.from]      范围起始日期
 * @param {string} [filter.to]        范围结束日期
 * @returns {Promise<Array>} 记录数组
 */
export async function listRecords(filter = {}) {
  const { flightId, category, date, from, to } = filter;
  let sql = 'SELECT * FROM checklist_records WHERE 1=1';
  const params = [];

  if (flightId) {
    params.push(flightId);
    sql += ` AND flight_uuid = $${params.length}`;
  }
  if (category) {
    params.push(category);
    sql += ` AND checklist_category = $${params.length}`;
  }
  // 按"日期"过滤（COALESCE(created_at, updated_at)，本地东8区取日）：
  // - 口径 = **创建日**（"这份检查单是哪天填写的"）—— 与填写记录页的表格/日历徽标一致；
  //   后续修改不再把记录挪到别的日期下。
  // - 不与 flight_date（航班日期）混用：手动航班 flight_date 可能为 NULL。
  // - 时间字段为 TIMESTAMPTZ（UTC 存储）。PG 会话时区是 Asia/Shanghai，
  //   若直接 (ts + interval '8 hours')::date 会双重转换（多算 8h）；必须先用
  //   AT TIME ZONE 'UTC' 取 UTC 无时区表示，再 +8h 取本地日，保证确定性。
  const dateExpr = `(COALESCE(created_at, updated_at) AT TIME ZONE 'UTC' + interval '8 hours')::date`;
  if (date) {
    params.push(date);
    sql += ` AND ${dateExpr} = $${params.length}`;
  } else {
    if (from) {
      params.push(from);
      sql += ` AND ${dateExpr} >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      sql += ` AND ${dateExpr} <= $${params.length}`;
    }
  }

  sql += ' ORDER BY COALESCE(created_at, updated_at) DESC LIMIT 500';
  const { rows } = await query(sql, params);
  return rows;
}

/**
 * 查询单个填写记录
 * @param {string} id 记录主键（uuid）
 * @returns {Promise<Object|null>} 记录；不存在返回 null
 */
export async function getRecord(id) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return null;
  const { rows } = await query('SELECT * FROM checklist_records WHERE id = $1', [key]);
  return rows.length ? rows[0] : null;
}

/**
 * 新建填写记录 —— **POST 语义：永远 INSERT 一条新记录**
 * ------------------------------------------------------------
 * ★ 不再按 flight_uuid upsert：以前"同航班已有记录 → 转更新"会让航班列表里的
 *   「创建检查表」把上一次的记录覆盖掉（用户点了新建却改了旧单子）。
 *   现在新建就是新建 —— 同一航班允许存在多份检查单（重填 / 不同类型各一份），
 *   要改已有记录请走 updateRecord(id)。
 * @param {Object} data 记录数据（flightId 必填）
 * @returns {Promise<Object>} 新建的记录
 */
export async function createRecord(data) {
  if (!data.flightId) {
    const err = new Error('flightId is required');
    err.status = 400;
    throw err;
  }

  // ★ 写入前必须把「航班引用」解析成真 uuid。
  //   裸数字 / 'fips-1' / 'manual-2' 这类旧写法在这里转换成 uuid；转不出来直接 400。
  //   为什么不能放行非法值：非法值落了库就变成**挂不上任何航班的孤儿记录** ——
  //   航班列表关联不到、也没人会再去清它，只能人工捞。宁可现在报错。
  //   （原先每次启动还有一道孤儿清理兜底，它随 initDb 一起下线了，
  //     见 prisma/migrations/0_init/migration.sql 的说明。）
  const ref = await flightService.resolveFlightRef(data.flightId);
  if (!ref) {
    const err = new Error(
      `flightId（${data.flightId}）对不上任何航班（fips / manual_fips / ecyilang 都没有），无法建立检查单`,
    );
    err.status = 400;
    throw err;
  }
  const flightUuid = ref.uuid;

  const { rows } = await query(
    `INSERT INTO checklist_records
      (flight_uuid, flight_no, aircraft_type, checklist_category, flight_date,
       header, items, video_supervision, inspector, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      flightUuid,
      data.flightNo || null,
      data.aircraftType || null,
      data.checklistCategory || null,
      data.flightDate || null,
      data.header ? JSON.stringify(data.header) : null,
      data.items ? JSON.stringify(data.items) : null,
      data.videoSupervision ? JSON.stringify(data.videoSupervision) : null,
      data.inspector || null,
      data.status || 'draft',
    ],
  );
  // 来源表的"最新检查单"标记随之指向这条新记录
  await syncChecklistUuid(flightUuid);
  return rows[0];
}

/**
 * 更新填写记录（只更新传入的字段）
 * 已提交且最后修改时间超过 24 小时 → 拒绝（409，不可再修改）
 * ★ 只改 id 指定的这一条 —— 前端"修改"按钮专走这里（POST 才是新建）。
 * 说明：checklist_category / flight_no / aircraft_type / flight_date 为可选项，
 *       传入时才更新（COALESCE 保持原值），记录页"检查单"列随之更新。
 * @param {string} id 记录主键（uuid）
 * @param {Object} data 要更新的字段
 * @returns {Promise<Object|null>} 更新后的记录；不存在返回 null
 */
export async function updateRecord(id, data) {
  // 先读当前状态做 24h 锁定校验（已提交 + 超时 → 抛 409）
  const current = await getRecord(id);
  if (!current) return null;
  assertEditable(current);

  const key = String(id ?? '').trim();
  const { rows } = await query(
    `UPDATE checklist_records
       SET header = COALESCE($1, header),
           items = COALESCE($2, items),
           video_supervision = COALESCE($3, video_supervision),
           inspector = COALESCE($4, inspector),
           status = COALESCE($5, status),
           checklist_category = COALESCE($6, checklist_category),
           flight_no = COALESCE($7, flight_no),
           aircraft_type = COALESCE($8, aircraft_type),
           flight_date = COALESCE($9, flight_date),
           updated_at = now()
     WHERE id = $10
     RETURNING *`,
    [
      data.header ? JSON.stringify(data.header) : null,
      data.items ? JSON.stringify(data.items) : null,
      data.videoSupervision ? JSON.stringify(data.videoSupervision) : null,
      data.inspector || null,
      data.status || null,
      data.checklistCategory || null,
      data.flightNo || null,
      data.aircraftType || null,
      data.flightDate || null,
      key,
    ],
  );
  if (rows.length) {
    // 同步来源表的"最新检查单"标记（幂等；也顺手补上历史数据未关联的情况）
    await syncChecklistUuid(rows[0].flight_uuid);
  }
  return rows.length ? rows[0] : null;
}

/**
 * 删除填写记录 —— 只删 id 指定的这一条
 * 删完重算来源表的 checklist_uuid：该航班还有别的检查单就指向最新一份，
 * 一份都不剩才置 NULL（否则航班列表仍会显示"已有检查单"）。
 * @param {string} id 记录主键（uuid）
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteRecord(id) {
  const key = String(id ?? '').trim();
  if (!UUID_RE.test(key)) return false;
  const { rows } = await query(
    'DELETE FROM checklist_records WHERE id = $1 RETURNING id, flight_uuid',
    [key],
  );
  if (!rows.length) return false;
  await syncChecklistUuid(rows[0].flight_uuid);
  return true;
}
