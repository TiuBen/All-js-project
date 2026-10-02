/**
 * ============================================================
 * special 表 Schema —— 生鲜航班保障节点台账
 * ------------------------------------------------------------
 * 数据来源链路：
 *   src/db/生鲜航班调度节点.xlsx（人工台账，一天一个 sheet）
 *     → src/db/tools/xlsx-to-special-json.py  解析 9. 开头的 29 个 sheet
 *     → src/db/special.json                   （2026 年 9 月，50 条）
 *     → 本模块在**表为空时**灌入 special 表（与 ecyilang 同一套「json 快照 + 种子」做法）
 *
 * 一行 = 「某日 · 某航班」的一次生鲜保障保障过程记录。
 * 列名按需求原样使用驼峰命名，PG 中一律用双引号书写（"belongTime" …）。
 *
 *   id           SERIAL 主键
 *   callsign     航班号（O3182 / CSS122 / ETH3490；个别为 ETH3290/1 这种斜杠写法）
 *   "belongTime" 归属日期 DATE（2026-09-01 ~ 2026-09-29）
 *   "nodesTime"  JSONB —— 该航班的保障节点（结构见 NODES_TIME_SHAPE）
 *   "createTime" 入库时间
 *   "updateTime" 更新时间（后续编辑时由写入方刷新）
 *
 * ★ (callsign, "belongTime") 建唯一索引：它才是业务自然键（一天一个航班一份），
 *   唯一约束让后续「前端录入 → upsert」可以直接 ON CONFLICT。
 * ★ 幂等：建表 / 索引 IF NOT EXISTS；种子只在空表时执行，重复启动不会重复插入，
 *   也不会覆盖后来手改过的行。
 * ============================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 表名 */
export const TABLE = 'special';

/** 种子数据文件（与表同名，便于对照） */
export const SEED_FILE = path.join(__dirname, 'special.json');

/**
 * nodesTime（JSONB）的结构说明 —— 写入方/读取方共用的口径。
 *
 * {
 *   sheet:          '9.1',        // 来源 sheet 名（= 9 月第 1 天）
 *   aircraftType:   'B77L' | null,// 机型；原表多数只写航班号，仅部分带 （B77L）
 *   boardCount:     12 | null,    // 生鲜货物板数（从原始文本里解析出的整数）
 *   boardRaw:       '24板1箱' | null, // 原始文本（含单位/备注，'3版' 为原表错别字）
 *   programStarted: true,         // 是否启动保障程序（'是'/'是（B）'/'B类'/'启动生鲜保障' → true）
 *   programRaw:     '是（B）' | null,
 *   totalMinutes:   72 | null,    // 货物保障时长小计（分钟）
 *   totalRaw:       '125\n驳运超时…' | null, // 原始文本（超时原因等附注）
 *   steps: {                      // 9 个环节，key 与前端 config/specialSpec.js 的 PROCESS_STEPS 一一对应
 *     landing:            { time: '12:28', gap: null }, // time=HH:mm（空串=原表未填）
 *     arrive_stand:       { time: '12:38', gap: 10 },   // gap=原表「与上一环节间隔时长」
 *     open_door:          { time: '12:45', gap: 7 },
 *     start_unload:       { time: '12:49', gap: 4 },
 *     end_unload:         { time: '12:58', gap: 9 },
 *     first_truck_leave:  { time: '13:02', gap: null },
 *     first_truck_arrive: { time: '13:20', gap: null },
 *     last_truck_leave:   { time: '13:19', gap: null },
 *     last_truck_arrive:  { time: '13:40', gap: 21 },
 *   }
 * }
 *
 * 说明：原表里 '/' 表示「不适用/未记录」，统一落成 '' （time）或 null（gap / 数值字段）；
 *       时间统一规整为 HH:mm（原表存在 '1228'、'19：24'、'11;25' 三种写法）。
 */
export const NODES_TIME_SHAPE = 'see above';

/**
 * 字段字典：列名 → 中文含义 / 类型 / 说明
 * 供 GET /api/special/fields 直接输出（与 ecyilang 的 ECYILANG_FIELDS 同一做法）。
 * @typedef {Object} SpecialField
 * @property {string} column  数据库列名（驼峰，接口 JSON 键完全一致）
 * @property {string} label   中文含义
 * @property {string} type    PostgreSQL 列类型
 * @property {string} [note]  取值说明
 */

