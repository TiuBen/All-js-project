/**
 * ============================================================
 * utils —— 检查单页（ChecklistPage）静态资源与工具入口
 * ------------------------------------------------------------
 * 目录结构（**全部编译期静态化，不再请求后端模板接口**）：
 *   模板（节点保障检查单）—— 每份一个文件，**文件名 = 导出标识符**，对应中文检查单类型：
 *     passengerInitFlight.js   客运始发航班
 *     passengerBypassFlight.js 客运过站航班
 *     cargoInitFlight.js       货运始发航班
 *     cargoBypassFlight.js     货运过站航班
 *     shunhangFlight.js        顺航检查单 —— ⚠️ 手工维护的**占位**模板（schema 为空），
 *                              后端无对应节点保障 JSON，不进生成脚本
 *   视频监管重点数据（groups 结构）—— 导出为大写下划线常量：
 *     passengerVideoFocus.js (PASSENGER_VIDEO_FOCUS) · cargoVideoFocus.js (CARGO_VIDEO_FOCUS)
 *     shunhangVideoFocus.js  (SHUNHANG_VIDEO_FOCUS)
 *   本文件：
 *     TEMPLATES        模板表（中文 id → 模板对象）
 *     getTemplateById  按 id 取模板（loadTemplate 的唯一数据来源）
 *     resolveVideoFocus 按 category 取视频监管数据
 *     ALL_VIDEO_CHECK_IDS 全部 vCheckId（store 据此生成逐项 setter）
 *
 * 命名约定（两类文件不同，别混）：
 *   - **模板** 的导出标识符 = 文件名（camelCase），如 `cargoBypassFlight`
 *   - **视频监管** 的导出标识符 = 大写下划线常量，如 `CARGO_VIDEO_FOCUS`
 *   - 模板对象体内的 `category` 字段仍是**中文**（= 模板 id = 落库 checklist_category），**不要改**
 *
 * 为什么静态化：
 *   模板是**确定的、有限份**的（5 份节点保障 + 3 份视频监管），
 *   按 category 穷举成文件即可在编译期完成，省掉一次网络往返与后端依赖，
 *   切换检查单类型时不再有 loading 空窗。
 * ============================================================
 */

// ===== 节点保障检查单模板（模板对象本身也对外导出，供 ChecklistEditor 下的
//        每个检查单组件直接 import 自己那一份）=====
// 约定：**导出标识符 = 文件名**（`import cargoBypassFlight from "./cargoBypassFlight"`）
import passengerInitFlight from "./passengerInitFlight";
import passengerBypassFlight from "./passengerBypassFlight";
import cargoInitFlight from "./cargoInitFlight";
import cargoBypassFlight from "./cargoBypassFlight";
// 顺航：后端无节点保障 JSON，为**手工维护的占位模板**（schema 为空），
// 不进生成脚本的 MAP，否则重跑脚本时会因缺源文件而失败
import shunhangFlight from "./shunhangFlight";

export {
    passengerInitFlight,
    passengerBypassFlight,
    cargoInitFlight,
    cargoBypassFlight,
    shunhangFlight,
};

// ===== 视频监管重点数据 =====
import { PASSENGER_VIDEO_FOCUS } from "./passengerVideoFocus";
import { CARGO_VIDEO_FOCUS } from "./cargoVideoFocus";
import { SHUNHANG_VIDEO_FOCUS } from "./shunhangVideoFocus";

export { PASSENGER_VIDEO_FOCUS, CARGO_VIDEO_FOCUS, SHUNHANG_VIDEO_FOCUS };

/**
 * 模板表：id → 模板对象
 * id 与 checklistTypeConfig 的 TYPE_BUTTONS[].tplId 一一对应（**中文**，如 "货运过站航班"）；
 * 返回的对象上**补一个 id 字段**（原件里没有），供 ChecklistPage 的
 * `template.id === btn.tplId` 反查当前类型，语义与旧接口返回保持一致。
 */
const TEMPLATE_SOURCES = {
    客运始发航班: passengerInitFlight,
    客运过站航班: passengerBypassFlight,
    货运始发航班: cargoInitFlight,
    货运过站航班: cargoBypassFlight,
    顺航检查单: shunhangFlight,
};

/** 全部模板（含补好的 id 字段）；只计算一次，引用永久稳定 */
export const TEMPLATES = Object.fromEntries(
    Object.entries(TEMPLATE_SOURCES).map(([id, tpl]) => [id, { ...tpl, id }])
);

/** 全部模板 id 列表（下拉/校验用） */
export const TEMPLATE_IDS = Object.keys(TEMPLATES);

/** 兜底模板 id：未匹配任何规则时的默认检查单 */
export const FALLBACK_TEMPLATE_ID = "货运过站航班";

/**
 * 按 id 取检查单模板（同步，无网络请求）
 * @param {string} id 模板 id（如 "货运过站航班"）
 * @returns {Object|null} 模板对象；无匹配返回 null
 */
export const getTemplateById = (id) => TEMPLATES[String(id || "")] || null;

/**
 * 按检查单 category 解析对应的视频监管重点数据（本地解析，无网络请求）
 * 匹配顺序不可调换：**顺航必须排在"货运"之前**（顺航为独立一份）
 * @param {string} category 检查单分类（如 "客运始发航班" / "顺航检查单"）
 * @returns {Object|null} { uuid, category, checklistName, groups }；无匹配返回 null
 */
export const resolveVideoFocus = (category) => {
    const c = String(category || "");
    if (c.includes("顺航")) return SHUNHANG_VIDEO_FOCUS;
    if (c.includes("客运")) return PASSENGER_VIDEO_FOCUS;
    if (c.includes("货运")) return CARGO_VIDEO_FOCUS;
    return null;
};

/**
 * 全部视频监管项 id（客运 → 货运 → 顺航，全局唯一：vCheckId1 ~ vCheckId124）
 * store 用它批量生成逐项 setter（set_vCheckId1 / set_vCheckId2 ...）
 * @type {string[]}
 */
export const ALL_VIDEO_CHECK_IDS = [
    ...PASSENGER_VIDEO_FOCUS.groups,
    ...CARGO_VIDEO_FOCUS.groups,
    ...SHUNHANG_VIDEO_FOCUS.groups,
].flatMap((g) => (g.items || []).map((it) => it.id));
