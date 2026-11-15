// src/pages/workbench/Dialog/components/TextInput.jsx - dialog 内的行内文本输入
// 对齐 Outlook「添加标题」的下划线输入样式
export default function TextInput({ icon, value, onChange, placeholder, inputClassName = '' }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100">
      {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={
          'flex-1 h-9 border-b-2 border-primary outline-none text-sm placeholder:text-gray-300 ' +
          inputClassName
        }
      />
    </div>
  );
}
