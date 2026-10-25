/**
 * ============================================================
 * cn —— className 拼接工具（clsx + tailwind-merge）
 * ------------------------------------------------------------
 * 作用：`cn("p-2", 条件 && "bg-red-500", props.className)`
 *   - clsx 负责「假值 / 条件 / 数组 / 对象」的拼接
 *   - twMerge 负责**后写的同类 Tailwind 类覆盖前面的**
 *     （`cn("p-2", "p-4")` → "p-4"，否则两个 padding 会打架、结果取决于 CSS 顺序）
 *
 * ★ 原文件是 lib/utils.js；`lib/` 与 `utils/` 已合并，只剩 `src/utils`。
 * ============================================================
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 className。
 * @param {...any} inputs className / 条件表达式 / 数组
 * @returns {string} 合并后的 className
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