/** @type {SpecialField[]} */
export const SPECIAL_FIELDS = [
  { column: 'id', label: '主键', type: 'SERIAL', note: '自增，接口路径参数用它' },
  { column: 'callsign', label: '航班号', type: 'VARCHAR(32)', note: '如 O3182 / CSS122 / ETH3490；个别为 ETH3290/1 这种斜杠写法' },
  { column: 'belongTime', label: '归属日期', type: 'DATE', note: 'YYYY-MM-DD，接口一律返回该格式的字符串' },
  {
    column: 'nodesTime',
    label: '保障节点',
    type: 'JSONB',
    note: 'sheet / aircraftType / boardCount / boardRaw / programStarted / programRaw / totalMinutes / totalRaw / steps（9 个环节 { time, gap }）',
  },
  { column: 'createTime', label: '入库时间', type: 'TIMESTAMPTZ', note: '默认 now()' },
  { column: 'updateTime', label: '更新时间', type: 'TIMESTAMPTZ', note: '默认 now()，每次 upsert / update 刷新' },
];

/** 可写入的列（service 拼 SQL 用，顺序即 DDL 顺序） */
export const SPECIAL_COLUMNS = ['callsign', 'belongTime', 'nodesTime'];

/**
 * 查询用的**列清单**（把 belongTime 转成 YYYY-MM-DD 文本、时间戳转 ISO 文本）。
 * ⚠️ 必须显式列出来：SELECT * 会让 node-postgres 把 DATE 解析成 JS Date，
 *    经 JSON 序列化后按 UTC 输出，+08:00 下会**整体退一天**（2026-09-01 → 2026-08-31）。
 */
export const SPECIAL_SELECT = `id,
      callsign,
      "belongTime"::text AS "belongTime",
      "nodesTime",
      "createTime"::text AS "createTime",
      "updateTime"::text AS "updateTime"`;

/** 建表用列定义（不含 id / 时间戳） */
const COLUMNS = SPECIAL_COLUMNS;

/**
 * 建表（幂等）
 */
export async function ensureSpecialTable() {
  const p = getPool();
  await p.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE} (
      id SERIAL PRIMARY KEY,
      callsign VARCHAR(32) NOT NULL,
      "belongTime" DATE NOT NULL,
      "nodesTime" JSONB DEFAULT '{}'::jsonb,
      "createTime" TIMESTAMPTZ DEFAULT now(),
      "updateTime" TIMESTAMPTZ DEFAULT now()
    );
  `);
  // 业务自然键：一天一个航班一份 → 唯一索引（后续 upsert / 防重复导入都靠它）
  await p.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS ${TABLE}_callsign_belong_key
      ON ${TABLE} (callsign, "belongTime");
  `);
  // 按日期取当天全部航班是主要入口
  await p.query(`CREATE INDEX IF NOT EXISTS idx_${TABLE}_belong_time ON ${TABLE} ("belongTime");`);
  console.log(`[DB] 表 ${TABLE} 已就绪`);
}

/**
 * 灌种子：仅当表为空时执行，从 special.json 读入 rows[] 全量导入（50 条）。
 * @returns {Promise<number>} 实际导入条数（表非空时为 0）
 */
export async function seedSpecial() {
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
  const list = Array.isArray(raw?.rows) ? raw.rows : [];
  if (list.length === 0) {
    console.warn(`[DB] ${path.basename(SEED_FILE)} 的 rows[] 为空，跳过导入`);
    return 0;
  }

  // 单条多值 INSERT：50 行 × 3 列 = 150 个占位符。
  // nodesTime 直接传 JS 对象，node-postgres 会序列化成 JSON 交给 jsonb 列。
  const params = [];
  const tuples = list.map((row) => {
    const ph = COLUMNS.map((c) => {
      params.push(row[c] === undefined ? null : row[c]);
      return `$${params.length}`;
    });
    return `(${ph.join(', ')})`;
  });

  await p.query(
    `INSERT INTO ${TABLE} ("${COLUMNS[0]}", "${COLUMNS[1]}", "${COLUMNS[2]}")
     VALUES ${tuples.join(', ')}
     ON CONFLICT (callsign, "belongTime") DO NOTHING`,
    params,
  );
  console.log(`[DB] 表 ${TABLE} 已导入种子数据 ${list.length} 条`);
  return list.length;
}

/**
 * 初始化 special：建表 + 空表灌种子
 * 由 db/schema.js 的 initDb() 在启动时调用。
 */
export async function initSpecial() {
  try {
    await ensureSpecialTable();
    await seedSpecial();
  } catch (err) {
    // 与 initDb 的其它建表步骤一致：失败只告警，不阻断启动
    console.error(`[DB] 初始化 ${TABLE} 失败：`, err.message);
  }
}
