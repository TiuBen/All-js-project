/**
 * ============================================================
 * 视频监管重点 —— 前端静态数据入口
 * ------------------------------------------------------------
 * 数据已从后端 JSON 内联到前端（passengerVideoFocus / cargoVideoFocus / shunhangVideoFocus），
 * 页面按检查单 category 在本地解析，**不再请求后端接口**，
 * 切换检查单类型时也就不会再有视频监管重点的网络往返。
 *
 * 匹配规则（与后端 data/checklists 下的三份文件一一对应）：
 *   含"顺航"              → 顺航检查单.json（独立一份，不含客运廊桥/桥载条目）
 *   含"客运"              → 客运航班视频监管重点.json
 *   含"货运"              → 货运航班视频监管重点.json
 *
 * id 全局唯一区间（store 据此批量生成逐项 setter）：
 *   客运 vCheckId1~38 / 货运 vCheckId39~82 / 顺航 vCheckId83~124
 * ============================================================
 */
import { PASSENGER_VIDEO_FOCUS } from "./passengerVideoFocus";
import { CARGO_VIDEO_FOCUS } from "./cargoVideoFocus";
import { SHUNHANG_VIDEO_FOCUS } from "./shunhangVideoFocus";

export { PASSENGER_VIDEO_FOCUS, CARGO_VIDEO_FOCUS, SHUNHANG_VIDEO_FOCUS };

/**
 * 按检查单 category 解析对应的视频监管重点数据（本地解析，无网络请求）
 * @param {string} category 检查单分类（如 "客运始发航班" / "货运过站航班" / "顺航检查单"）
 * @returns {Object|null} { id, category, checklistName, groups }；无匹配返回 null
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
