// src/components/Tabs/index.jsx - 下划线式页签（对齐 shadcn/Radix Tabs 风格）
//
// 效果：
// - 页签横排，整条底部 1px 细分割线
// - 激活页签：深色加粗文字 + 底部 2px 蓝色下划线（压在分割线上）
// - 未激活页签：灰色文字，hover 加深
// - 受控组件：tabs/activeKey/onChange 由外部管理，onClose 不传则不显示关闭按钮
import { X } from 'lucide-react';

export default function Tabs({
  tabs = [],        // [{ key, label, icon?, closable? }]
  activeKey,        // 当前激活页签 key（受控）
  onChange,         // 切换页签 (key) => void
  onClose,          // 关闭页签 (key) => void，不传则不渲染关闭按钮
  className = '',
  contentClassName = '',
  children,         // 当前激活页签的内容
}) {
  return (
    <div className={'flex flex-col min-h-0 ' + className}>
      {/* ---------- 页签条 ---------- */}
      <div className="flex items-center gap-6 px-4 border-b border-gray-200 shrink-0">
        {tabs.map((t) => {
          const active = t.key === activeKey;
          const Icon = t.icon;
          return (
            <div
              key={t.key}
              onClick={() => onChange && onChange(t.key)}
              className={
                'relative flex items-center gap-1.5 py-2.5 cursor-pointer select-none text-sm transition-colors ' +
                (active
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-500 hover:text-gray-800')
              }
              title={t.label}
            >
              {Icon && (
                <Icon size={14} className={active ? 'shrink-0 text-primary' : 'shrink-0 text-gray-400'} />
              )}
              <span className="truncate">{t.label}</span>
              {onClose && t.closable !== false && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(t.key);
                  }}
                  className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X size={11} />
                </button>
              )}
              {/* 激活下划线：压在底部分割线上 */}
              {active && (
                <span className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-primary" />
              )}
            </div>
          );
        })}
      </div>
      {/* ---------- 内容区 ---------- */}
      <div className={'flex-1 min-h-0 bg-white ' + contentClassName}>{children}</div>
    </div>
  );
}
