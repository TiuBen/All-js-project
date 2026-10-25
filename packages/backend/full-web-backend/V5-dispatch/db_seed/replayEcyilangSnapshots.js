/**
 * ============================================================
 * replayEcyilangSnapshots.js —— 把多份快照**按时间顺序回放**进 ecyilang 表
 * ------------------------------------------------------------
 * 【解决什么问题】
 *   监控（monitorService）每天 00:01 灌基线、之后每 15 分钟比对并写
 *   ecyilang.changelog —— 但这只对「今天」生效。手里攒的历史快照
 *   （比如 10-12 两份、10-13 一份、10-14 三份、10-15 两份）没有走过这套流程，
 *   它们对应的行 readable_id / changelog 是空的。
 *
 *   本脚本把快照**当作监控的定时轮次来回放**：同一份快照按给定顺序，
 *   同一日期的第一份 = 建基线（先删当天旧行再插），后续每份 = 跑一轮比对
 *   （新增插行 / 减少删行 / 变更写列 + changelog 追加）。回放完，这几天的
 *   ecyilang 数据和 changelog 就跟监控真跑过一样。
 *
 * 【用法】
 *   ① 默认（不传参数）：回放 db_seed/ecyilang/ 目录下**文件名日期 ≥ 20261012**
 *      的全部快照，按文件名升序（= 抓取时间顺序）：
 *        pnpm exec tsx db_seed/replayEcyilangSnapshots.js
 *   ② 指定文件（绝对/相对路径，可多个，按参数顺序回放）：
 *        pnpm exec tsx db_seed/replayEcyilangSnapshots.js <a.json> [b.json ...]
 *
 * ★ 以后拿到新快照，丢进目录再跑一遍①即可（同日期会重灌重比，结果幂等）。
 *
 * 【口径】与 monitorService 完全一致（直接 import 它的导出函数）：
 *   flightReadableId = a_date|a_no|a_name|d_date|d_no|d_name（6 字段，日期取 YYYY-MM-DD）
 *   归一化比对：时间字段 toDateTime(本侧日期, 值).toISOString()；文本 toText
 *   changelog 元素：{ field, fieldLabel, oldValue, newValue, updateTime }（展示口径 'YYYY-MM-DD HH:mm'）
 *
 * ★ 必须用 tsx 跑（Prisma 7 生成的 client 是 TypeScript）。
 * ============================================================
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client.ts';
import {
    flightReadableIdOf, hashOf, dayOfRow, normOfRow, normOfDbRow,
    fieldDiff, labelOfRow, toDbRow, baseDayOf, TIME_FIELDS,
} from '../src/services/monitorService.js';
import { toDateTime, toText, airportMapOf, newStats } from './ecyilangRow.js';
import { cnDateTime } from '../src/utils/date.js';

/** ★ 无参数时的默认起点：回放文件名日期 ≥ 这个值的全部快照（就改这一行） */
const DEFAULT_FROM = '20261012';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = path.join(__dirname, 'ecyilang');

/* ---------- 连库（与 addNewEcyilangToDb.js 同一套配置） ---------- */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ 读不到 DATABASE_URL —— 检查项目根目录的 .env');
    process.exit(1);
}
const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString, options: '-c TimeZone=UTC' }),
});

/* ---------- 读快照 ---------- */

/** 文件 → { file, day, rows }（day 取自文件名前 8 位；rows 过滤到归属日当天） */
function readSnapshot(file) {
    const full = path.isAbsolute(file) ? file : path.join(SNAPSHOT_DIR, file);
    if (!fs.existsSync(full)) throw new Error(`找不到文件：${full}`);
    const json = JSON.parse(fs.readFileSync(full, 'utf8'));
    const rawRows = json.data ?? json.rows ?? json;
    if (!Array.isArray(rawRows)) throw new Error(`${file} 里的 data 不是数组`);

    const day = /^ecyilang(\d{8})/.exec(path.basename(file))?.[1]
        ?? (() => { throw new Error(`${file} 文件名里认不出日期（要 ecyilangYYYYMMDD…）`); })();
    const dayStr = `${day.slice(0, 4)}-${day.slice(4, 6)}-${day.slice(6, 8)}`;

    // 与监控同口径：只取归属日当天的行（跨天行不进这一天的集合）
    const rows = rawRows.filter((r) => dayOfRow(r) === dayStr);
    return { file: path.basename(file), day: dayStr, rows };
}

/** 默认文件清单：目录里文件名日期 ≥ DEFAULT_FROM 的快照，按文件名升序 */
function defaultFiles() {
    return fs.readdirSync(SNAPSHOT_DIR)
        .filter((f) => f.endsWith('.json'))
        .filter((f) => (/^ecyilang(\d{8})/.exec(f)?.[1] ?? '') >= DEFAULT_FROM)
        .sort();
}

/* ---------- 回放一天 ---------- */

/** 当天日期列边界 */
const dayBound = (day) => {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
};

/**
 * 回放一个日期的快照序列
 * @param {string} day 'YYYY-MM-DD'
 * @param {Array<{file:string, rows:Object[]}>} snaps 按抓取时间升序
 * @param {Map<string,{iata,icao}>} airports
 * @returns {Promise<{day, baseline:number, added:number, removed:number, changed:number}>}
 */
