/**
 * ============================================================
 * Template —— 检查单面板组目录入口（barrel）
 * ------------------------------------------------------------
 * 「穷举法」：一个检查单类型 = 一个组件。每个组件在**自己文件顶部静态 import**
 * 自己那份模板（utils/*）与视频监管数据，编译期即确定，不做运行时查找。
 *
 * 本文件只做两件事：
 *   1. 汇总 5 个面板组组件，对外提供 `PANEL_BY_CATEGORY` 映射表
 *   2. 提供 `resolvePanelGroup(category)` —— 按检查单 category 取组件
 *
 * 这样 ChecklistEditor/index.jsx 只需 import 一个 `resolvePanelGroup`，
 * 不必关心当前有几种检查单、各自叫什么。新增检查单类型时：
 *   ① 建 utils/Xxx.js 模板  ② 建本目录下 Xxx.jsx  ③ 在下面 MAP 里补一行
 * ============================================================
 */
import CargoBypassFlight from "./CargoBypassFlight";
import CargoInitFlight from "./CargoInitFlight";
import PassengerInitFlight from "./PassengerInitFlight";
import PassengerBypassFlight from "./PassengerBypassFlight";
import ShunhangFlight from "./ShunhangFlight";

/**
 * 检查单类型（category）→ 面板组组件
 * key 与 checklistTypeConfig 的 TYPE_BUTTONS[].label / tplId 一一对应。
 */
export const PANEL_BY_CATEGORY = {
    客运始发航班: PassengerInitFlight,
    客运过站航班: PassengerBypassFlight,
    货运始发航班: CargoInitFlight,
    货运过站航班: CargoBypassFlight,
    顺航检查单: ShunhangFlight,
};

/** 兜底类型：category 未命中时用它（理论上不应发生） */
export const FALLBACK_CATEGORY = "货运过站航班";

/**
 * 按检查单 category 取对应的面板组组件
 * @param {string} category 检查单类型（模板的 category，中文）
 * @returns {Function} 面板组组件
 */
export const resolvePanelGroup = (category) =>
    PANEL_BY_CATEGORY[category] || PANEL_BY_CATEGORY[FALLBACK_CATEGORY];

export {
    CargoBypassFlight,
    CargoInitFlight,
    PassengerInitFlight,
    PassengerBypassFlight,
    ShunhangFlight,
};

export default resolvePanelGroup;
