/**
 * ============================================================
 * db_seed.js —— 把 db_seed/ 目录里的原始抓包数据灌进数据库
 * ------------------------------------------------------------
 * 用法：pnpm db:seed        （= tsx db_seed/db_seed.js）
 *
 * 数据来源 → 目标表：
 *   db_seed/ecyilang/*.json                        → ecyilang
 *   db_seed/setting/airplaneCompanyNameCode.json   → airplane_company_name_code
 *   db_seed/setting/airportNameCode.json           → airport_name_code
 *
 * ★ 只动上面这 3 张表：开跑前先清空再灌，所以**重复执行是安全的**（不会翻倍）。
 *   fips / manual_fips / records_checklist / records_special **一律不碰**。
 *
 * ★ 为什么必须用 tsx 跑：Prisma 7 的 prisma-client 生成器只产 TypeScript，
 *   下面 import 的是 prisma/generated/client.ts，node 直接跑会 import 失败。
 *
 * ★ 只想补灌**某一份**新快照、不动其它行 → 用 addNewEcyilangToDb.js（本脚本会整目录重灌）。
 *   两者共用的「原始行 → 插入对象」换算在 ecyilangRow.js。
 *
 * ★ 为什么第一行要 import 'dotenv/config'：Prisma 7 的 **CLI** 会自动读 .env，
 *   但这里是用 tsx 直接跑 JS，没有 CLI 帮忙，不手动加载就拿不到 DATABASE_URL。
 * ============================================================
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../prisma/generated/client.ts'
// 原始行 → 插入对象的换算（含日期/时间时区口径）在 ecyilangRow.js，
// 和 addNewEcyilangToDb.js 共用同一份，别在这里再抄一遍。
import { airportMapOf, newStats, toEcyilangRow } from './ecyilangRow.js'

const SEED_DIR = path.dirname(fileURLToPath(import.meta.url))
const ECYILANG_DIR = path.join(SEED_DIR, 'ecyilang')
const SETTING_DIR = path.join(SEED_DIR, 'setting')

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
 * ⚠️ options: '-c TimeZone=UTC' 不要删。
 *    PG 会按**会话时区**把 date / timestamptz 渲染成本地文本再交给驱动，
 *    而 Prisma 的 pg driver adapter 不认那个时区偏移：不固定 UTC 时，
 *    date 列会整体退一天、timestamptz 会把本地墙上时间当成 UTC（差 8 小时）。
 *    （timestamp without time zone 列本身不受会话时区影响，见下）
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    options: '-c TimeZone=UTC',
  }),
})

/* ============================================================
 * 二、报告用的格式化
 * ============================================================ */

const pad = (n) => String(n).padStart(2, '0')

/** Date → 'YYYY-MM-DD HH:mm:ss'（一律按 UTC 取值，因为库里存的就是"墙上时间"） */
function fmt(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return 'null'
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} `
    + `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

/* ============================================================
 * 三、读原始文件
 * ============================================================ */

/** 读一个 JSON 文件，失败时给出相对路径 */
function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    throw new Error(`读不了 ${path.relative(SEED_DIR, file)}：${err.message}`)
  }
}

/**
 * 读 db_seed/ecyilang/ 下的全部快照（文件名排序 = 日期先后）
 * 每份快照形状：{ msg, code, data: [...], count }
 * @returns {Array<{file: string, rows: Object[]}>}
 */
function loadEcyilangSnapshots() {
  if (!fs.existsSync(ECYILANG_DIR)) throw new Error(`找不到目录 ${ECYILANG_DIR}`)
  const files = fs.readdirSync(ECYILANG_DIR).filter((f) => f.endsWith('.json')).sort()
  if (files.length === 0) throw new Error(`${ECYILANG_DIR} 里没有 .json 文件`)
  return files.map((f) => {
    const json = readJson(path.join(ECYILANG_DIR, f))
    const rows = json.data || json.rows || []
    if (!Array.isArray(rows)) throw new Error(`${f} 里的 data 不是数组`)
    return { file: f, rows }
  })
}

/* ============================================================
 * 四、主流程
 * ============================================================ */

