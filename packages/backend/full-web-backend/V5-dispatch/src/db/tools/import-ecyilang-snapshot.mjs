/**
 * ============================================================
 * import-ecyilang-snapshot —— 把 ecyilang 抓包快照 JSON 导入 pg 的 ecyilang 表
 * ------------------------------------------------------------
 * 快照文件形状（接口响应原样落盘）：{ msg, code, count, data: [ ... ] }
 * 列名与 ECYILANG_COLUMNS（db/ecyilangSchema.js，**唯一事实来源**）一一对应：
 *   多出来的键 → 忽略并告警；缺的键 → 按 NULL 入库。
 *
 * 用法（在 V5-dispatch 目录下执行，路径可写多个）：
 *   node src/db/tools/import-ecyilang-snapshot.mjs src/db/ecyilang20260930.json
 *   node src/db/tools/import-ecyilang-snapshot.mjs src/db/ecyilang20260930.json src/db/ecyilang20261001.json
 *   ... --replace   该批次日期库里已有行时，先删后插（默认是**整份跳过**）
 *   ... --dry       只校验 + 统计，不写库
 *
 * 幂等：批次日期 = COALESCE(LEFT(d_flight_date,10), LEFT(a_flight_date,10))；
 *   库里已有该日期 → 默认跳过，避免重复导入把 /fips 列表灌成两份。
 *
 * ⚠️ 值一律原样入库（**不把 '' 转成 NULL**）：state_name 的空串表示「已取消」，
 *    与 NULL（该侧本来没有航班）语义不同。
 * ============================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import { getPool } from '../pool.js';
import { ECYILANG_COLUMNS, TABLE } from '../ecyilangSchema.js';

/** 批次日期表达式（与 services/ecyilangService.js 的 SQL_BATCH_DATE 同口径） */
const SQL_BATCH_DATE = `COALESCE(LEFT(${TABLE}.d_flight_date, 10), LEFT(${TABLE}.a_flight_date, 10))`;

/** 单条 INSERT 的占位符上限是 65535；23 列 × 200 行 = 4600 个，留足余量 */
const CHUNK = 200;

/** 取 YYYY-MM-DD 前缀 */
function datePartOf(v) {
  const m = String(v ?? '').match(/\d{4}-\d{2}-\d{2}/);
  return m ? m[0] : null;
}

/** 该行的批次日期：优先离港侧，缺则取进港侧 */
function batchDateOf(row) {
  return datePartOf(row?.d_flight_date) || datePartOf(row?.a_flight_date);
}

/**
 * 读快照文件 + 校验列名
 * @param {string} file
 * @returns {{list: Array, count: number|null, unknownKeys: string[], missingKeys: string[]}}
 */
function readSnapshot(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const list = Array.isArray(raw?.data) ? raw.data : [];
  const keys = new Set();
  list.forEach((r) => Object.keys(r || {}).forEach((k) => keys.add(k)));
  return {
    list,
    count: typeof raw?.count === 'number' ? raw.count : null,
    unknownKeys: [...keys].filter((k) => !ECYILANG_COLUMNS.includes(k)).sort(),
    missingKeys: ECYILANG_COLUMNS.filter((k) => !keys.has(k)),
  };
}

/** 分批多值 INSERT；返回插入条数 */
async function insertRows(pool, rows) {
  let n = 0;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const params = [];
    const tuples = chunk.map((row) => {
      const ph = ECYILANG_COLUMNS.map((c) => {
        const v = row[c];
        params.push(v === undefined ? null : v);
        return `$${params.length}`;
      });
      return `(${ph.join(', ')})`;
    });
    await pool.query(
      `INSERT INTO ${TABLE} (${ECYILANG_COLUMNS.join(', ')}) VALUES ${tuples.join(', ')}`,
      params,
    );
    n += chunk.length;
  }
  return n;
}

/**
 * 读回某批次日期的全部行，与内存里的 JSON 逐字段比对（刚插入、无历史行时才可靠）
 * @returns {{ok: boolean, checked: number, diffs: string[]}}
 */
