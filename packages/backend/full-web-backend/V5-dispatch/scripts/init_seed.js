// ============================================================
// 预置数据脚本：向 PostgreSQL 插入
//   1) 预置航班（固定数据，不随机）—— 覆盖 今天±2天
//   2) 为其中 4 架航班生成【已填好】的检查单记录（部分节点已完成，
//      含检查人、检查时间、状态）—— 直接展示"已填写"的效果
// 运行：node scripts/init_seed.js
// ============================================================
import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CHECKLISTS_DIR = path.resolve(__dirname, '..', 'data', 'checklists');

const client = new pg.Client({
  host: process.env.PG_HOST || '127.0.0.1',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'flight_dispatch',
});

function loadTemplate(id) {
  const f = path.join(CHECKLISTS_DIR, `${id}.json`);
  return JSON.parse(fs.readFileSync(f, 'utf-8'));
}

// ---------- 预置航班（固定数据） ----------
function buildFlights() {
  const today = new Date();
  // 本地日期字符串（避免 toISOString 时区偏移导致日期差一天）
  const d = (offset) => {
    const dd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    const y = dd.getFullYear();
    const m = String(dd.getMonth() + 1).padStart(2, '0');
    const day = String(dd.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const t = (dateStr, h, m) => `${dateStr}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`;
  const day0 = d(0), day1 = d(1), day2 = d(2), dayM1 = d(-1);

  return [
    // ===== 货运航班 =====
    { id: 'FL-CARGO-001', flightNo: 'Y81111', origin: '深圳', destination: '武汉', dep: t(day0, 3, 30), arr: t(day0, 5, 20), date: day0, status: '到达', ac: 'B757', ft: '常规航班', cat: '货运航班' },
    { id: 'FL-CARGO-002', flightNo: 'Y82222', origin: '北京', destination: '武汉', dep: t(day0, 6, 0), arr: t(day0, 7, 45), date: day0, status: '起飞', ac: 'B737', ft: '常规航班', cat: '货运航班' },
    { id: 'FL-CARGO-003', flightNo: 'Y83333', origin: '成都', destination: '武汉', dep: t(day0, 21, 0), arr: t(day1, 0, 30), date: day0, status: '计划', ac: 'B747', ft: '始发航班', cat: '货运航班' },
    { id: 'FL-CARGO-004', flightNo: 'Y84444', origin: '上海', destination: '武汉', dep: t(day1, 8, 15), arr: t(day1, 10, 5), date: day1, status: '计划', ac: 'B767', ft: '常规航班', cat: '货运航班' },
    { id: 'FL-CARGO-005', flightNo: 'Y85555', origin: '郑州', destination: '武汉', dep: t(day2, 4, 40), arr: t(day2, 5, 50), date: day2, status: '计划', ac: 'B737', ft: '始发航班', cat: '货运航班' },
    // ===== 客运航班 =====
    { id: 'FL-PAX-001', flightNo: 'CZ9101', origin: '广州', destination: '武汉', dep: t(day0, 9, 0), arr: t(day0, 10, 40), date: day0, status: '到达', ac: 'A320', ft: '航空器过站', cat: '客运航班' },
    { id: 'FL-PAX-002', flightNo: 'CZ9202', origin: '武汉', destination: '厦门', dep: t(day0, 13, 30), arr: t(day0, 15, 10), date: day0, status: '起飞', ac: 'A330', ft: '航空器始发', cat: '客运航班' },
    { id: 'FL-PAX-003', flightNo: 'CZ9303', origin: '昆明', destination: '武汉', dep: t(day1, 11, 0), arr: t(day1, 13, 20), date: day1, status: '计划', ac: 'A320', ft: '航空器过站', cat: '客运航班' },
    { id: 'FL-PAX-004', flightNo: 'CZ9404', origin: '武汉', destination: '成都', dep: t(dayM1, 17, 0), arr: t(dayM1, 18, 40), date: dayM1, status: '到达', ac: 'A321', ft: '航空器始发', cat: '客运航班' },
    { id: 'FL-PAX-005', flightNo: 'CZ9505', origin: '重庆', destination: '武汉', dep: t(day2, 7, 30), arr: t(day2, 8, 50), date: day2, status: '计划', ac: 'B737', ft: '航空器过站', cat: '客运航班' },
  ];
}

// ---------- 为航班生成"已填好"的检查单 ----------
function buildFilledChecklist(flight, tpl) {
  const nodes = tpl.flightTypes[flight.ft] || [];
  const items = {};
  const vidItems = {};

  // 进度：货运常规填 10/14，货运始发填 6/9，客运过站填 12/17，客运始发填 8/13
  const progressMap = {
    'FL-CARGO-001': 10, 'FL-CARGO-002': 6, 'FL-CARGO-003': 5,
    'FL-PAX-001': 12, 'FL-PAX-002': 8,
  };
  const fillCount = Math.min(progressMap[flight.id] ?? nodes.length, nodes.length);

  // 时间基准（从航班起飞时间反推）
  const baseDate = new Date(flight.arr);
  let cursor = new Date(baseDate.getTime() - 60 * 60000); // 落地前 1 小时

  nodes.slice(0, fillCount).forEach((n, i) => {
    // 每 5 个节点有一个"异常"（需要复查），其余正常
    const seq = n.source?.seq ?? n.seq ?? i + 1;
    const isAbnormal = i % 5 === 4;
    const status = isAbnormal ? 'abnormal' : 'ok';
    const time = new Date(cursor.getTime() + i * 7 * 60000);
    items[`main-${seq}`] = {
      status,
      time: `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`,
      note: isAbnormal ? '已通知保障单位复查，稍后补录' : '正常完成',
    };
    // 辅助项/视频项也填一部分
    (n.auxiliaries || []).forEach((a, ai) => {
      if (ai % 2 === 0 && a.name !== '（视频监管）') {
        items[`aux-${a.row}`] = { status: 'ok', time: items[`main-${seq}`].time, note: '' };
      }
      (a.auxiliary || []).forEach((v) => {
        if (ai % 2 === 0) {
          vidItems[`video-${v.uuid}`] = { status: 'ok', note: '视频截图已核验' };
        }
      });
    });
  });

  const header = {
    date: flight.date,
    flightNo: flight.flightNo,
    aircraftType: flight.ac,
    landingTime: flight.arr.slice(11, 16),
    stand: flight.cat === '货运航班' ? '301' : '105',
  };

  return {
    flightId: flight.id,
    flightNo: flight.flightNo,
    aircraftType: flight.ac,
    flightType: flight.ft,
    checklistCategory: tpl.category,
    checklistTemplateId: tpl.category === '客运航班' ? 'passenger-checklist' : 'cargo-checklist',
    checklistTitle: `${tpl.category}节点保障及合规性监控检查单`,
    flightDate: flight.date,
    header,
    items,
    videoSupervision: vidItems,
    inspector: flight.cat === '货运航班' ? '李工' : '王调度',
    status: 'submitted',
    checkedAt: new Date(`${flight.date}T10:30:00`).toISOString(),
  };
}

// ---------- 主流程 ----------
async function main() {
  await client.connect();
  console.log('连接 PG 成功');

  // 0. 确保表存在（幂等建表）
  await client.query(`
    CREATE TABLE IF NOT EXISTS flights (
      id VARCHAR(64) PRIMARY KEY,
      flight_no VARCHAR(32) NOT NULL,
      origin VARCHAR(32),
      destination VARCHAR(32),
      departure_time_utc TIMESTAMPTZ,
      landing_time_utc TIMESTAMPTZ,
      flight_date VARCHAR(16),
      status VARCHAR(16) DEFAULT '计划',
      aircraft_type VARCHAR(32),
      flight_type VARCHAR(32),
      category VARCHAR(32),
      has_checklist BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_flights_date ON flights(flight_date);`);
  await client.query(`
    CREATE TABLE IF NOT EXISTS checklist_records (
      id SERIAL PRIMARY KEY,
      flight_id VARCHAR(64) NOT NULL,
      flight_no VARCHAR(32),
      aircraft_type VARCHAR(32),
      flight_type VARCHAR(32),
      checklist_category VARCHAR(32) NOT NULL,
      checklist_template_id VARCHAR(64) NOT NULL,
      checklist_title TEXT,
      flight_date VARCHAR(16),
      header JSONB,
      items JSONB,
      video_supervision JSONB,
      inspector VARCHAR(64),
      status VARCHAR(16) DEFAULT 'draft',
      checked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);
  console.log('表结构就绪');

  // 1. 清空旧数据（可选——保持幂等：先删再插）
  await client.query('DELETE FROM checklist_records');
  await client.query('DELETE FROM flights');
  console.log('已清空旧数据');

  // 2. 插入航班
  const flights = buildFlights();
  for (const f of flights) {
    await client.query(
      `INSERT INTO flights (id, flight_no, origin, destination, departure_time_utc, landing_time_utc,
         flight_date, status, aircraft_type, flight_type, category, has_checklist)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [f.id, f.flightNo, f.origin, f.destination, f.dep, f.arr, f.date, f.status, f.ac, f.ft, f.cat, false],
    );
  }
  console.log(`插入航班 ${flights.length} 架`);

  // 3. 为部分航班生成已填好的检查单
  const templates = {
    '货运航班': loadTemplate('cargo-checklist'),
    '客运航班': loadTemplate('passenger-checklist'),
  };
  const filledIds = ['FL-CARGO-001', 'FL-CARGO-002', 'FL-PAX-001', 'FL-PAX-002'];
  const recs = [];
  for (const f of flights) {
    if (!filledIds.includes(f.id)) continue;
    const tpl = templates[f.cat];
    const rec = buildFilledChecklist(f, tpl);
    await client.query(
      `INSERT INTO checklist_records
        (flight_id, flight_no, aircraft_type, flight_type, checklist_category,
         checklist_template_id, checklist_title, flight_date, header, items, video_supervision,
         inspector, status, checked_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [rec.flightId, rec.flightNo, rec.aircraftType, rec.flightType, rec.checklistCategory,
       rec.checklistTemplateId, rec.checklistTitle, rec.flightDate,
       JSON.stringify(rec.header), JSON.stringify(rec.items), JSON.stringify(rec.videoSupervision),
       rec.inspector, rec.status, rec.checkedAt],
    );
    // 更新航班 has_checklist
    await client.query('UPDATE flights SET has_checklist = true WHERE id = $1', [f.id]);
    recs.push(rec);
  }
  console.log(`插入已填好的检查单 ${recs.length} 份：${recs.map((r) => `${r.flightNo}(${r.inspector})`).join('、')}`);

  // 4. 汇总
  const fCount = (await client.query('SELECT count(*) FROM flights')).rows[0].count;
  const rCount = (await client.query('SELECT count(*) FROM checklist_records')).rows[0].count;
  console.log(`\n✅ 预置完成：flights=${fCount} 条，checklist_records=${rCount} 条`);

  await client.end();
}

main().catch((e) => {
  console.error('❌ 预置失败:', e.message);
  process.exit(1);
});
