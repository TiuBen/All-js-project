/**
 * ============================================================
 * addNewEcyilangToDb.js —— 把**一份新的 ecyilang 抓包快照**灌进表
 * ------------------------------------------------------------
 * 用法：
 *   ① 在 V5-dispatch 目录下执行，把快照 JSON 的**绝对路径**当参数传进去
 *      （可传多个，按给定顺序依次导入）：
 *        pnpm exec tsx db_seed/addNewEcyilangToDb.js <a.json> [b.json ...]
 *      不传参数时，用本文件里 defaultFilePath 那份（就改那一行）。
 *      形状和 db_seed/ecyilang/*.json 一样：{ msg, code, data: [...], count }
 *
 * ★ 和 db_seed.js 的区别：db_seed.js 是「整目录重灌」——先把 ecyilang /
 *   airplane_company_name_code / airport_name_code 三张表清空，再把 db_seed/ 下
 *   所有快照灌一遍。本脚本只处理你指定的那**一个**文件，别的行一律不碰。
 *
 * ★ 传多份文件时按**参数顺序**依次导入：同一天先被前面的文件写进去、再被后面的
 *   文件删掉重写 —— 于是**越靠后越权威**（新快照覆盖旧快照），与「每日快照」的用法一致。
 *
 * ★ 覆盖口径（重复执行是安全的）：先把表里「这份文件覆盖到的那几天」的旧行删掉，
 *   再插入文件里的全部行 —— 每日快照的正常用法就是「新快照 = 那几天的权威数据」。
 *   覆盖到哪几天 = 文件里 d_flight_date / a_flight_date 出现过的日期（空值跳过）。
 *   所以：同一份文件跑两遍不会翻倍；也不会碰到文件没覆盖的其它日期。
 *
 * ★ 必须用 tsx 跑：Prisma 7 的 prisma-client 生成器只产 TypeScript，
 *   下面 import 的是 prisma/generated/client.ts，node 直接跑会 import 失败。
 *
 * ★ 为什么第一行要 import 'dotenv/config'：Prisma 7 的 **CLI** 会自动读 .env，
 *   但这里是用 tsx 直接跑 JS，没有 CLI 帮忙，不手动加载就拿不到 DATABASE_URL。
 * ============================================================
 */
import 'dotenv/config'
import fs from 'node:fs'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/generated/client.ts'
// 「原始行 → 插入对象」的换算（含日期/时间的时区口径）与 db_seed.js 共用同一份
import { airportMapOf, daysOfRows, newStats, toEcyilangRow } from './ecyilangRow.js'
// 「墙上日期 → Date」的口径也复用服务端的（src/utils/date.js 的 parseWallDay）
import { parseWallDay } from '../src/utils/date.js'

/** ★★★ 不传命令行参数时，默认导入这份（绝对路径）—— 就改这一行 ★★★ */
const defaultFilePath =
  'D:/GitHub/All-js-project/packages/backend/full-web-backend/V5-dispatch/db_seed/ecyilang/ecyilang202610061956.json'

/** 要导入的文件：命令行参数优先，没给就用默认那份；顺序 = 参数顺序 */
const filePaths = process.argv.slice(2)
if (filePaths.length === 0) filePaths.push(defaultFilePath)

/* ============================================================
 * 一、Prisma Client
 * ============================================================ */

/** DATABASE_URL 缺失时立刻报错，别让它抛一堆看不懂的连接错误 */
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ 读不到 DATABASE_URL —— 检查项目根目录的 .env')
  process.exit(1)
}

/**
 * ⚠️ options: '-c TimeZone=UTC' 不要删（与 db_seed.js 保持一致）。
 *    PG 会按**会话时区**把 date / timestamptz 渲染成本地文本再交给驱动，
 *    而 Prisma 的 pg driver adapter 不认那个时区偏移：不固定 UTC 时，
 *    date 列会整体退一天、timestamptz 会把本地墙上时间当成 UTC（差 8 小时）。
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    options: '-c TimeZone=UTC',
  }),
})

/* ============================================================
 * 二、读文件
 * ============================================================ */

/** 读快照 JSON，返回它的 data 数组 */
function readSnapshot(file) {
  if (!fs.existsSync(file)) throw new Error(`找不到文件：${file}（命令行参数 / defaultFilePath 都要填绝对路径）`)
  let json
  try {
    json = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    throw new Error(`读不了 ${file}：${err.message}`)
  }
  const rows = json.data || json.rows || []
  if (!Array.isArray(rows)) throw new Error(`${file} 里的 data 不是数组`)
  if (rows.length === 0) throw new Error(`${file} 里一行数据都没有`)
  return rows
}

/* ============================================================
 * 三、导入一份快照（读文件 → 删它覆盖那几天 → 插入）
 * ============================================================ */