async function selfCheck(pool, rows, dates) {
  const { rows: dbRows } = await pool.query(
    `SELECT * FROM ${TABLE} WHERE ${SQL_BATCH_DATE} = ANY($1::text[]) ORDER BY id`,
    [dates],
  );
  const diffs = [];
  if (dbRows.length !== rows.length) {
    diffs.push(`行数不一致：库里 ${dbRows.length} 行，JSON ${rows.length} 行`);
  }
  rows.forEach((json, i) => {
    const db = dbRows[i];
    if (!db) return;
    for (const col of ECYILANG_COLUMNS) {
      const a = json[col] === undefined ? null : json[col];
      const b = db[col];
      // 全部列都是 VARCHAR，取回来就是字符串，null 与 '' 天然区分得开
      if (a !== b) diffs.push(`第 ${i + 1} 行 ${col}: DB=${JSON.stringify(b)} ≠ JSON=${JSON.stringify(a)}`);
    }
  });
  return { ok: diffs.length === 0, checked: dbRows.length, diffs };
}

/** 导入单个文件 */
async function importFile(pool, file, { replace, dry }) {
  const name = path.basename(file);
  const { list, count, unknownKeys, missingKeys } = readSnapshot(file);
  const dates = [...new Set(list.map(batchDateOf))].sort();

  console.log(`\n=== ${name} ===`);
  console.log(`  文件 count 字段：${count ?? '(无)'}，data[] 实际：${list.length} 条`);
  console.log(`  批次日期：${dates.join(', ') || '(推导不出)'}`);
  if (unknownKeys.length) console.log(`  ⚠️ 列名不在字段字典内（已忽略）：${unknownKeys.join(', ')}`);
  if (missingKeys.length) console.log(`  ⚠️ JSON 缺列（按 NULL 入库）：${missingKeys.join(', ')}`);

  if (list.length === 0) {
    console.log('  → data[] 为空，跳过');
    return { inserted: 0, skipped: true };
  }

  const { rows: existRows } = await pool.query(
    `SELECT ${SQL_BATCH_DATE} AS d, COUNT(*)::int AS n FROM ${TABLE}
      WHERE ${SQL_BATCH_DATE} = ANY($1::text[]) GROUP BY 1 ORDER BY 1`,
    [dates],
  );
  const exist = new Map(existRows.map((r) => [r.d, r.n]));
  if (exist.size) {
    console.log(`  库里已有：${[...exist].map(([d, n]) => `${d}(${n} 行)`).join('、')}`);
  }

  if (exist.size && !replace) {
    console.log('  → 该批次日期已有数据，默认跳过（要覆盖请加 --replace）');
    return { inserted: 0, skipped: true };
  }

  if (dry) {
    console.log(`  → --dry：只校验，实际会写入 ${list.length} 行`);
    return { inserted: 0, skipped: false, dry: true };
  }

  if (exist.size && replace) {
    const { rowCount } = await pool.query(
      `DELETE FROM ${TABLE} WHERE ${SQL_BATCH_DATE} = ANY($1::text[])`,
      [dates],
    );
    console.log(`  --replace：先删除旧数据 ${rowCount} 行`);
  }

  const inserted = await insertRows(pool, list);
  console.log(`  已写入 ${inserted} 行`);

  // 刚插入且此前无同日期数据 → 按 id 顺序读回比对
  const check = await selfCheck(pool, list, dates);
  console.log(
    check.ok
      ? `  ✅ 自检通过：读回 ${check.checked} 行，与 JSON 逐字段一致`
      : `  ❌ 自检发现 ${check.diffs.length} 处差异：\n     ${check.diffs.slice(0, 10).join('\n     ')}`,
  );
  return { inserted, skipped: false, ok: check.ok };
}

async function main() {
  const args = process.argv.slice(2);
  const replace = args.includes('--replace');
  const dry = args.includes('--dry');
  const files = args.filter((a) => !a.startsWith('--'));

  if (files.length === 0) {
    console.error(
      '用法：node src/db/tools/import-ecyilang-snapshot.mjs <ecyilangYYYYMMDD.json> [...更多文件] [--replace] [--dry]',
    );
    process.exit(1);
  }
  for (const f of files) {
    if (!fs.existsSync(f)) {
      console.error(`文件不存在：${f}`);
      process.exit(1);
    }
  }

  const pool = getPool();
  try {
    let total = 0;
    let allOk = true;
    for (const f of files) {
      const r = await importFile(pool, f, { replace, dry });
      total += r.inserted;
      if (r.ok === false) allOk = false;
    }
    const { rows } = await pool.query(
      `SELECT ${SQL_BATCH_DATE} AS d, COUNT(*)::int AS n FROM ${TABLE} GROUP BY 1 ORDER BY 1`,
    );
    console.log(`\n合计写入 ${total} 行。表 ${TABLE} 现状：`);
    rows.forEach((r) => console.log(`  ${r.d ?? '(无日期)'}  ${r.n} 行`));
    if (!allOk) process.exitCode = 2;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('导入失败：', err);
  process.exit(1);
});
