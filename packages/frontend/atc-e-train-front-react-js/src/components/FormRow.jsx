// src/components/FormRow.jsx - 通用表单行：左 label + 右控件，对齐小程序表单行样式
export default function FormRow({ label, children, hint, gray }) {
  return (
    <div className="flex items-center min-h-[56px] px-4 border-b border-gray-100 last:border-0">
      <label className={'w-40 shrink-0 text-sm ' + (gray ? 'text-gray-300' : 'text-gray-800')}>
        {label}
      </label>
      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">{children}</div>
      {hint && <div className="text-xs text-gray-400 ml-2">{hint}</div>}
    </div>
  );
}
