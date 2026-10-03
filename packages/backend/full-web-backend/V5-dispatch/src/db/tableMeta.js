/**
 * ============================================================
 * 表结构元信息（运行时用）—— 从 prisma/schema.prisma 解析而来
 * ------------------------------------------------------------
 * 为什么有这个文件：
 *   表结构的**唯一来源**是 prisma/schema.prisma（DDL / 列顺序 / 列类型都在那）。
 *   但业务代码拼 SQL 时需要「列清单」这种东西，以前这些清单分别写在
 *   db/specialSchema.js、db/ecyilangSchema.js 里 —— 加一个列要同步改好几处，
 *   正是这个项目吐槽的「改表结构要很多操作」。
 *   现在改成**启动时读 prisma/schema.prisma 解析出列清单**，于是：
 *       加 / 删 / 改列 → 只改 prisma/schema.prisma → pnpm db:push
 *   业务代码这边自动跟上，不用再动。
 *
 * 本文件同时保留「纯文档」的字段中文名与取值说明（SPECIAL_FIELDS /
 *   ECYILANG_FIELDS 两个数组），它们只是接口自描述用的，不参与拼 SQL，
 *   写错了不会影响 SQL 正确性；末尾有一致性告警帮你看住别写漏。
 *
 * ⚠️ 这里**不再有任何建表 / 迁移 / 种子逻辑**：
 *   建表交给 `pnpm db:push`（或 `pnpm prisma migrate deploy`），
 *   4 个自定义 SQL 函数见 prisma/migrations/0_init/migration.sql。
 * ============================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** prisma/schema.prisma 的绝对路径：src/db → src → 项目根 → prisma/schema.prisma */
const SCHEMA_FILE = path.resolve(__dirname, '..', '..', 'prisma', 'schema.prisma');

/**
 * 解析 prisma/schema.prisma，取出每个 model 的列清单（顺序即 DDL 顺序）
 * 只认 `  <列名> <类型>` 这种字段行；`//` `///` 注释、`@@index` 之类的块属性跳过。
 * @param {string} file
 * @returns {Record<string, Array<{column: string, type: string, optional: boolean}>>}
 */
function parsePrismaSchema(file) {
  let src;
  try {
    src = fs.readFileSync(file, 'utf8');
  } catch (err) {
    throw new Error(`[tableMeta] 读不到 ${file}：${err.message}（表结构的唯一来源就是它）`);
  }

  const models = {};
  const modelRe = /^model\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)^\}/gm;
  let m;
  while ((m = modelRe.exec(src))) {
    const [, name, body] = m;
    const cols = [];
    for (const raw of body.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('//') || line.startsWith('@@')) continue;
      const f = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z][A-Za-z0-9_]*)(\?)?/);
      if (!f) continue;
      cols.push({ column: f[1], type: f[2], optional: !!f[3] });
    }
    models[name] = cols;
  }

  if (Object.keys(models).length === 0) {
    throw new Error(`[tableMeta] 没能从 ${file} 解析出任何 model —— 文件是不是被改坏了？`);
  }
  return models;
}

const MODELS = parsePrismaSchema(SCHEMA_FILE);

/** 取某张表的列清单；表名写错时立刻报错（不要静默生成空清单） */
function columnsOf(table) {
  const cols = MODELS[table];
  if (!cols || cols.length === 0) {
    throw new Error(`[tableMeta] prisma/schema.prisma 里找不到 model ${table}`);
  }
  return cols;
}

/**
 * SQL 标识符按需加双引号。
 * PostgreSQL 会把未加引号的标识符折叠成小写，所以驼峰列（belongTime）必须加。
 */
const ident = (name) => (/[A-Z]/.test(name) ? `"${name}"` : name);

/**
 * 生成查询用的列表达式。
 * ⚠️ DateTime 列必须显式 `::text`：SELECT * 会让 node-postgres 把它解析成 JS Date，
 *    经 JSON 序列化后按 UTC 输出，+08:00 下会**整体退一天**
 *    （2026-09-01 的 DATE 会变成 2026-08-31）。uuid / varchar 本来就返回字符串，不用转。
 */
const selectExpr = (c) => (c.type === 'DateTime'
  ? `${ident(c.column)}::text AS ${ident(c.column)}`
  : ident(c.column));

// ------------------------------------------------------------
// 各表对外导出的常量
// ------------------------------------------------------------

/** special_records 表名 */
export const SPECIAL_TABLE = 'special_records';

/** special_records 的查询列清单（从 schema 解析，顺序 = DDL 顺序） */
export const SPECIAL_SELECT = columnsOf(SPECIAL_TABLE).map(selectExpr).join(', ');

/** ecyilang 表名 */
export const ECYILANG_TABLE = 'ecyilang';

/**
 * ecyilang 可写入的列名清单（供 service 拼动态 INSERT / UPDATE 用）。
 * 只排除主键与入库时间戳，其余全给 —— 与 schema 的列顺序一致。
 */
