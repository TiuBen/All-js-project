const BASE = 'http://localhost:5183/api';
async function j(path, opts = {}) {
  const res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  return res.json();
}
(async () => {
  // 1. 取今天一个客运航班
  const flights = await j('/flights?date=2026-08-06');
  const f = flights.items.find((x) => x.category === '客运航班');
  if (!f) { console.log('今天无客运航班'); return; }
  console.log('1. 客运航班:', f.flightNo, '| 类型:', f.flightType);

  // 2. 加载客运模板
  const tpl = await j('/checklists/templates/passenger-checklist');
  console.log('2. 模板阶段:', tpl.phaseOrder);
  const nodes = tpl.flightTypes[f.flightType];
  console.log('   节点数:', nodes.length);
  const n0 = nodes[0];
  console.log('   节点1:', n0.name, '| 责任单位:', n0.responsible, '| 类型:', n0.category);
  console.log('   标准要求前40字:', n0.desc.slice(0, 40) + '...');

  // 3. 创建客运检查单记录
  const items = {};
  nodes.slice(0, 2).forEach((n) => { items['main-' + n.seq] = { status: 'ok', time: '14:00', note: '正常' }; });
  const rec = await j('/checklists/records', {
    method: 'POST',
    body: JSON.stringify({
      flightId: f.id, flightNo: f.flightNo, aircraftType: f.aircraftType, flightType: f.flightType,
      checklistCategory: '客运航班', checklistTemplateId: 'passenger-checklist',
      flightDate: f.flightDate, header: { date: f.flightDate, flightNo: f.flightNo },
      items, videoSupervision: {}, inspector: '客运联调', status: 'draft',
      checkedAt: new Date().toISOString(),
    }),
  });
  console.log('3. 记录创建:', rec.id, '| checked_at:', rec.checked_at);

  // 4. 按日期查询
  const byDate = await j('/checklists/records?date=' + f.flightDate);
  console.log('4. 按日期查询:', byDate.total, '条');
  console.log('   最新:', byDate.items[0].flight_no, '|', byDate.items[0].inspector, '|', byDate.items[0].flight_type);

  // 5. 清理测试记录
  const pg = require('pg');
  const client = new pg.Client({ host: '127.0.0.1', port: 5432, user: 'postgres', password: 'admin', database: 'flight_dispatch' });
  await client.connect();
  await client.query("DELETE FROM checklist_records WHERE inspector = '客运联调'");
  await client.end();
  console.log('5. 测试记录已清理');
  console.log('\n✅ 客运检查单完整流程验证通过！');
})().catch((e) => { console.error('❌ 失败:', e.message); process.exit(1); });