async function main() {
  console.log('▶ 读取 db_seed 原始数据…')

  const snapshots = loadEcyilangSnapshots()
  const airlines = readJson(path.join(SETTING_DIR, 'airplaneCompanyNameCode.json')).rows || []
  const airports = readJson(path.join(SETTING_DIR, 'airportNameCode.json')).rows || []

  console.log(`  ecyilang 快照 ${snapshots.length} 份：`)
  for (const s of snapshots) console.log(`    ${s.file.padEnd(30)} ${String(s.rows.length).padStart(4)} 行`)
  console.log(`  航司码表 ${airlines.length} 行 / 机场码表 ${airports.length} 行`)

  // 机场中文名 → 码（回填 ecyilang 的四个 *_(iata|icao)_code 用）
  const airportMap = airportMapOf(airports)

  // 拼 ecyilang 插入数据，同时记录没匹配上的机场名
  const stats = newStats()
  const ecyilangRows = []
  const samples = [] // 供末尾肉眼核对：挑第一条 + 两条带跨天偏移的
  const missedNames = new Set()
  for (const s of snapshots) {
    for (const raw of s.rows) {
      ecyilangRows.push(toEcyilangRow(raw, airportMap, stats))
      for (const name of [raw.d_name, raw.a_name]) {
        const key = String(name ?? '').trim()
        if (key && !airportMap.has(key)) missedNames.add(key)
      }
      if (samples.length === 0) samples.push(raw)
      else if (samples.length <= 3 && (raw.d_plan_time?.includes('(+1)') || raw.a_plan_time?.includes('(-1)'))) samples.push(raw)
    }
  }

  console.log('\n▶ 写入数据库（先清空这 3 张目标表）…')

  // ① 清空：只针对本次要灌的 3 张表
  await prisma.ecyilang.deleteMany({})
  await prisma.airplane_company_name_code.deleteMany({})
  await prisma.airport_name_code.deleteMany({})

  // ② 灌入
  const createdEcyilang = await prisma.ecyilang.createMany({ data: ecyilangRows })
  const createdAirlines = await prisma.airplane_company_name_code.createMany({ data: airlines })
  const createdAirports = await prisma.airport_name_code.createMany({ data: airports })

  console.log('\n✅ 灌装完成')
  console.log(`   ecyilang                    ${createdEcyilang.count} 行`)
  console.log(`   airplane_company_name_code  ${createdAirlines.count} 行`)
  console.log(`   airport_name_code           ${createdAirports.count} 行`)

  /* ---------- 日期 + 时间 的换算样例（原始值 → 期望落库值 → 库里实际值） ---------- */
  console.log('\n📋 日期/时间换算样例（北京时间墙上时间，库里是 timestamp 无时区）：')
  let n = 0
  for (const raw of samples) {
    // 期望值：本地现算一遍（不依赖插入结果）
    const built = toEcyilangRow(raw, airportMap, newStats())
    // 库里实际值：按（离港/进港航班号）捞回来核对
    const hit = await prisma.ecyilang.findFirst({
      where: {
        d_flight_no_full: raw.d_flight_no_full ?? null,
        a_flight_no_full: raw.a_flight_no_full ?? null,
      },
      orderBy: { id: 'asc' },
    })
    const srcD = `d ${String(raw.d_flight_date ?? '--').slice(0, 10)} ${raw.d_plan_time ?? 'null'} / ${raw.d_time ?? 'null'}`
    const srcA = `a ${String(raw.a_flight_date ?? '--').slice(0, 10)} ${raw.a_plan_time ?? 'null'} / ${raw.a_time ?? 'null'}`
    n += 1
    console.log(`\n   [${n}] 原始   ${srcD}    ${srcA}`)
    console.log(`       期望   d ${fmt(built.d_plan_time)} / ${fmt(built.d_time)}    a ${fmt(built.a_plan_time)} / ${fmt(built.a_time)}`)
    if (hit) {
      console.log(`       实际   d ${fmt(hit.d_plan_time)} / ${fmt(hit.d_time)}    a ${fmt(hit.a_plan_time)} / ${fmt(hit.a_time)}`)
    } else {
      console.log('       实际   （按航班号没捞到，跳过）')
    }
  }

  /* ---------- 异常与提示 ---------- */
  const shiftedTotal = Object.values(stats.shifted).reduce((a, b) => a + b, 0)
  const shiftDetail = Object.entries(stats.shifted).filter(([, n]) => n > 0)
    .map(([k, n]) => `${k} ${n} 条`).join(' / ')
  if (shiftedTotal > 0) {
    console.log(`\n🔁 跨天后缀已按 ±1 天落到完整时间上，共 ${shiftedTotal} 条（${shiftDetail}）`)
  }
  if (stats.fallback > 0) {
    console.log(`\n⚠️ 有 ${stats.fallback} 处本侧日期为空，已退回用对侧日期做基准`)
  }
  if (stats.orphan.length > 0) {
    console.log(`\n⚠️ 有 ${stats.orphan.length} 个时间值两侧日期都为空，只能留 NULL：${stats.orphan.join('、')}`)
  }
  if (stats.unparsable.length > 0) {
    console.log(`\n⚠️ 有 ${stats.unparsable.length} 个时间原始值解析不了，已留 NULL：${[...new Set(stats.unparsable)].slice(0, 10).join('、')}`)
  }
  if (missedNames.size > 0) {
    console.log(`\n⚠️ 有 ${missedNames.size} 个机场名在 airport_name_code 里没匹配上（对应的码列留 NULL）：`)
    console.log('   ' + [...missedNames].sort().join('、'))
  }

  // 只用于复核的分布统计
  const noD = ecyilangRows.filter((r) => r.d_flight_date === null).length
  const noA = ecyilangRows.filter((r) => r.a_flight_date === null).length
  console.log(
    `\n📊 ecyilang 明细：只有离港侧 ${noA} 条 / 只有进港侧 ${noD} 条 / 两侧都有 ${ecyilangRows.length - noD - noA} 条`,
  )
}

main()
  .catch((err) => {
    console.error('\n❌ 灌装失败：', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
