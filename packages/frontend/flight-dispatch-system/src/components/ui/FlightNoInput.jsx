import { cn } from "../../lib/utils";

/**
 * 公共组件：航班号输入框
 * ------------------------------------------------------------
 * 规则：强制大写英文 + 数字
 *   - 输入小写英文 → 自动转为大写展示（如 css8888 → CSS8888）
 *   - 中文 / 符号 / 空格等非法字符 → 输入时不显示（自动忽略）
 *
 * 用法（受控组件）：
 *   <FlightNoInput value={flightNo} onChange={setFlightNo} />
 *   <FlightNoInput value={f} onChange={setF} placeholder="如 CSS7387" className="..." />
 */
export default function FlightNoInput({ value, onChange, className, ...rest }) {
  return (
    <input
      className={cn("input w-full px-2.5 py-1.5 text-sm", className)}
      value={value}
      onChange={(e) => {
        // 转大写 + 仅保留 A-Z / 0-9（小写自动转大写，中文/符号自动忽略）
        const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        onChange(v);
      }}
      {...rest}
    />
  );
}