export const ECYILANG_COLUMNS = columnsOf(ECYILANG_TABLE)
  .filter((c) => c.column !== 'id' && c.column !== 'created_at')
  .map((c) => c.column);

/**
 * 三张航班表（互为「不同来源的航班」，id 都是随机 uuid v4）。
 * 反查「一个 uuid 到底是哪个航班」时按这个顺序试。
 * ⚠️ 注意 ecyilang **没有** checklist_uuid 列，能挂检查单的只有 fips / manual_fips，
 *    见 services/checklistService.js 的 CHECKLIST_LINK_TABLES。
 */
export const FLIGHT_TABLES = ['fips', 'manual_fips', 'ecyilang'];

// ============================================================
// 以下为**纯接口文档**（不参与拼 SQL，仅供 GET /api/*/fields 自描述）
// ============================================================

/**
 * nodesTime（JSONB）的结构约定 —— 写入方 / 读取方共用的口径。
 * （原文在 db/specialSchema.js 的 NODES_TIME_SHAPE，随该文件移走后搬到这里）
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
 *
 * 另有 freshMark 子键：生鲜标记内容（见 services/freshAirCargoService.js），
 *   与上面的保障节点互不干扰。
 */

/**
 * special_records 字段字典：列名 → 中文含义 / 类型 / 说明
 * 供 GET /api/special/fields 直接输出。
 * @typedef {Object} SpecialField
 * @property {string} column  数据库列名（驼峰，接口 JSON 键完全一致）
 * @property {string} label   中文含义
 * @property {string} type    PostgreSQL 列类型
 * @property {string} [note]  取值说明
 */

