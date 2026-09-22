/**
 * 运行时探针：类型表合并（TYPE_COLORS）+ 默认模板由 store 兜底
 * 跑法：node _probe26.mjs（必须放项目根）
 */
import { createServer } from 'vite'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const load = (p) => vite.ssrLoadModule(p)

const { useChecklistStore } = await load('/src/store/checklistStore.js')
const TJ = await load('/src/pages/ChecklistPage/ChecklistEditor/Template/TemplateJson/index.js')
const ID = await load('/src/pages/ChecklistPage/ChecklistEditor/Components/ToolBar/Components/InfoDisplay.jsx')
const { default: InfoDisplay, TYPE_COLORS, TYPE_LABELS, typeColorOf, withAlpha } = ID
const { default: ChecklistToolbar } = await load(
    '/src/pages/ChecklistPage/ChecklistEditor/Components/ToolBar/Toolbar.jsx'
)
const { default: ChecklistEditor } = await load('/src/pages/ChecklistPage/ChecklistEditor/index.jsx')
const { default: ChecklistPage } = await load('/src/pages/ChecklistPage/index.jsx')

const lines = []
const log = (s) => lines.push(s)
const ok = (b) => (b ? 'OK' : 'FAIL')
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

log('===== 1. 类型表合并结果 =====')
log(`  TYPE_LABELS = ${TYPE_LABELS.join(" · ")} ${ok(eq(TYPE_LABELS, ['顺航检查单', '货运始发航班', '货运过站航班', '客运始发航班', '客运过站航班']))}`)
log(`  TYPE_COLORS 是映射表 → ${ok(TYPE_COLORS['客运过站航班'] === '#6B2608')}`)
log(`  typeColorOf("客运始发航班") = ${typeColorOf('客运始发航班')} ${ok(typeColorOf('客运始发航班') === '#D946EF')}`)
log(`  已无 findTypeMeta / TYPE_META / DEFAULT_TYPE → ${ok(ID.findTypeMeta === undefined && ID.TYPE_META === undefined && ID.DEFAULT_TYPE === undefined)}`)
log(`  withAlpha("#7C3AED", 0.35) = ${withAlpha('#7C3AED', 0.35)} ${ok(withAlpha('#7C3AED', 0.35) === 'rgba(124, 58, 237, 0.35)')}`)
log(`  withAlpha 非法输入原样返回 → ${ok(withAlpha('nope') === 'nope')}`)

log('')
log('===== 2. store.loadTemplate 兜底（组件不再自己设默认）=====')
for (const bad of ['不存在的模板', undefined, null, '']) {
    await useChecklistStore.getState().loadTemplate(bad)
    const id = useChecklistStore.getState().template?.id
    log(`  loadTemplate(${JSON.stringify(bad)}) → ${id} ${ok(id === '货运过站航班')}`)
}
await useChecklistStore.getState().loadTemplate('顺航检查单')
log(`  loadTemplate("顺航检查单") → ${useChecklistStore.getState().template?.id} ${ok(useChecklistStore.getState().template?.id === '顺航检查单')}`)
log(`  store 里 FALLBACK_TEMPLATE_ID = ${TJ.FALLBACK_TEMPLATE_ID} ${ok(TJ.FALLBACK_TEMPLATE_ID === '货运过站航班')}`)

const warnings = []
const origError = console.error
console.error = (...a) => warnings.push(a.map(String).join(' '))

const init = useChecklistStore.getInitialState()
const setInit = (patch) => Object.assign(init, patch)
const FLIGHT = {
    id: 101, flightNo: 'CZ9101', origin: 'CAN', destination: 'PEK',
    aircraftType: 'B738', flightDate: '2026-09-19', category: '货运航班',
}
const render = (el) => renderToStaticMarkup(React.createElement(MemoryRouter, null, el))
const countOf = (html, re) => (html.match(re) || []).length
const BASE = {
    flight: FLIGHT, recordStatus: null, checkedAt: null, viewMode: 'form',
    thumbVisible: false, saveError: null, loadedRecord: null, items: {}, videoItems: {},
    panels: ['main', 'aux', 'video'],
}

log('')
log('===== 3. InfoDisplay 零 props（无任何兜底文案）=====')
setInit({ ...BASE, template: TJ.getTemplateById('货运过站航班') })
const d = render(React.createElement(InfoDisplay))
log(`  含返回按钮 + 标题 → ${ok(/<button/.test(d) && d.includes('CZ9101') && d.includes('货运过站航班'))}`)
log(`  标题色 #7C3AED → ${ok(/#7C3AED|rgb\(124,\s*58,\s*237\)/i.test(d))}`)
log(`  已无「调度席检查单」兜底文案 → ${ok(!d.includes('调度席检查单'))}`)

setInit({ ...BASE, template: TJ.getTemplateById('客运始发航班') })
const d2 = render(React.createElement(InfoDisplay))
log(`  换类型后标题色变 #D946EF → ${ok(/#D946EF|rgb\(217,\s*70,\s*239\)/i.test(d2))}`)

log('')
log('===== 4. Toolbar（activeBtn 已换成 activeColor + templateId）=====')
setInit({ ...BASE, template: TJ.getTemplateById('货运过站航班'), recordStatus: 'submitted', checkedAt: '2026-09-19T19:30:00.000Z' })
const tb = render(React.createElement(ChecklistToolbar))
log(`  下拉按钮色 rgba(124,58,237,.35) → ${ok(/rgba\(124,\s*58,\s*237,\s*0\.35\)/.test(tb))}`)
log(`  5 个下拉项都在 → ${ok(TYPE_LABELS.every((l) => tb.includes(l)))}`)
log(`  航班号与徽章仍由 InfoDisplay 渲染 → ${ok(tb.includes('CZ9101') && tb.includes('已提交'))}`)
log(`  其余入口齐备 → ${ok(['主要', '辅助', '视频', '流程图', '显示小地图', '独立展示', '草稿箱', '提交'].every((t) => tb.includes(t)))}`)

log('')
log('===== 5. ChecklistPage 首帧（SSR 不跑 effect，应停在 loading）=====')
setInit({ ...BASE, template: null })
const pg = render(React.createElement(ChecklistPage))
log(`  渲染成功且显示加载态 → ${ok(pg.includes('加载检查单'))}`)

log('')
log('===== 6. Editor 5 种类型回归 =====')
const CASES = [
    ['货运过站航班', 14, 40], ['货运始发航班', 9, 40], ['客运始发航班', 13, 38],
    ['客运过站航班', 17, 38], ['顺航检查单', 0, 42],
]
for (const [category, cards, video] of CASES) {
    setInit({ ...BASE, template: TJ.getTemplateById(category) })
    const html = render(React.createElement(ChecklistEditor))
    const c = countOf(html, /id="main-/g)
    const vItems = (TJ.resolveVideoFocus(category)?.groups || []).reduce((s, g) => s + (g.items || []).length, 0)
    log(`  ${category}: 卡片 ${c}/${cards} 视频 ${vItems}/${video} ${ok(c === cards && vItems === video)}`)
}

console.error = origError
log('')
log(`===== React 警告：${warnings.length} 条 =====`)
warnings.slice(0, 6).forEach((w) => log('  ' + w.slice(0, 180)))

await vite.close()
console.log(JSON.stringify(lines).slice(1, -1).replace(/","/g, '"\n"').replace(/\\n/g, '\n'))
