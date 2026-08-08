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
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const data = JSON.parse(raw);
      return { id: f.replace(/\.json$/, ''), ...data };
    });
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
    flightTypeCount: Object.keys(t.flightTypes || {}).length,
  }));
}

/**
 * 按 id 读取单个模板（完整内容）
 * @param {string} id 模板 id（对应文件名，如 cargo-checklist）
 * @returns {Object|null} 完整模板；不存在返回 null
 */
export function getTemplateById(id) {
  const file = path.join(config.paths.checklists, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return { id, ...JSON.parse(fs.readFileSync(file, 'utf-8')) };
}
