import { useCallback, useEffect, useRef } from "react";

/**
 * ============================================================
 * useRegister —— 仿 react-hook-form 的 register()
 * ------------------------------------------------------------
 * 目标：**调用处只写一行 `{...register("time")}`**，
 *       看不到 value、看不到 ref、也不用手写 onChange。
 *
 *   <input type="datetime-local" {...register("time", { also: { auto: false } })} />
 *   <textarea {...register("note")} />
 *
 * 三个职责全部收进本 hook：
 *   1. 取值  由 DOM 自己持有（非受控）—— 不传 value
 *   2. 写入  register 内部接管 onChange，把值转交给 writeField
 *   3. 回填  外部改动（公式自动计算 / 记录·草稿回填）时把新值推回 DOM
 *
 * ★ 为什么还需要第 3 条（RHF 里对应 reset / setValue）
 *   本项目的 items 会被别人偷偷写：TimeFormulaEngine 自动算出的时间、
 *   hydrateFromRecord 回填的记录值。RHF 靠显式 setValue 处理这类情况，
 *   我们这里没有调用方，所以每次渲染后核对一次 DOM 与 store 是否一致
 *   （字段极少，代价可忽略），不一致才写回，用户正在输入时不会被打断。
 * ============================================================
 * @param {Object}   values     该表单当前的字段值（{ time, note }）
 * @param {Function} writeField (field, value) => void —— 落库用的写入函数
 * @returns {Function} register(field, opts?) → 直接展开到 input / textarea 上
 *   @param {string} field 字段名（= 元素的 name）
 *   @param {Object} [opts.also] 变更时一并写入的附加字段（如 { auto: false }）
 * ============================================================
 */
export default function useRegister(values, writeField) {
    const refs = useRef({}); // field → DOM 元素（RHF 的 _fields 精简版）

    // 外部值变化 → 推回 DOM。无依赖数组：每次渲染核对一遍，避免漏掉
    // "值没变但 DOM 被浏览器改过"这类情况；字段少，成本可忽略。
    useEffect(() => {
        for (const f in values) {
            const el = refs.current[f];
            const v = values[f] ?? "";
            if (el && el.value !== v) el.value = v;
        }
    });

    return useCallback(
        (field, opts = {}) => {
            const { also } = opts;
            return {
                name: field,
                // 只登记非空元素，避免 React 每次渲染 detach/attach 时出现中间空态
                ref: (el) => {
                    if (el) refs.current[field] = el;
                },
                // defaultValue 只在挂载时生效，之后的回填由上方的 effect 负责
                defaultValue: values[field] ?? "",
                onChange: (e) => {
                    writeField(field, e.target.value);
                    if (also) for (const k in also) writeField(k, also[k]);
                },
            };
        },
        // values 不进依赖：它每次渲染都是新对象，进来会让 register 引用失效；
        // 取值只发生在挂载那一刻（defaultValue），用首次闭包即可
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [writeField]
    );
}
