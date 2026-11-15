// src/pages/Profile.jsx - 个人信息：用户卡片 + 月/年度报告入口
import useTaskStore from '../store/taskStore';

export default function Profile() {
  const stats = useTaskStore((s) => s.stats);

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold">个人信息</h1>

      {/* 用户卡片 */}
      <div className="card flex items-center gap-5 p-6">
        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
          吴
        </div>
        <div>
          <div className="text-lg font-bold">吴其奇</div>
          <div className="mt-1 text-sm text-gray-400">教员 · 模拟机培训中心</div>
        </div>
        <div className="ml-auto flex gap-6 text-center">
          <div>
            <div className="text-xl font-bold text-primary">{stats.todo}</div>
            <div className="text-xs text-gray-400 mt-1">待办任务</div>
          </div>
          <div>
            <div className="text-xl font-bold text-gray-700">{stats.done}</div>
            <div className="text-xs text-gray-400 mt-1">已办任务</div>
          </div>
        </div>
      </div>

      {/* 菜单 */}
      <div className="card divide-y divide-gray-100">
        <button
          onClick={() => alert('报告生成功能开发中')}
          className="w-full flex items-center justify-between px-5 py-4 text-sm hover:bg-gray-50 transition-colors"
        >
          生成月/年度报告
          <span className="text-gray-300">›</span>
        </button>
        <button
          onClick={() => alert('设置功能开发中')}
          className="w-full flex items-center justify-between px-5 py-4 text-sm hover:bg-gray-50 transition-colors"
        >
          设置
          <span className="text-gray-300">›</span>
        </button>
      </div>
    </div>
  );
}
