// scripts/add-tree-type.js - 存量库升级：theory-category 增加 tree_type（执照题库只读 / 地方题库可编辑）
//
// 对应 prisma/schema.prisma 的 CategoryTreeType 枚举，按 howto.md 方案：
//   1. 创建枚举 CategoryTreeType（LICENSE / LOCAL）
//   2. theory-category 增加 tree_type 列（默认 LOCAL）
//   3. 回填：按顶层根节点回填整棵子树 —— 执照题库 → LICENSE，地方题库 → LOCAL
//      （不能依赖默认值，否则存量执照题库子节点会被错误标成 LOCAL）
//   4. 固定顶层顺序：执照题库 sort_order=0（最上面），地方题库 sort_order=1
//   5. theory-db.category_id 外键改为 ON DELETE RESTRICT（数据库层兜底防误删被引用目录）
//   6. 补齐 @@index([parentId, sortOrder]) / @@index([treeType])
//
// 幂等，可重复执行。运行：node scripts/add-tree-type.js
const { Client } = require('pg');

const connectionString =
  process.env.E_TRAIN_DATABASE_URL ||
  'postgresql://postgres:admin@127.0.0.1:5432/e_train';

// 顶层根节点 → 所属题库类型（后续新增根按需扩展）
const ROOT_TYPES = {
  执照题库: 'LICENSE',
  地方题库: 'LOCAL',
};
// 顶层固定顺序：执照题库永远在最上面
const ROOT_ORDER = { 执照题库: 0, 地方题库: 1 };

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('[1] 已连接', client.database);

  // ---- 1. 枚举 ----
  await client.query(`
    DO $$ BEGIN
      CREATE TYPE "CategoryTreeType" AS ENUM ('LICENSE', 'LOCAL');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);
  console.log('[2] 枚举 CategoryTreeType 就绪');

  // ---- 2. tree_type 列 ----
  await client.query(`
    DO $$ BEGIN
      ALTER TABLE "theory-category"
        ADD COLUMN "tree_type" "CategoryTreeType" NOT NULL DEFAULT 'LOCAL';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$;
  `);
  console.log('[3] theory-category.tree_type 列就绪（默认 LOCAL）');

  // ---- 3. 按顶层根回填整棵子树 ----
  const { rows: roots } = await client.query(
    'SELECT id, name FROM "theory-category" WHERE parent_id IS NULL'
  );
  const { rows: all } = await client.query('SELECT id, parent_id FROM "theory-category"');
  const childrenOf = {};
  for (const r of all) {
    if (r.parent_id) (childrenOf[r.parent_id] ||= []).push(r.id);
  }
  let licenseCount = 0;
  let localCount = 0;
  for (const root of roots) {
    const treeType = ROOT_TYPES[root.name];
    if (!treeType) {
      console.log(`  ⚠ 未知顶层节点「${root.name}」，按 LOCAL 处理`);
    }
    const type = treeType || 'LOCAL';
    // BFS 收集根下全部后代（含根自身）
    const ids = [root.id];
    for (let i = 0; i < ids.length; i++) {
      for (const childId of childrenOf[ids[i]] || []) ids.push(childId);
    }
    await client.query(
      'UPDATE "theory-category" SET "tree_type" = $1 WHERE id = ANY($2::uuid[])',
      [type, ids]
    );
    if (type === 'LICENSE') licenseCount += ids.length;
    else localCount += ids.length;
  }
  console.log(`[4] tree_type 回填完成：LICENSE ${licenseCount} 个，LOCAL ${localCount} 个`);

  // ---- 4. 顶层固定顺序：执照题库 0 / 地方题库 1 ----
  for (const root of roots) {
    const order = ROOT_ORDER[root.name];
    if (order !== undefined) {
      await client.query(
        'UPDATE "theory-category" SET "sort_order" = $1 WHERE id = $2',
        [order, root.id]
      );
    }
  }
  console.log('[5] 顶层顺序固定：执照题库(0) → 地方题库(1)');

  // ---- 5. theory-db.category_id 外键改为 ON DELETE RESTRICT ----
  const { rows: fks } = await client.query(`
    SELECT conname, confdeltype FROM pg_constraint
    WHERE conrelid = '"theory-db"'::regclass AND contype = 'f'
      AND conkey @> ARRAY[(SELECT attnum::smallint FROM pg_attribute
                           WHERE attrelid = '"theory-db"'::regclass AND attname = 'category_id')]
  `);
  for (const fk of fks) {
    if (fk.confdeltype !== 'r') {
      // 'r' = RESTRICT；现有约束是 NO ACTION('a')，重建为 RESTRICT
      await client.query(`ALTER TABLE "theory-db" DROP CONSTRAINT "${fk.conname}"`);
      await client.query(`
        ALTER TABLE "theory-db"
        ADD CONSTRAINT "${fk.conname}" FOREIGN KEY ("category_id")
        REFERENCES "theory-category"("id") ON DELETE RESTRICT
      `);
      console.log(`[6] 外键 ${fk.conname} 已改为 ON DELETE RESTRICT`);
    } else {
      console.log(`[6] 外键 ${fk.conname} 已是 ON DELETE RESTRICT，跳过`);
    }
  }

  // ---- 6. 索引（对齐 prisma @@index） ----
  await client.query(`
    CREATE INDEX IF NOT EXISTS "theory-category_parent_id_sort_order_idx"
      ON "theory-category"("parent_id", "sort_order");
    CREATE INDEX IF NOT EXISTS "theory-category_tree_type_idx"
      ON "theory-category"("tree_type");
  `);
  console.log('[7] 索引就绪（parent_id+sort_order / tree_type）');

  // ---- 校验输出 ----
  const { rows: check } = await client.query(`
    SELECT name, tree_type, sort_order, parent_id IS NULL AS is_root
    FROM "theory-category"
    WHERE parent_id IS NULL OR parent_id IN (SELECT id FROM "theory-category" WHERE parent_id IS NULL)
    ORDER BY sort_order, name
  `);
  console.log('\n顶层与第二层校验：');
  for (const r of check) {
    console.log(
      `  ${r.is_root ? '◆' : ' ├─'} ${r.name} [${r.tree_type}] sort=${r.sort_order}`
    );
  }

  await client.end();
  console.log('\n✅ 升级完成');
}

main().catch((e) => {
  console.error('❌ 升级失败：', e.message);
  process.exit(1);
});
