/**
 * ============================================================
 * 顺航检查单 —— 节点保障检查单静态数据（**占位模板**）
 * ------------------------------------------------------------
 * ⚠️ 本文件**不由** scripts/gen-checklist-static.cjs 生成（后端没有对应的
 *    data/checklists/节点保障/顺航检查单.json），是**手工维护**的占位文件。
 *    后端现有的 `data/checklists/视频监管/顺航检查单.json` 装的是视频监管
 *    数据（groups），不是节点保障模板 —— 两者同名但结构不同，别混用。
 *
 * 为什么需要它：
 *   checklistTypeConfig.js 的 TYPE_BUTTONS 有「顺航检查单」这一项，
 *   且 CSS 前缀航班会默认落到顺航；若 utils/TEMPLATES 里没有它，
 *   loadTemplate("顺航检查单") 会查表得 null 进而抛错，页面直接断链。
 *
 * 当前状态：**schema 为空** → 主监控 / 辅助监控列显示空态，
 *   只有视频监管列有内容（42 条顺航专属条目，见 shunhangVideoFocus.js）。
 *   等拿到顺航真实节点清单后，按其他模板的同构结构填入 schema 即可：
 *     schema[]: { uuid, id, eventId, code, category, name, desc, formula, auxiliaries[] }
 *
 * 结构：schema[]（主监控节点）→ auxiliaries[]（辅助监控项），节点带 formula 供时间公式求值
 * ============================================================
 */
export const shunhangFlight = {
    "uuid": "6b33bdb5-5329-4383-b84c-e427435a7870",
    "category": "顺航检查单",
    "source": "顺航检查单（占位模板，节点待补）",
    "generatedAt": "2026-09-17T00:00:00.000Z",
    "checklistName": "顺航",
    "schemaVersion": "3.0-placeholder",
    "variables": {},
    "parameters": [],
    "schema": []
};

export default shunhangFlight;
