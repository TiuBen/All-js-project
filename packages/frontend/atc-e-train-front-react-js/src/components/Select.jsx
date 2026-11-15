// src/components/Select.jsx - 后台风格下拉选择（原生 select + Tailwind 美化）
// options: [{ value, label }] 或字符串数组
export default function Select({ value, onChange, options, placeholder = '请选择', disabled }) {
  const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={
        'w-56 h-9 px-3 rounded-md border border-gray-200 bg-white text-sm outline-none transition-colors ' +
        (disabled
          ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
          : 'text-gray-800 hover:border-primary focus:border-primary')
      }
    >
      <option value="">{placeholder}</option>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
