// scripts/clean-custom-categories.js - 清理 simulator-category 里全部 CUSTOM 测试节点（骨架 YEAR 不动）
// 用途：端到端测试后的兜底清理；按需手跑 node scripts/clean-custom-categories.js
const { Client } = require('pg');

const connectionString =
  process.env.E_TRAIN_DATABASE_URL ||
  'postgresql://postgres:admin@127.0.0.1:5432/e_train';

async function main() {
  const c = new Client({ connectionString });
  await c.connect();
  // 递归收集整棵树，只删 CUSTOM（先删子后删父，避开自引用外键）
  const { rows } = await c.query('SELECT id, parent_id, tree_type, name FROM "simulator-category"');
  const byParent = {};
  rows.forEach((r) => {
    (byParent[r.parent_id || 'ROOT'] = byParent[r.parent_id || 'ROOT'] || []).push(r);
  });
  let deleted = 0;
  async function delChildren(pid) {
    for (const child of byParent[pid] || []) {
      await delChildren(child.id);
      if (child.tree_type === 'CUSTOM') {
        await c.query('DELETE FROM "simulator-category" WHERE id = $1', [child.id]);
        deleted++;
      }
    }
  }
  for (const root of byParent['ROOT'] || []) await delChildren(root.id);
  const { rows: stat } = await c.query(
    'SELECT tree_type, COUNT(*)::int AS n FROM "simulator-category" GROUP BY tree_type'
  );
  console.log('已删除 CUSTOM 节点:', deleted, '| 剩余分布:', stat.map((x) => x.tree_type + '=' + x.n).join(', '));
  await c.end();
}

main().catch((e) => {
  console.error('清理失败:', e.message);
  process.exit(1);
});
