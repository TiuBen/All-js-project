// src/pages/workbench/Dialog/components/DateTimeRange.jsx - 开始时间 - 结束时间
// 两个 datetime-local 输入框，中间用「-」连接（对齐 Outlook 的「9:00 - 9:30」行）
// 值为 'YYYY-MM-DDTHH:mm'（datetime-local 原生格式），对外回传原格式
import { Clock } from 'lucide-react';
import FieldRow from './FieldRow';

export default function DateTimeRange({ start, end, onStart, onEnd }) {
  return (
    <FieldRow icon={<Clock size={16} />}>
      <div className="flex items-center gap-2 w-full">
        <input
          type="datetime-local"
          value={start}
          onChange={(e) => onStart(e.target.value)}
          className="flex-1 h-8 px-2 rounded border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
        />
        <span className="text-gray-400">-</span>
        <input
          type="datetime-local"
          value={end}
          onChange={(e) => onEnd(e.target.value)}
          className="flex-1 h-8 px-2 rounded border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>
    </FieldRow>
  );
}
