// src/pages/TrainingItemsPage.jsx - 训练项目库（独立页）：浏览全部训练项目
// 与表单弹窗共用 TrainingItemsSelector，区别是这里纯浏览不需要"确认"按钮
import TrainingItemsSelector from '../components/TrainingItemsSelector';

export default function TrainingItemsPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold">训练项目库</h1>
      <p className="text-sm text-gray-400">
        按席位查看各分组训练项目；在「模拟机培训/考核」表单里选择模拟机练习号时会弹出同样的选择器
      </p>
      <TrainingItemsSelector showActions={false} className="card p-4 gap-4" />
    </div>
  );
}
