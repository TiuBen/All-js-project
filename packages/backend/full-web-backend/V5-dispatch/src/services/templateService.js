/**
 * ============================================================
 * 检查单模板 Service —— 业务逻辑层
 * ------------------------------------------------------------
 * 检查单模板存放于 data/checklists/ 下（由 Excel 解析生成），
 * 支持平铺与子目录两种组织方式，例如：
 *   data/checklists/节点保障/货运过站航班.json   ← 节点保障清单（模板）
 *   data/checklists/视频监管/货运航班视频监管重点.json ← 视频监管数据
 * 本模块负责模板文件的读取与元信息整理。
 *
 * 区分规则：只有含 `schema`（新结构）或 `flightTypes`（旧结构）的文件
 * 才视为「检查单模板」；视频监管类文件（groups）仅作数据源，不在此暴露。
 * ============================================================
 */
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config/index.js';

/** 判断一份已解析的 JSON 是否为「检查单模板」 */
function isTemplate(data) {
  return Array.isArray(data?.schema) || Boolean(data?.flightTypes);
}

/**
 * 枚举 checklists 目录下所有候选 JSON 文件（含一层子目录）
 * @returns {Array<{ id: string, file: string }>} id = 文件名（不含 .json）
 */
function listCandidateFiles() {
  const dir = config.paths.checklists;
  if (!fs.existsSync(dir)) return [];

  const out = [];
  const collect = (fullPath, name) => {
    if (!name.endsWith('.json')) return; // 目录、临时文件一律跳过
    out.push({ id: name.replace(/\.json$/, ''), file: fullPath });
  };

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const sub = path.join(dir, entry.name);
      for (const name of fs.readdirSync(sub)) collect(path.join(sub, name), name);
    } else {
      collect(path.join(dir, entry.name), entry.name);
    }
  }
  return out;
}

/**
 * 读取单个候选文件并判定是否为模板
 * @returns {Object|null} 模板对象；非模板（如视频监管数据）或解析失败返回 null
 */
function readTemplate(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return isTemplate(data) ? data : null;
}

/**
 * 读取全部模板文件，返回带 id 的完整模板对象
 * @returns {Array} [{ id, category, source, generatedAt, flightTypes, schema, ... }]
 */
export function loadTemplates() {
  const templates = [];
  for (const { id, file } of listCandidateFiles()) {
    try {
      const data = readTemplate(file);
      if (!data) continue; // 视频监管等非模板文件
      templates.push({ id, ...data });
    } catch (err) {
      // 单个模板文件损坏不阻断整体（如临时副本 / 待办文件）
      console.warn(`[模板] 跳过无法解析的模板文件: ${path.basename(file)} → ${err.message}`);
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
 * 按 id 读取单个模板（完整内容）
 * ------------------------------------------------------------
 * 注：视频监管重点已迁移到前端静态模块
 *     （frontend/src/pages/ChecklistPage/videoFocus/*.js），
 *     由前端按 category 本地解析，接口不再附加 videoFocus 字段，
 *     单次响应体积因此减少约 10~15KB。
 * 后端 data/checklists/视频监管/{客运|货运}航班视频监管重点.json 仍作为数据源保留。
 * @param {string} id 模板 id（对应文件名，如 货运始发航班）
 * @returns {Object|null} 完整模板；不存在或非模板文件返回 null
 */
export function getTemplateById(id) {
  const hit = listCandidateFiles().find((t) => t.id === id);
  if (!hit) return null;
  try {
    const data = readTemplate(hit.file);
    return data ? { id, ...data } : null;
  } catch {
    return null;
  }
}
