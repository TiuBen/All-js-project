/**
 * ============================================================
 * ecyilang 表 Schema —— 航班计划（接口抓包快照）
 * ------------------------------------------------------------
 * 数据源文件：
 *   - src/db/ecyilang.json            首批快照（2026-09-29，69 条）→ 空表种子
 *   - src/db/ecyilangYYYYMMDD.json    之后每天的抓包快照（一天一份，如
 *     ecyilang20260930.json / ecyilang20261001.json），用
 *     `node src/db/tools/import-ecyilang-snapshot.mjs <file...>` 追加导入；
 *     该工具按批次日期判重，重复跑会整份跳过（要覆盖加 --replace）。
 *   文件形状都是接口响应原样落盘：{ msg, code, count, data[] }。
 *
 * 每行 = 一组「成对航班」（同一时间段内的一离一进）：
 *   d_*  离港侧 —— 本站起飞，d_name 是它的**目的地机场**
 *   a_*  进港侧 —— 前方起飞，a_name 是它的**前方（起飞）机场**
 *   k_h  客/货 标识
 * 佐证：a_plan_time 的中文含义是「前方计划起飞时间」，与 a_name（前方机场）成对。
 *
 * ⚠️ 时间/日期字段一律 VARCHAR 存原始字符串，不做时区转换 —— 与 fips 表保持一致。
 * ⚠️ 空串 '' 与 NULL 语义不同，不能互相替换：
 *      state_name = ''   → 该航班已取消（abnormal_state = CAN）
 *      state_name = NULL → 该侧本来就没有航班
 *
 * 下表 ECYILANG_FIELDS 是**唯一事实来源**：DDL 列、可选字段白名单、
 * 前端字段字典接口都从它派生，避免三处各写一遍导致漂移。
 * （字段含义整理自原 ecyilangSchema.js 里的中文注释片段。）
 * ============================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 种子数据文件路径（与表同名，便于对照） */
export const SEED_FILE = path.join(__dirname, 'ecyilang.json');

/**
 * 字段字典：列名 → 中文含义 / 所属侧 / 数据类型 / 取值说明
 * @typedef {Object} EcyilangField
 * @property {string} column  数据库列名（与接口 JSON 键完全一致）
 * @property {string} label   中文含义
 * @property {'d'|'a'|'k'} side  归属：d=离港侧 / a=进港侧 / k=公共
 * @property {'enum'|'time'|'code'|'text'|'date'} kind 语义类型
 * @property {string} sqlType PostgreSQL 列类型
 * @property {string} [note]  取值说明
 */

/** @type {EcyilangField[]} */
export const ECYILANG_FIELDS = [
  { column: 'd_flight_type_code', label: '离场任务性质', side: 'd', kind: 'code', sqlType: 'VARCHAR(16)', note: '任务性质代码，已见 H/Z、H/G、W/Z；NULL = 该侧无航班' },
  { column: 'd_plan_time', label: '计划起飞时间', side: 'd', kind: 'time', sqlType: 'VARCHAR(16)', note: 'HH:mm，可带跨天后缀 (+1)' },
  { column: 'd_jx', label: '离港机型', side: 'd', kind: 'code', sqlType: 'VARCHAR(16)', note: '如 B763 / B77L / B744 / A321' },
  { column: 'd_flight_date', label: '离港航班批次日期', side: 'd', kind: 'date', sqlType: 'VARCHAR(32)', note: '航班计划获取时间，作为跨天时间换算的基准日' },
  { column: 'd_flight_no_full', label: '离港航班号', side: 'd', kind: 'code', sqlType: 'VARCHAR(32)', note: '含航司前缀，如 O37212 / 5Y8255 / 3U9196' },
  { column: 'd_country_type', label: '离港航班类型（国内/国际/地区）', side: 'd', kind: 'enum', sqlType: 'VARCHAR(16)', note: 'DOM 国内 / INT 国际 / REG 地区（样本中 REG 仅对应香港）' },
  { column: 'd_name', label: '离港目的地机场', side: 'd', kind: 'text', sqlType: 'VARCHAR(64)', note: '中文城市名，如 上海浦东 / 安克雷奇' },
  { column: 'd_craft_seat_code', label: '离港机位代码', side: 'd', kind: 'code', sqlType: 'VARCHAR(16)', note: '### / ###L / ###R，样本范围 301~721' },
  { column: 'd_state_name', label: '离港状态', side: 'd', kind: 'enum', sqlType: 'VARCHAR(32)', note: '起飞；空串=已取消；NULL=该侧无航班' },
  { column: 'd_time', label: '离港时间', side: 'd', kind: 'time', sqlType: 'VARCHAR(16)', note: '预计或实际离港时间，无跨天后缀' },
  { column: 'd_abnormal_state', label: '离港不正常状态', side: 'd', kind: 'enum', sqlType: 'VARCHAR(16)', note: 'CAN 取消 / DLY 延误；正常为 NULL' },

  { column: 'a_flight_type_code', label: '进港任务性质', side: 'a', kind: 'code', sqlType: 'VARCHAR(16)', note: '任务性质代码，已见 H/Z、H/G、W/Z、N/M；NULL = 该侧无航班' },
  { column: 'a_plan_time', label: '前方计划起飞时间', side: 'a', kind: 'time', sqlType: 'VARCHAR(16)', note: 'HH:mm，可带跨天后缀 (-1)；即进港航班在前方机场的计划起飞时刻' },
  { column: 'a_jx', label: '进港机型', side: 'a', kind: 'code', sqlType: 'VARCHAR(16)', note: '同 d_jx' },
  { column: 'a_flight_date', label: '进港航班批次日期', side: 'a', kind: 'date', sqlType: 'VARCHAR(32)', note: '进港侧的批次日期，作跨天换算基准' },
  { column: 'a_flight_no_full', label: '进港航班号', side: 'a', kind: 'code', sqlType: 'VARCHAR(32)', note: '同 d_flight_no_full' },
  { column: 'a_country_type', label: '进港航班类型（国内/国际/地区）', side: 'a', kind: 'enum', sqlType: 'VARCHAR(16)', note: 'DOM / INT / REG' },
  { column: 'a_name', label: '进港前方（起飞）机场', side: 'a', kind: 'text', sqlType: 'VARCHAR(64)', note: '中文城市名' },
  { column: 'a_craft_seat_code', label: '进港机位代码', side: 'a', kind: 'code', sqlType: 'VARCHAR(16)', note: '### / ###L / ###R' },
  { column: 'a_state_name', label: '进港状态', side: 'a', kind: 'enum', sqlType: 'VARCHAR(32)', note: '到达 / 前方起飞；空串=已取消；NULL=该侧无航班' },
  { column: 'a_time', label: '进港时间', side: 'a', kind: 'time', sqlType: 'VARCHAR(16)', note: '预计或实际到达时间，无跨天后缀' },
  { column: 'a_abnormal_state', label: '进港不正常状态', side: 'a', kind: 'enum', sqlType: 'VARCHAR(16)', note: 'CAN 取消 / DLY 延误；正常为 NULL' },

  { column: 'k_h', label: '客/货标识', side: 'k', kind: 'enum', sqlType: 'VARCHAR(8)', note: '原始注释另注「尾流等级」；已见 H、K、F' },
];

