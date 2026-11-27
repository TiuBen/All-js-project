// src/pages/train-simulator/SimulatorSchedule/SchduleStatus.jsx - 培训安排数据统计（占位）
// 简单统计卡：从 schedules（内存态安排记录）实时算出，后续接口化时逻辑不变
import { useMemo } from 'react';

const StatItem = ({ num, label }) => (
  <div className="py-3">
    <div className="text-2xl font-bold text-gray-800 leading-7">{num}</div>
    <div className="text-xs text-gray-400 mt-0.5">{label}</div>
  </div>
);

export default function SchduleStatus({ schedules = {}, exercises = [], users = [], className = '' }) {
  const stats = useMemo(() => {
    const drafts = Object.values(schedules).filter((d) => d);
    return {
      exerciseCount: exercises.length, // 可安排练习数
      userCount: users.length, // 员工总数
      dayCount: drafts.filter(
        (d) => (d.exercises || []).length || (d.instructorIds || []).length || (d.traineeIds || []).length
      ).length, // 已安排天数（草稿非空）
      traineeCount: new Set(drafts.flatMap((d) => d.traineeIds || [])).size, // 已排参训人员（去重）
    };
  }, [schedules, exercises, users]);

  return (
    <aside className={'card p-4 flex flex-col ' + className}>
      <div className="text-xs font-semibold text-gray-400 pb-2 border-b border-gray-100">
        数据统计
      </div>
      <div className="divide-y divide-gray-50">
        <StatItem num={stats.exerciseCount} label="可安排练习" />
        <StatItem num={stats.userCount} label="员工总数" />
        <StatItem num={stats.dayCount} label="已安排天数" />
        <StatItem num={stats.traineeCount} label="已排参训人员" />
      </div>
      <p className="mt-auto pt-3 text-[10px] text-gray-300 leading-4">
        点击左侧日历日期，在弹窗中勾选或拖拽完成排班
      </p>
    </aside>
  );
}
