// scripts/import-questions.js - 把 V0-atctiku rawFiles 的执照题库题目+答案灌进 theory-db 表
//
// 数据来源：
//   qustionFiles/<部分>/<大类>.txt   题目（一个文件一个大类目录，题块以「第N题 试题编号：XXXX」分隔）
//   answerFiles/*.csv                答案（试题编号,答案），基础+专业 / 专业部分答案 重叠编号答案一致，直接合并
//
// 题型判定：
//   题块内有 A-D 选项行 → SINGLE_CHOICE（无多选，答案 CSV 全部单字母，已验证）
//   题块内无选项行 → TRUE_FALSE 判断题（答案为 T/F）
// content：题干 + 换行 + 选项行（保留 OCR 原文，不做清洗）；判断题仅题干
// answer：CSV 按试题编号查；选择题须为 A-D，判断题须为 T/F，否则记错误
//
// 错误输出：rawFiles/error/*.json（无答案、编号解析失败、编号冲突、答案孤儿等）
// 幂等：按 exam_no 去重，已入库的试题编号跳过，可重复执行
//
// 运行：node scripts/import-questions.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString =
  process.env.E_TRAIN_DATABASE_URL ||
  'postgresql://postgres:admin@127.0.0.1:5432/e_train';

const RAW_DIR = path.resolve(__dirname, '../../V0-atctiku/rawFiles');
const QUESTION_DIR = path.join(RAW_DIR, 'qustionFiles');
const ANSWER_DIR = path.join(RAW_DIR, 'answerFiles');
const ERROR_DIR = path.join(RAW_DIR, 'error');

// 题块起始行：第N题 + 任意分隔 + 编号（容忍全角冒号/分号/OCR 乱码冒号）
const HEAD_RE = /^第(\d+)题\s*试题编号/;
const EXAM_NO_RE = /(\d{6,})\s*$/; // 行内取末尾 6 位以上数字为试题编号
// 选项行：A. A、 A, A： A\t 均可（OCR 变体），题干行不会以「字母+分隔符」开头
const OPT_RE = /^[A-D][.、,，:：\t]/;
// 判断题选项行：单独的 T / F（可带尾随空白）
const TF_RE = /^[TF]\s*$/;

// ---- 读取答案 CSV → Map（编号 → 答案），重复编号答案不一致时记入冲突 ----
function loadAnswers() {
  const map = new Map();
  const conflicts = [];
  for (const f of fs.readdirSync(ANSWER_DIR).filter((f) => f.endsWith('.csv'))) {
    const lines = fs.readFileSync(path.join(ANSWER_DIR, f), 'utf8').split(/\r?\n/).filter((l) => l.trim());
    let n = 0;
    for (const line of lines) {
      const i = line.indexOf(',');
      if (i < 0) continue;
      const no = line.slice(0, i).trim();
      const ans = line.slice(i + 1).trim();
      if (!no) continue;
      n++;
      if (map.has(no) && map.get(no) !== ans) conflicts.push({ examNo: no, a: map.get(no), b: ans, files: [no] });
      else map.set(no, ans);
    }
    console.log(`  答案 ${f}: ${n} 行`);
  }
  return { map, conflicts };
}

// ---- 解析单个题目 txt → 题块数组（只切分与提取编号，题型判定在 buildQuestion）----
function parseQuestionFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const blocks = [];
  const parseErrors = [];

  let cur = null;
  const flush = () => {
    if (cur) {
      blocks.push(cur);
      cur = null;
    }
  };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (HEAD_RE.test(line)) {
      flush();
      const seq = line.match(/^第(\d+)题/)[1];
      const m = line.match(EXAM_NO_RE);
      cur = { seq, examNo: m ? m[1] : null, lines: [] };
      if (!m) parseErrors.push({ line: raw.trim(), reason: '试题编号解析失败' });
      continue;
    }
    if (cur) cur.lines.push(line);
  }
  flush();
  return { blocks, parseErrors };
}

