const BASE = 'http://localhost:5183/api';
async function j(path, opts = {}) {
  const res = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  return res.json();
}
(async () => {
  // 1. 取今天一个货运航班
  const flights = await j('/flights?date=2026-08-05');
  const f = flights.items.find((x) => x.category === '货运航班') || flights.items[0];
  console.log('航班:', f.flightNo, f.category, f.flightType);

  // 2. 加载模板
  const tplId = f.category === '客运航班' ? 'passenger-checklist' : 'cargo-checklist';
  const tpl = await j('/checklists/templates/' + tplId);
  const nodes = tpl.flightTypes[f.flightType];
  console.log('模板节点数:', nodes.length, '（' + f.flightType + '）');

  // 3. 模拟填写前2个主节点
  const items = {};
  nodes.slice(0, 2).forEach((n) => { items['main-' + n.seq] = { status: 'ok', time: '09:30', note: '正常' }; });
  nodes.slice(0, 1).forEach((n) => (n.auxiliaries || []).forEach((a) => { items['aux-' + a.row] = { status: 'ok', time: '09:25' }; }));

  // 4. 创建记录（含 flight_date + checked_at）
  const rec = await j('/checklists/records', {
    method: 'POST',
    body: JSON.stringify({
      flightId: f.id, flightNo: f.flightNo, aircraftType: f.aircraftType, flightType: f.flightType,
      checklistCategory: tpl.category, checklistTemplateId: tpl.id,
      flightDate: f.flightDate, header: { date: f.flightDate, flightNo: f.flightNo },
      items, videoSupervision: {}, inspector: '联调测试', status: 'draft',
      checkedAt: new Date().toISOString(),
    }),
  });
  console.log('记录创建:', rec.id, '| checked_at:', rec.checked_at);

  // 5. 按日期过滤查询
  const byDate = await j('/checklists/records?date=' + f.flightDate);
  console.log('按', f.flightDate, '查询:', byDate.total, '条');
  const latest = byDate.items[0];
  console.log('最新记录:', latest.flight_no, '| 检查人:', latest.inspector, '| 时间:', latest.checked_at);

  // 6. 更新为已提交
  const upd = await j('/checklists/records/' + rec.id, { method: 'PUT', body: JSON.stringify({ status: 'submitted', inspector: '张三' }) });
  console.log('更新后:', upd.status, '| 检查人:', upd.inspector);
  console.log('\n✅ 检查单完整流程验证通过！');
})().catch((e) => { console.error('❌ 失败:', e.message); process.exit(1); });
