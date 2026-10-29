/**
 * ============================================================
 * seed_flight_type —— 任务性质代码表（flight_type）种子数据
 * ------------------------------------------------------------
 * 数据来源：用户提供的《任务性质》纸质表格照片（2026-10-28），逐行录入。
 * 表里最后一行 SSS 的中文全称被截断，按可见部分录为「军运会」，如有出入改这里。
 *
 * ★ upsert 按 short_en 幂等：重跑只更新，不重复插入。
 * ★ 跑法：npx tsx db_seed/seed_flight_type.js
 * ============================================================
 */
import { createPrismaClient } from '../src/db/prisma.js';

/** [short_en 任务性质代码, short_cn 中文简称, full_cn 中文全称] —— 与照片逐行对应 */
const ROWS = [
  ['A/V', '熟练', '熟练'],
  ['B/F', '播种', '播种'],
  ['B/W', '专机', '专机'],
  ['C/B', '普加', '普客加班'],
  ['OMA', '军航', '军航'],
  ['F/J', '校验', '校验'],
  ['G/X', '磁测', '磁测'],
  ['H/F', '航摄', '航摄'],
  ['H/G', '货班', '货班机'],
  ['H/Y', '货包', '货包机'],
  ['J/B', '班专', '班机按专机'],
  ['K/L', '本场', '本场训练'],
  ['L/W', '包机', '旅客包机'],
  ['RTN', '返航', '返航'],
  ['N/M', '调机', '调机'],
  ['Q/F', '急救', '急救'],
  ['P/A', '灭火', '林业化学灭火'],
  ['Q/C', '农林', '农林化'],
  ['S/F', '试飞', '试飞'],
  ['S/Q', '视察', '视察'],
  ['U/B', '物探', '物理采矿'],
  ['U/H', '公务', '公务'],
  ['V/U', '降雨', '人工降雨'],
  ['W/A', '转场', '转场'],
  ['W/Z', '正班', '正班'],
  ['X/D', '护林', '护林'],
  ['X/L', '训练', '训练'],
  ['Y/A', '养调', '养调'],
  ['Z/P', '补班', '补班'],
  ['VIP', '要客', '要客'],
  ['ALN', '备降', '备降'],
  ['ZZZ', '未知', '未知'],
  ['VVP', '要客', '管调要客'],
  ['VVV', '要客', '重要会议'],
  ['R/Z', '首航', '首航'],
  ['O/P', '奥运', '奥运'],
  ['YYY', '大运', '大运'],
  ['D/M', '展示', '展示飞行'],
  ['SSS', '军运', '军运会'],
];

const prisma = createPrismaClient();

try {
  for (const [short_en, short_cn, full_cn] of ROWS) {
    await prisma.flight_type.upsert({
      where: { short_en },
      update: { short_cn, full_cn },
      create: { short_en, short_cn, full_cn },
    });
  }
  const total = await prisma.flight_type.count();
  console.log(`✓ flight_type 种子完成：写入 ${ROWS.length} 行，表里现有 ${total} 行`);
} finally {
  await prisma.$disconnect();
}
