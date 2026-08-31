/**
 * ============================================================
 * 检查单模板 Service —— 业务逻辑层
 * ------------------------------------------------------------
 * 检查单模板存放于 data/checklists/*.json（由 Excel 解析生成），
 * 本模块负责模板文件的读取与元信息整理。
 * ============================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';

/**
 * 读取全部模板文件，返回带 id 的完整模板对象
 * @returns {Array} [{ id, category, source, generatedAt, flightTypes, ... }]
 */
export function loadTemplates() {
  const dir = config.paths.checklists;
  if (!fs.existsSync(dir)) return [];
  const templates = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    try {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const data = JSON.parse(raw);
      templates.push({ id: f.replace(/\.json$/, ''), ...data });
    } catch (err) {
      // 单个模板文件损坏不阻断整体（如临时副本 / 待办文件）
      console.warn(`[模板] 跳过无法解析的模板文件: ${f} → ${err.message}`);
    }
  }
  return templates;
}

/**
 * 模板列表元信息（不含完整树，体积小，适合列表页）
 * @returns {Array} [{ id, category, source, generatedAt, flightTypeCount }]
 */
export function listTemplateMeta() {
  return loadTemplates().map((t) => ({
    id: t.id,
    category: t.category,
    source: t.source,
    generatedAt: t.generatedAt,
    flightTypeCount: t.flightTypes
      ? Object.keys(t.flightTypes).length
      : Array.isArray(t.schema)
      ? 1 // 新结构：顶层 schema 数组 + checklistName（单航班类型模板）
      : 0,
  }));
}

/**
 * 视频监管重点文件映射：按模板 category → 独立的视频监管重点 JSON（无映射则返回 null）
 * 货运始发/货运过站共用 货运航班视频监管重点.json；客运始发/客运过站共用 客运航班视频监管重点.json
 */
const VIDEO_FOCUS_MAP = {
  货运航班: '货运航班视频监管重点',
  客运航班: '客运航班视频监管重点',
};

/**
 * 按 id 读取单个模板（完整内容），并附加关联的视频监管重点（videoFocus，独立 JSON 文件）
 * @param {string} id 模板 id（对应文件名，如 货运始发航班）
 * @returns {Object|null} 完整模板（含 videoFocus 字段）；不存在返回 null
 */
export function getTemplateById(id) {
  const file = path.join(config.paths.checklists, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

  // 视频监管重点：按 category 映射独立文件；文件缺失时 videoFocus 为 null（前端自动降级为空）
  let videoFocus = null;
  const vfId = VIDEO_FOCUS_MAP[data.category];
  if (vfId) {
    const vfFile = path.join(config.paths.checklists, `${vfId}.json`);
    if (fs.existsSync(vfFile)) {
      videoFocus = { id: vfId, ...JSON.parse(fs.readFileSync(vfFile, 'utf-8')) };
    }
  }

  return { id, ...data, videoFocus };
}
