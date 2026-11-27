// scripts/import-categories.js - 把 V0-atctiku rawFiles 的目录结构灌进 theory-category 表
//
// 目录映射：
//   顶层（手工，磁盘上没有这两个文件夹名）：执照题库 / 地方题库
//   执照题库第二层 = qustionFiles 下的子文件夹（第一部分 基础知识 / 第二部分 专业基础知识 / 第三部分 英语知识）
//   第三层 = 各部分下的 .txt 文件名（去掉扩展名）= 大类（题目将来挂这里）
//
// 幂等策略：按「名称 + 父节点」查重，已存在跳过、新文件追加，可重复执行
// 运行：node scripts/import-categories.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString =
  process.env.E_TRAIN_DATABASE_URL ||
  'postgresql://postgres:admin@127.0.0.1:5432/e_train';

// 题目文件夹（V0-atctiku 的原始资料）
const QUESTION_DIR = path.resolve(__dirname, '../../V0-atctiku/rawFiles/qustionFiles');

// 中文数字 → 序号（解析「第一部分/第二部分…」的 sort_order）
const CN_NUM = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
function parseSortOrder(name) {
  const m = name.match(/第(.)部分/);
  return m && CN_NUM[m[1]] ? CN_NUM[m[1]] : 0;
}

// 按「名称 + 父节点」确保存在（IS NOT DISTINCT FROM 让 parent_id 为 NULL 时也能正确比较）
// treeType 由父节点继承（执照题库子树 = LICENSE，地方题库 = LOCAL），不由磁盘结构推断
async function ensureCategory(client, name, parentId, sortOrder, treeType = 'LOCAL') {
  const { rows } = await client.query(
    'SELECT id FROM "theory-category" WHERE name = $1 AND parent_id IS NOT DISTINCT FROM $2 LIMIT 1',
    [name, parentId]
  );
  if (rows.length) return { id: rows[0].id, created: false };
  const { rows: ins } = await client.query(
    'INSERT INTO "theory-category" ("name", "parent_id", "sort_order", "tree_type") VALUES ($1, $2, $3, $4) RETURNING id',
    [name, parentId, sortOrder, treeType]
  );
  return { id: ins[0].id, created: true };
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('[1] 已连接', client.database);

  if (!fs.existsSync(QUESTION_DIR)) {
    throw new Error(`题目目录不存在：${QUESTION_DIR}`);
  }

  // ---- 顶层：执照题库（LICENSE，固定最上）/ 地方题库（LOCAL） ----
  const license = await ensureCategory(client, '执照题库', null, 0, 'LICENSE');
  await ensureCategory(client, '地方题库', null, 1, 'LOCAL');
  console.log(`[2] 顶层就绪：执照题库${license.created ? '（新建）' : ''}、地方题库`);

  // ---- 第二层：三大部分（qustionFiles 子文件夹） ----
  const partDirs = fs
    .readdirSync(QUESTION_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let totalCategories = 0;
  for (const partName of partDirs) {
    const part = await ensureCategory(client, partName, license.id, parseSortOrder(partName), 'LICENSE');
    if (part.created) totalCategories++;
    console.log(`  ├─ ${partName}${part.created ? '（新建）' : ''}`);

    // ---- 第三层：大类（txt 文件名去扩展名），按名称排序编号 ----
    const txtFiles = fs
      .readdirSync(path.join(QUESTION_DIR, partName))
      .filter((f) => f.endsWith('.txt'))
      .sort((a, b) => a.localeCompare(b, 'zh'));
    for (let i = 0; i < txtFiles.length; i++) {
      const catName = txtFiles[i].replace(/\.txt$/, '');
      const cat = await ensureCategory(client, catName, part.id, i + 1, 'LICENSE');
      if (cat.created) totalCategories++;
    }
    console.log(`  │    └─ 大类 ${txtFiles.length} 个`);
  }
  console.log(`[3] 目录同步完成，本次新建 ${totalCategories} 个节点`);

  // ---- 校验：输出整棵树 ----
  const { rows: all } = await client.query('SELECT id, name, parent_id FROM "theory-category"');
  const printTree = (parentId, indent) => {
    const children = all
      .filter((r) => r.parent_id === parentId)
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'));
    for (const c of children) {
      console.log(`${indent}├─ ${c.name}`);
      printTree(c.id, indent + '│   ');
    }
  };
  all
    .filter((r) => !r.parent_id)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
    .forEach((t) => {
      console.log(`  ${t.name}`);
      printTree(t.id, '    ');
    });

  const { rows: cnt } = await client.query('SELECT COUNT(*)::int AS n FROM "theory-category"');
  console.log(`[5] theory-category 共 ${cnt[0].n} 个节点`);
  await client.end();
}

main().catch((e) => {
  console.error('❌ 导入失败：', e.message);
  process.exit(1);
});
