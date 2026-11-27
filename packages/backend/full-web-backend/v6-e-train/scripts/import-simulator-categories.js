// scripts/import-simulator-categories.js - 模拟机培训目录树初始数据灌入 simulator-category 表
//
// 结构（模仿 theory-category，顶层手工、子级固定）：
//   一级：2025 年（sort 0）/ 2026 年（sort 1）
//   二级：1 月 - 12 月（sort 1-12）
//
// 幂等策略：按「名称 + 父节点」查重（IS NOT DISTINCT FROM 处理顶层 NULL），可重复执行
// 运行：node scripts/import-simulator-categories.js
const { Client } = require('pg');

const connectionString =
  process.env.E_TRAIN_DATABASE_URL ||
  'postgresql://postgres:admin@127.0.0.1:5432/e_train';

const YEARS = [
  { name: '2025 年', sortOrder: 0 },
  { name: '2026 年', sortOrder: 1 },
];
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ name: `${i + 1} 月`, sortOrder: i + 1 }));

// 按「名称 + 父节点」确保存在（IS NOT DISTINCT FROM 让 parent_id 为 NULL 时也能正确比较）
async function ensureCategory(client, name, parentId, sortOrder) {
  const { rows } = await client.query(
    'SELECT id FROM "simulator-category" WHERE name = $1 AND parent_id IS NOT DISTINCT FROM $2 LIMIT 1',
    [name, parentId]
  );
  if (rows.length) return { id: rows[0].id, created: false };
  const { rows: ins } = await client.query(
    'INSERT INTO "simulator-category" ("name", "parent_id", "sort_order", "tree_type") VALUES ($1, $2, $3, \'YEAR\') RETURNING id',
    [name, parentId, sortOrder]
  );
  return { id: ins[0].id, created: true };
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('[1] 已连接', client.database);

  let created = 0;
  for (const year of YEARS) {
    const y = await ensureCategory(client, year.name, null, year.sortOrder);
    if (y.created) created++;
    for (const m of MONTHS) {
      const r = await ensureCategory(client, m.name, y.id, m.sortOrder);
      if (r.created) created++;
    }
    console.log(`  ├─ ${year.name}（${y.created ? '新建' : '已存在'}，含 12 个月）`);
  }

  const { rows: cnt } = await client.query(
    `SELECT (SELECT COUNT(*)::int FROM "simulator-category" WHERE parent_id IS NULL) AS years,
            (SELECT COUNT(*)::int FROM "simulator-category") AS total`
  );
  console.log(`[2] 本次新建 ${created} 个节点，simulator-category 共 ${cnt[0].total} 个（年份 ${cnt[0].years} 个 × 12 个月）`);

  await client.end();
  console.log('✅ 模拟机目录树就绪');
}

main().catch((e) => {
  console.error('❌ 灌入失败：', e.message);
  process.exit(1);
});