// ---- 题块 + 答案 → 题目（题型判定 + content 拼接）；返回 { type, content, answer } 或 { error } ----
function buildQuestion(block, ans) {
  const lines = block.lines;
  const opts = lines.filter((l) => OPT_RE.test(l));

  // ① 有选项行
  if (opts.length > 0) {
    const optContents = opts.map((l) => l.replace(/^[A-D][.、,，:：\t]\s*/, ''));
    // OCR 把判断题的 T/F 行记成了全空的 A./B./C./D. → 还原为判断题
    if (optContents.every((c) => !c.trim()) && /^[TF]$/.test(ans)) {
      const stem = lines.filter((l) => !OPT_RE.test(l)).join('\n').trim();
      return { type: 'TRUE_FALSE', content: stem, answer: ans };
    }
    const firstOpt = lines.findIndex((l) => OPT_RE.test(l));
    const stem = lines.slice(0, firstOpt).join('\n').trim();
    return { type: 'SINGLE_CHOICE', content: (stem + '\n' + opts.join('\n')).trim(), answer: ans };
  }

  // ② 无选项行但块内有独立的 T/F 行 → 判断题
  if (lines.some((l) => TF_RE.test(l))) {
    const stem = lines.filter((l) => !TF_RE.test(l)).join('\n').trim();
    return { type: 'TRUE_FALSE', content: stem, answer: ans };
  }

  // ③ 无任何选项痕迹 + 答案为 A-D：选项前缀被 OCR 丢失，
  //    题干后恰好剩 4 个非空行时按行序补 A-D 前缀（英语题常见此格式）
  if (/^[A-D]$/.test(ans)) {
    const nonEmpty = lines.filter((l) => l.trim());
    if (nonEmpty.length >= 5) {
      const stem = nonEmpty.slice(0, nonEmpty.length - 4).join('\n').trim();
      const opts4 = nonEmpty.slice(-4);
      const content =
        stem + '\n' + opts4.map((l, i) => 'ABCD'[i] + '. ' + l.trim()).join('\n');
      return { type: 'SINGLE_CHOICE', content, answer: ans };
    }
    // 行数不足，选项确实丢了 → 报错误不入库
    return { error: '选项缺失（OCR 丢失选项且无法按 4 行规则恢复）' };
  }

  // ④ 无任何选项痕迹 + 答案为 T/F：判断题的 T/F 行被 OCR 丢失，按答案还原为判断题
  if (/^[TF]$/.test(ans)) {
    return { type: 'TRUE_FALSE', content: lines.filter((l) => l.trim()).join('\n').trim(), answer: ans };
  }

  return { error: `答案「${ans}」与题型不匹配` };
}

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('[1] 已连接', client.database);

  fs.mkdirSync(ERROR_DIR, { recursive: true });

  // ---- 答案 ----
  console.log('[2] 读取答案 CSV：');
  const { map: answers, conflicts: answerConflicts } = loadAnswers();
  console.log(`    合并后唯一编号 ${answers.size} 个，冲突 ${answerConflicts.length} 个`);

  // ---- 已入库编号（幂等跳过）----
  const { rows: existing } = await client.query(
    'SELECT exam_no FROM "theory-db" WHERE exam_no IS NOT NULL'
  );
  const existingNos = new Set(existing.map((r) => r.exam_no));
  console.log(`[3] theory-db 已有 ${existingNos.size} 个试题编号，重复将跳过`);

  // ---- 遍历题目文件 ----
  const noAnswer = []; // 找不到答案
  const badQuestion = []; // 题型与答案不符 / 选项缺失等无法入库的题
  const dupExamNo = []; // 编号在库中已存在（跳过）
  const orphanAnswers = []; // CSV 有答案但题目不存在
  const categoryMiss = []; // 文件找不到对应目录
  const insertedByFile = [];
  let inserted = 0;
  let skipped = 0;

  // 大类目录：LICENSE 叶子 → { id, name }
  const { rows: leaves } = await client.query(
    `SELECT c.id, c.name FROM "theory-category" c
     WHERE tree_type = 'LICENSE'
       AND NOT EXISTS (SELECT 1 FROM "theory-category" ch WHERE ch.parent_id = c.id)`
  );

  const partDirs = fs
    .readdirSync(QUESTION_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const partName of partDirs) {
    const txtFiles = fs
      .readdirSync(path.join(QUESTION_DIR, partName))
      .filter((f) => f.endsWith('.txt'));
    for (const fileName of txtFiles) {
      const baseName = fileName.replace(/\.txt$/, '');
      // 文件名 → 目录节点（导入目录树时「_」曾转成「、」，两种都尝试）
      let leaf = leaves.find((l) => l.name === baseName);
      if (!leaf && baseName.includes('_')) {
        leaf = leaves.find((l) => l.name === baseName.replace(/_/g, '、'));
      }
      if (!leaf) {
        categoryMiss.push({ file: `${partName}/${fileName}`, baseName });
        continue;
      }

      const { blocks, parseErrors } = parseQuestionFile(
        path.join(QUESTION_DIR, partName, fileName)
      );

      for (const b of blocks) {
        if (!b.examNo) continue; // 编号解析失败已在 parseErrors
        if (existingNos.has(b.examNo)) {
          dupExamNo.push({ file: `${partName}/${fileName}`, seq: b.seq, examNo: b.examNo });
          skipped++;
          continue;
        }
        const ans = answers.get(b.examNo);
        if (ans === undefined) {
          noAnswer.push({ file: `${partName}/${fileName}`, seq: b.seq, examNo: b.examNo, stem: (b.lines.find((l) => l.trim()) || '').slice(0, 60) });
          continue;
        }
        const q = buildQuestion(b, ans);
        if (q.error) {
          badQuestion.push({ file: `${partName}/${fileName}`, seq: b.seq, examNo: b.examNo, answer: ans, reason: q.error, stem: (b.lines.find((l) => l.trim()) || '').slice(0, 60) });
          continue;
        }
        await client.query(
          `INSERT INTO "theory-db" ("content", "type", "answer", "exam_no", "category_id")
           VALUES ($1, $2, $3, $4, $5)`,
          [q.content, q.type, q.answer, b.examNo, leaf.id]
        );
        existingNos.add(b.examNo);
        inserted++;
      }

      // 编号解析失败写错误
      for (const pe of parseErrors) {
        pe.file = `${partName}/${fileName}`;
      }
      insertedByFile.push({
        file: `${partName}/${fileName}`,
        category: leaf.name,
        total: blocks.length,
        parseErrors: parseErrors.length,
      });
    }
  }

  // ---- CSV 孤儿答案：答案有但题目没入库（阅读答案 42x 系列等） ----
  const questionNos = new Set();
  for (const partName of partDirs) {
    for (const fileName of fs.readdirSync(path.join(QUESTION_DIR, partName)).filter((f) => f.endsWith('.txt'))) {
      const { blocks } = parseQuestionFile(path.join(QUESTION_DIR, partName, fileName));
      blocks.forEach((b) => b.examNo && questionNos.add(b.examNo));
    }
  }
  for (const [no] of answers) {
    if (!questionNos.has(no)) orphanAnswers.push(no);
  }

  // ---- 错误输出到 rawFiles/error/ ----
  const report = (name, data) => {
    fs.writeFileSync(path.join(ERROR_DIR, name), JSON.stringify(data, null, 2), 'utf8');
  };
  const summary = {
    time: new Date().toISOString(),
    inserted,
    skippedExisting: skipped,
    answerMapSize: answers.size,
    byFile: insertedByFile,
    counts: {
      noAnswer: noAnswer.length,
      badQuestion: badQuestion.length,
      dupExamNo: dupExamNo.length,
      parseErrors: insertedByFile.reduce((s, f) => s + f.parseErrors, 0),
      categoryMiss: categoryMiss.length,
      orphanAnswers: orphanAnswers.length,
      answerConflicts: answerConflicts.length,
    },
  };
  report('summary.json', summary);
  report('无答案题目.json', noAnswer);
  report('无法入库题目.json', badQuestion);
  report('编号已存在跳过.json', dupExamNo);
  report('目录未匹配.json', categoryMiss);
  report('孤儿答案.json', orphanAnswers);
  report('答案冲突.json', answerConflicts);

  console.log(`[4] 入库完成：新增 ${inserted} 题，跳过已存在 ${skipped} 题`);
  console.log(`    无答案 ${noAnswer.length} | 无法入库 ${badQuestion.length} | 编号重复 ${dupExamNo.length} | 目录未匹配 ${categoryMiss.length}`);
  console.log(`    解析失败 ${summary.counts.parseErrors} | 孤儿答案 ${orphanAnswers.length} | 答案冲突 ${answerConflicts.length}`);
  console.log(`[5] 错误报告已写入 ${ERROR_DIR}`);

  // ---- 校验统计 ----
  const { rows: stat } = await client.query(
    `SELECT type, COUNT(*)::int AS n FROM "theory-db" GROUP BY type`
  );
  console.log('[6] theory-db 按题型：', stat.map((r) => `${r.type}=${r.n}`).join(', '));
  const { rows: byCat } = await client.query(
    `SELECT c.name, COUNT(*)::int AS n FROM "theory-db" d
     JOIN "theory-category" c ON c.id = d.category_id
     GROUP BY c.name ORDER BY c.name`
  );
  console.log('[7] 按大类：', byCat.map((r) => `${r.name}=${r.n}`).join(', '));

  await client.end();
}

main().catch((e) => {
  console.error('❌ 导入失败：', e.message);
  process.exit(1);
});
