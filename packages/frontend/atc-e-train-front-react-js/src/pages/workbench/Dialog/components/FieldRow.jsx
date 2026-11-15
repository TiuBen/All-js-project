// src/pages/workbench/Dialog/components/FieldRow.jsx - dialog 内的图标行
// 对齐 Outlook 新建活动里的行样式：左图标 + 内容区
export default function FieldRow({ icon, children, className = '' }) {
  return (
    <div className={'flex items-center gap-3 px-3 py-2.5 ' + className}>
      <span className="text-gray-400 shrink-0">{icon}</span>
      <div className="flex-1 min-w-0 flex items-center">{children}</div>
    </div>
  );
}