/**
 * @param {string} file 快照 JSON 绝对路径
 * @param {Map<string, object>} airportMap 机场码表（中文名 → iata/icao），所有文件共用
 * @returns {Promise<{days: string[], removed: number, created: number}>} 覆盖了哪几天 / 删了几行 / 插了几行
 */
async function importOne(file, airportMap) {
  console.log(`\n▶ 读取快照 ${file}`)
  const rawRows = readSnapshot(file)

  // 这份文件覆盖了哪几天 —— 覆盖范围就是「要替换的天数」
  const days = daysOfRows(rawRows)
  if (days.length === 0) {
    throw new Error(`${file} 里 d_flight_date / a_flight_date 全是空的，定位不到要覆盖哪几天，已中止（避免误删）`)
  }
  console.log(`  ${rawRows.length} 行，覆盖日期：${days.join('、')}`)

  const stats = newStats()
  const rows = rawRows.map((raw) => toEcyilangRow(raw, airportMap, stats))
  const missedNames = new Set()
  for (const raw of rawRows) {
    for (const name of [raw.d_name, raw.a_name]) {
      const key = String(name ?? '').trim()
      if (key && !airportMap.has(key)) missedNames.add(key)
    }
  }

  /* ---------- 覆盖：先删「这几天的旧行」，再插入 ---------- */
  const bounds = days.map(parseWallDay)
  const removed = await prisma.ecyilang.deleteMany({
    where: { OR: [{ d_flight_date: { in: bounds } }, { a_flight_date: { in: bounds } }] },
  })
  const created = await prisma.ecyilang.createMany({ data: rows })
  console.log(`  删除旧行 ${removed.count} 行（表里落在这几天的）→ 插入新行 ${created.count} 行`)

  /* ---------- 异常提示（都是「留 NULL」级别，不影响这次导入） ---------- */
  const shiftedTotal = Object.values(stats.shifted).reduce((a, b) => a + b, 0)
  if (shiftedTotal > 0) {
    const detail = Object.entries(stats.shifted).filter(([, n]) => n > 0).map(([k, n]) => `${k} ${n} 条`).join(' / ')
    console.log(`  🔁 跨天后缀已按 ±1 天落到完整时间上，共 ${shiftedTotal} 条（${detail}）`)
  }
  if (stats.fallback > 0) console.log(`  ⚠️ 有 ${stats.fallback} 处本侧日期为空，已退回用对侧日期做基准`)
  if (stats.orphan.length > 0) {
    console.log(`  ⚠️ 有 ${stats.orphan.length} 个时间值两侧日期都为空，只能留 NULL：${stats.orphan.join('、')}`)
  }
  if (stats.unparsable.length > 0) {
    console.log(`  ⚠️ 有 ${stats.unparsable.length} 个时间原始值解析不了，已留 NULL：${[...new Set(stats.unparsable)].slice(0, 10).join('、')}`)
  }
  if (missedNames.size > 0) {
    console.log(`  ⚠️ 有 ${missedNames.size} 个机场名在 airport_name_code 里没匹配上（对应的码列留 NULL）：`)
    console.log('     ' + [...missedNames].sort().join('、'))
  }

  return { days, removed: removed.count, created: created.count }
}

/* ============================================================
 * 四、主流程：按参数顺序，一份一份跑
 * ============================================================ */

async function main() {
  console.log(`▶ ${filePaths.length} 份快照，按给定顺序导入`)

  // 机场码表从**库里**读**一次**（不再依赖 db_seed/setting/*.json 那个文件），所有文件共用
  const airports = await prisma.airport_name_code.findMany({
    select: { chinese_airport_name: true, airport_iata_code: true, airport_icao_code: true },
  })
  const airportMap = airportMapOf(airports)
  console.log(`  机场码表 ${airports.length} 行（用于回填 4 个 IATA / ICAO 列）`)

  const done = []
  for (const file of filePaths) done.push(await importOne(file, airportMap))

  /* ---------- 复核：覆盖到的这几天现在表里有多少行 ---------- */
  const days = [...new Set(done.flatMap((d) => d.days))]
  const bounds = days.map(parseWallDay)
  const after = await prisma.ecyilang.groupBy({
    by: ['d_flight_date'],
    where: { OR: [{ d_flight_date: { in: bounds } }, { a_flight_date: { in: bounds } }] },
    _count: { _all: true },
  })
  const nowInDays = after.reduce((n, g) => n + g._count._all, 0)
  const total = await prisma.ecyilang.count()

  console.log('\n✅ 全部完成')
  for (const d of done) console.log(`   ${d.days.join('、')}：删 ${d.removed} 行 / 插 ${d.created} 行`)
  console.log(`   核对  覆盖到的这几天共 ${nowInDays} 行，表内共 ${total} 行`)
  console.log(`\n👉 现在可以请求 ?source=ecyilang&date=${days[0]} 看数据了`)
}

main()
  .catch((err) => {
    console.error('\n❌ 导入失败：', err.message)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