async function replayDay(day, snaps, airports) {
    const stats = { day, baseline: 0, added: 0, removed: 0, changed: 0, changedFields: 0 };

    /* ---------- 第一份：建基线（先删当天旧行再插，与 00:01 重灌同语义） ---------- */
    const [first, ...rest] = snaps;
    const bound = dayBound(day);
    const removedOld = await prisma.ecyilang.deleteMany({
        where: { OR: [{ d_flight_date: bound }, { a_flight_date: bound }] },
    });
    await prisma.ecyilang.createMany({ data: first.rows.map((raw) => toDbRow(raw, airports)) });

    // 重建 map：hash → { readableId, uuid, norm }（从库读，保证与库里完全同口径）
    const dbRows = await prisma.ecyilang.findMany({
        where: { OR: [{ d_flight_date: bound }, { a_flight_date: bound }], flight_readable_id: { not: null } },
    });
    /** @type {Map<string, {readableId:string, uuid:string, norm:Object}>} */
    const map = new Map();
    for (const row of dbRows) {
        const readableId = flightReadableIdOf(row);
        map.set(hashOf(readableId), { readableId, uuid: row.id, norm: normOfDbRow(row) });
    }
    stats.baseline = map.size;
    console.log(`▶ ${day} 基线：${first.file} → ${map.size} 行（清旧行 ${removedOld.count}）`);

    /* ---------- 后续每份：跑一轮比对 ---------- */
    for (const snap of rest) {
        const incoming = new Map();
        for (const raw of snap.rows) {
            incoming.set(hashOf(flightReadableIdOf(raw)), { raw, norm: normOfRow(raw) });
        }

        // ① 新增
        for (const [hash, item] of incoming) {
            if (map.has(hash)) continue;
            const created = await prisma.ecyilang.create({ data: toDbRow(item.raw, airports), select: { id: true } });
            map.set(hash, { readableId: flightReadableIdOf(item.raw), uuid: created.id, norm: item.norm });
            stats.added += 1;
            console.log(`   [${snap.file}] 🆕 ${labelOfRow(item.raw)}`);
        }

        // ② 减少
        const gone = [...map.entries()].filter(([hash]) => !incoming.has(hash));
        if (gone.length) {
            await prisma.ecyilang.deleteMany({ where: { flight_readable_id: { in: gone.map(([, e]) => e.readableId) } } });
            for (const [hash, e] of gone) {
                map.delete(hash);
                stats.removed += 1;
                console.log(`   [${snap.file}] ⚠️ 减少 ${e.readableId}`);
            }
        }

        // ③ 变更：新值写列 + changelog 追加
        for (const [hash, item] of incoming) {
            const old = map.get(hash);
            if (!old) continue;
            const changes = fieldDiff(old.norm, item.norm);
            const keys = Object.keys(changes);
            if (!keys.length) continue;

            // ★ changelog 与监控同口径：不记字段级 diff，直接存整条快照（调试可看原始数据）
            const dbRow = await prisma.ecyilang.findUnique({ where: { id: old.uuid }, select: { changelog: true } });
            const log = [...(dbRow?.changelog ?? []), { updateTime: cnDateTime(new Date()), snapshot: item.raw }];

            const patch = {};
            for (const field of keys) {
                patch[field] = TIME_FIELDS.has(field)
                    ? toDateTime(baseDayOf(item.raw, field), item.raw[field])
                    : toText(item.raw[field]);
            }
            await prisma.ecyilang.update({
                where: { id: old.uuid },
                data: { ...patch, changelog: log },
                select: { id: true },
            });
            map.set(hash, { ...old, norm: item.norm });
            stats.changed += 1;
            stats.changedFields += keys.length;
            console.log(`   [${snap.file}] 🔄 ${labelOfRow(item.raw)} → ` +
                keys.map((f) => `${f}: ${changes[f].old ?? '空'}→${changes[f].new ?? '空'}`).join('；'));
        }
    }
    return stats;
}

/* ---------- 主流程 ---------- */
async function main() {
    const files = process.argv.slice(2).length ? process.argv.slice(2) : defaultFiles();
    if (!files.length) throw new Error(`目录里没有 ${DEFAULT_FROM} 之后的快照（db_seed/ecyilang/）`);
    console.log(`▶ ${files.length} 份快照，按给定顺序回放：\n   ${files.map((f) => path.basename(f)).join('\n   ')}`);

    // 快照按「文件名日期」分组；组内按给定顺序回放
    const snaps = files.map(readSnapshot);
    const byDay = new Map();
    for (const s of snaps) {
        if (!s.rows.length) {
            console.warn(`⚠️ ${s.file} 里没有 ${s.day} 的行（数据日对不上？），跳过`);
            continue;
        }
        if (!byDay.has(s.day)) byDay.set(s.day, []);
        byDay.get(s.day).push(s);
    }
    console.log(`▶ 归属日分组：${[...byDay.entries()].map(([d, ss]) => `${d}×${ss.length}`).join('、')}\n`);

    // 机场码表读一次共用
    const airports = airportMapOf(await prisma.airport_name_code.findMany({
        select: { chinese_airport_name: true, airport_iata_code: true, airport_icao_code: true },
    }));
    console.log(`  机场码表 ${airports.size} 行\n`);

    const done = [];
    for (const [day, group] of [...byDay.entries()].sort()) {
        done.push(await replayDay(day, group, airports));
    }

    console.log('\n✅ 回放完成');
    for (const s of done) {
        console.log(`   ${s.day}：基线 ${s.baseline} 行，后续新增 ${s.added} / 减少 ${s.removed} / 变更 ${s.changed} 班（共 ${s.changedFields} 个字段）`);
    }
    const total = await prisma.ecyilang.count();
    const withId = await prisma.ecyilang.count({ where: { flight_readable_id: { not: null } } });
    const withLog = await prisma.ecyilang.count({ where: { changelog: { not: { equals: [] } } } });
    console.log(`\n   复核：表内共 ${total} 行；有 readable_id ${withId} 行；changelog 非空 ${withLog} 行`);
}

main()
    .catch((err) => {
        console.error('\n❌ 回放失败：', err.message);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
