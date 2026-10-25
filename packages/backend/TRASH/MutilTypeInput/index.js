/**
 * ============================================================
 * ChecklistPage/Const —— 检查单静态模板（桶文件 / barrel）
 * ------------------------------------------------------------
 * 只做转发，不定义任何数据：调用方可以一行拿全，不必记住文件名。
 *   import { cargoInitFlight, CARGO_VIDEO_FOCUS } from "../Const";
 *
 * ★ 只用 `export *`（命名导出），**不重导出 default**：每个模板文件同时提供
 *   「同名命名导出 + default 指向同一个对象」（如 `export const cargoInitFlight = {...}`
 *   + `export default cargoInitFlight`），再导一次 default 会跟命名导出撞名。
 *   需要 default 的直接按文件名 import。
 * ★ 各文件的命名导出互不重名，`export *` 不会冲突（新增文件时保持这个前提）。
 * ============================================================
 */

// 全货机：初始检查单 + 备降检查单 + 视频监管
export * from "./cargoInitFlight";
export * from "./cargoBypassFlight";
export * from "./cargoVideoFocus";

// 客机：初始检查单 + 备降检查单 + 视频监管
export * from "./passengerInitFlight";
export * from "./passengerBypassFlight";
export * from "./passengerVideoFocus";

// 顺航：检查单 + 视频监管
export * from "./shunhangFlight";
export * from "./shunhangVideoFocus";