/** 可写入的列名白名单（顺序即 DDL 顺序，供 service 拼 SQL 用） */
export const ECYILANG_COLUMNS = ECYILANG_FIELDS.map((f) => f.column);

/** 表名 */
export const TABLE = 'ecyilang';

/**
 * 建表（幂等）
 * 表结构 = 字段字典 + id 主键 + uuid 航班身份标识 + created_at
 * uuid 与 manual_fips 一致：前端创建检查单时当 flightId / 草稿归档键用。
 */
export async function ensureEcyilangTable() {
  const p = getPool();
  const cols = ECYILANG_FIELDS.map((f) => `        ${f.column} ${f.sqlType}`).join(',\n');
  await p.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id SERIAL PRIMARY KEY,
${cols},
      uuid VARCHAR(64) NOT NULL DEFAULT gen_random_uuid()::text,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
  // 迁移：老库补 uuid 列（幂等；已有行自动回填默认值）
  await p.query(`
    ALTER TABLE ${TABLE}
      ADD COLUMN IF NOT EXISTS uuid VARCHAR(64) NOT NULL DEFAULT gen_random_uuid()::text;
  `);
  await p.query(`CREATE UNIQUE INDEX IF NOT EXISTS ${TABLE}_uuid_key ON ${TABLE}(uuid);`);
  // 按批次日期查询是列表的主要入口，建索引
  await p.query(`CREATE INDEX IF NOT EXISTS idx_${TABLE}_d_flight_date ON ${TABLE}(d_flight_date);`);
  await p.query(`CREATE INDEX IF NOT EXISTS idx_${TABLE}_a_flight_date ON ${TABLE}(a_flight_date);`);
  console.log(`[DB] 表 ${TABLE} 已就绪`);
}

/**
 * 灌种子数据：仅当表为空时执行，从 ecyilang.json 读入 data[] 全量导入。
 * 幂等 —— 重复启动不会重复插入，也不会覆盖你后续手工改过的行。
 * @returns {Promise<number>} 实际导入条数（表非空时为 0）
 */
export async function seedEcyilang() {
  const p = getPool();
  const { rows } = await p.query(`SELECT COUNT(*)::int AS n FROM ${TABLE}`);
  if (rows[0].n > 0) {
    console.log(`[DB] 表 ${TABLE} 已有 ${rows[0].n} 行，跳过种子导入`);
    return 0;
  }
  if (!fs.existsSync(SEED_FILE)) {
    console.warn(`[DB] 未找到种子文件 ${SEED_FILE}，跳过导入`);
    return 0;
  }

  const raw = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
  const list = Array.isArray(raw?.data) ? raw.data : [];
  if (list.length === 0) {
    console.warn(`[DB] ${path.basename(SEED_FILE)} 的 data[] 为空，跳过导入`);
    return 0;
  }

  // 单条多值 INSERT：69 行 × 23 列 = 1587 个占位符，远低于 PG 的 65535 上限。
  // 注意：值一律原样入库（不把 '' 转成 NULL）—— 空串在 state_name 上表示"已取消"。
  const params = [];
  const tuples = list.map((row) => {
    const ph = ECYILANG_COLUMNS.map((c) => {
      params.push(row[c] === undefined ? null : row[c]);
      return `$${params.length}`;
    });
    return `(${ph.join(', ')})`;
  });

  await p.query(
    `INSERT INTO ${TABLE} (${ECYILANG_COLUMNS.join(', ')}) VALUES ${tuples.join(', ')}`,
    params,
  );
  console.log(`[DB] 表 ${TABLE} 已导入种子数据 ${list.length} 条`);
  return list.length;
}

/**
 * 初始化 ecyilang：建表 + 空表灌种子
 * 由 db/schema.js 的 initDb() 在启动时调用。
 */
export async function initEcyilang() {
  try {
    await ensureEcyilangTable();
    await seedEcyilang();
  } catch (err) {
    // 与 initDb 的其它建表步骤保持一致：失败只告警，不阻断启动
    console.error(`[DB] 初始化 ${TABLE} 失败：`, err.message);
  }
}