/** @type {SpecialField[]} */
export const SPECIAL_FIELDS = [
  { column: 'id', label: '主键', type: 'UUID', note: '随机 uuid v4，接口路径参数用它' },
  {
    column: 'flight_uuid',
    label: '航班 uuid',
    type: 'VARCHAR(64)',
    note: '指向 fips / manual_fips / ecyilang 里那一行的 id（三表 id 都是随机 uuid）；写入时由 callsign + belongTime 自动解析',
  },
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

/**
 * ecyilang 字段字典：列名 → 中文含义 / 所属侧 / 数据类型 / 取值说明
 * 供 GET /api/ecyilang/fields 直接输出。
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
    {
        column: "d_flight_type_code",
        label: "离场任务性质",
        side: "d",
        kind: "code",
        sqlType: "VARCHAR(16)",
        note: "任务性质代码，已见 H/Z、H/G、W/Z；NULL = 该侧无航班",
    },
    {
        column: "d_plan_time",
        label: "计划起飞时间",
        side: "d",
        kind: "time",
        sqlType: "VARCHAR(16)",
        note: "HH:mm，可带跨天后缀 (+1)",
    },
    {
        column: "d_jx",
        label: "离港机型",
        side: "d",
        kind: "code",
        sqlType: "VARCHAR(16)",
        note: "如 B763 / B77L / B744 / A321",
    },
    {
        column: "d_flight_date",
        label: "离港航班归属日期",
        side: "d",
        kind: "date",
        sqlType: "VARCHAR(32)",
        note: "航班计划获取时间，作为跨天时间换算的基准日",
    },
    {
        column: "d_flight_no_full",
        label: "离港航班号",
        side: "d",
        kind: "code",
        sqlType: "VARCHAR(32)",
        note: "含航司前缀，如 O37212 / 5Y8255 / 3U9196",
    },
    {
        column: "d_country_type",
        label: "离港航班类型（国内/国际/地区）",
        side: "d",
        kind: "enum",
        sqlType: "VARCHAR(16)",
        note: "DOM 国内 / INT 国际 / REG 地区（样本中 REG 仅对应香港）",
    },
    {
        column: "d_name",
        label: "离港目的地机场",
        side: "d",
        kind: "text",
        sqlType: "VARCHAR(64)",
        note: "中文城市名，如 上海浦东 / 安克雷奇",
    },
    {
        column: "d_name_iata_code",
        label: "离港目的地机场 IATA 三字码",
        side: "d",
        kind: "code",
        sqlType: "VARCHAR(8)",
        note: "由 airport_name_code 参照表按 d_name 回填；NULL = 未收录或未回填",
    },
    {
        column: "d_name_icao_code",
        label: "离港目的地机场 ICAO 四字码",
        side: "d",
        kind: "code",
        sqlType: "VARCHAR(8)",
        note: "同 d_name_iata_code",
    },
    {
        column: "d_craft_seat_code",
        label: "离港机位代码",
        side: "d",
        kind: "code",
        sqlType: "VARCHAR(16)",
        note: "### / ###L / ###R，样本范围 301~721",
    },
    {
        column: "d_state_name",
        label: "离港状态",
        side: "d",
        kind: "enum",
        sqlType: "VARCHAR(32)",
        note: "起飞；空串=已取消；NULL=该侧无航班",
    },
    {
        column: "d_time",
        label: "离港时间",
        side: "d",
        kind: "time",
        sqlType: "VARCHAR(16)",
        note: "预计或实际离港时间，无跨天后缀",
    },
    {
        column: "d_abnormal_state",
        label: "离港不正常状态",
        side: "d",
        kind: "enum",
        sqlType: "VARCHAR(16)",
        note: "CAN 取消 / DLY 延误；正常为 NULL",
    },

    {
        column: "a_flight_type_code",
        label: "进港任务性质",
        side: "a",
        kind: "code",
        sqlType: "VARCHAR(16)",
        note: "任务性质代码，已见 H/Z、H/G、W/Z、N/M；NULL = 该侧无航班",
    },
    {
        column: "a_plan_time",
        label: "前方计划起飞时间",
        side: "a",
        kind: "time",
        sqlType: "VARCHAR(16)",
        note: "HH:mm，可带跨天后缀 (-1)；即进港航班在前方机场的计划起飞时刻",
    },
    { column: "a_jx", label: "进港机型", side: "a", kind: "code", sqlType: "VARCHAR(16)", note: "同 d_jx" },
    {
        column: "a_flight_date",
        label: "进港航班归属日期",
        side: "a",
        kind: "date",
        sqlType: "VARCHAR(32)",
        note: "进港侧的批次日期，作跨天换算基准",
    },
    {
        column: "a_flight_no_full",
        label: "进港航班号",
        side: "a",
        kind: "code",
        sqlType: "VARCHAR(32)",
        note: "同 d_flight_no_full",
    },
    {
        column: "a_country_type",
        label: "进港航班类型（国内/国际/地区）",
        side: "a",
        kind: "enum",
        sqlType: "VARCHAR(16)",
        note: "DOM / INT / REG",
    },
    {
        column: "a_name",
        label: "进港前方（起飞）机场",
        side: "a",
        kind: "text",
        sqlType: "VARCHAR(64)",
        note: "中文城市名",
    },
    {
        column: "a_name_iata_code",
        label: "进港前方机场 IATA 三字码",
        side: "a",
        kind: "code",
        sqlType: "VARCHAR(8)",
        note: "由 airport_name_code 参照表按 a_name 回填；NULL = 未收录或未回填",
    },
    {
        column: "a_name_icao_code",
        label: "进港前方机场 ICAO 四字码",
        side: "a",
        kind: "code",
        sqlType: "VARCHAR(8)",
        note: "同 a_name_iata_code",
    },
    {
        column: "a_craft_seat_code",
        label: "进港机位代码",
        side: "a",
        kind: "code",
        sqlType: "VARCHAR(16)",
        note: "### / ###L / ###R",
    },
    {
        column: "a_state_name",
        label: "进港状态",
        side: "a",
        kind: "enum",
        sqlType: "VARCHAR(32)",
        note: "到达 / 前方起飞；空串=已取消；NULL=该侧无航班",
    },
    {
        column: "a_time",
        label: "进港时间",
        side: "a",
        kind: "time",
        sqlType: "VARCHAR(16)",
        note: "预计或实际到达时间，无跨天后缀",
    },
    {
        column: "a_abnormal_state",
        label: "进港不正常状态",
        side: "a",
        kind: "enum",
        sqlType: "VARCHAR(16)",
        note: "CAN 取消 / DLY 延误；正常为 NULL",
    },

    {
        column: "k_h",
        label: "客/货标识",
        side: "k",
        kind: "enum",
        sqlType: "VARCHAR(8)",
        note: "原始注释另注「尾流等级」；已见 H、K、F",
    },
];

// ------------------------------------------------------------
// 一致性告警：文档数组的列名必须与 prisma/schema.prisma 覆盖同一批列
// （只 warn 不抛错 —— 文档写漏了不该让服务起不来）
// ⚠️ 按**集合**比，不按顺序比：文档里的顺序是给人看的（把 *_name_iata_code
//    紧跟 *_name 分组），而 schema 里的顺序是库里的物理列序，两者不必一致。
// ------------------------------------------------------------
function warnIfDrifted(docs, actual, what) {
  const norm = (arr) => [...new Set(arr)].sort().join(',');
  const fromDocs = norm(docs.map((d) => d.column));
  const fromSchema = norm(actual);
  if (fromDocs !== fromSchema) {
    console.warn(
      `[tableMeta] ⚠️ ${what} 与 prisma/schema.prisma 覆盖的列不一致`
      + `（文档不影响 SQL，但该补了）：\n`
      + `  只在文档里：${docs.map((d) => d.column).filter((x) => !actual.includes(x)).join(',') || '（无）'}\n`
      + `  只在 schema：${actual.filter((x) => !docs.some((d) => d.column === x)).join(',') || '（无）'}`,
    );
  }
}
warnIfDrifted(SPECIAL_FIELDS, columnsOf(SPECIAL_TABLE).map((c) => c.column), 'SPECIAL_FIELDS');
warnIfDrifted(ECYILANG_FIELDS, ECYILANG_COLUMNS, 'ECYILANG_FIELDS');
