// src/pages/train-library/index.jsx - 训练资料库：Chrome 风格页签（模拟机 / 理论 / 其他）
// 各页签内容暂留空，后续按需填充
import { useState } from 'react';
import { Plane, BookOpen, MoreHorizontal } from 'lucide-react';
import Tabs from '../../components/Tabs';

const TABS = [
  { key: 'simulator', label: '模拟机', icon: Plane },
  { key: 'theory', label: '理论', icon: BookOpen },
  { key: 'other', label: '其他', icon: MoreHorizontal },
];

export default function TrainLibrary() {
  const [active, setActive] = useState('simulator');

  return (
    <div className="h-full min-h-0 card p-0 overflow-hidden">
      <Tabs tabs={TABS} activeKey={active} onChange={setActive} className="h-full">
        {/* 各页签内容先留空 */}
        <div className="h-full" />
      </Tabs>
    </div>
  );
}
