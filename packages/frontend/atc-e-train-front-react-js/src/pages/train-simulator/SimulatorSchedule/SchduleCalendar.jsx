// src/pages/train-simulator/SimulatorSchedule/SchduleCalendar.jsx - 培训安排月历
// 复用自研 Calendar 组件（full 月视图），把安排记录映射成每天的 chip：
//   每条安排一个 chip（练习名 + 人数），超过 2 条折叠为「还有 N 项」
// 点击任意日期 → onDayClick('YYYY-MM-DD')（父组件弹 ScheduleDialog）
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import Calendar from '../../../components/Calendar';

export default function SchduleCalendar({ schedules, onDayClick, className = '' }) {
  const [month, setMonth] = useState(dayjs().startOf('month'));
  const [selected, setSelected] = useState(null);

  // 安排记录 → Calendar events：每天每个练习一个 chip（教员数·参训数）
  // schedules: { 'YYYY-MM-DD': { exercises: [{id,name}], instructorIds, traineeIds } }
  const events = useMemo(
    () =>
      Object.entries(schedules || {}).flatMap(([date, draft]) => {
        const nIns = (draft?.instructorIds || []).length;
        const nTr = (draft?.traineeIds || []).length;
        return (draft?.exercises || []).map((ex) => ({
          date,
          label: `${ex.name}（教${nIns}·训${nTr}）`,
        }));
      }),
    [schedules]
  );

  return (
    <Calendar
      mode="full"
      month={month}
      onMonthChange={setMonth}
      selected={selected}
      onSelect={(d) => {
        setSelected(d);
        onDayClick && onDayClick(d.format('YYYY-MM-DD'));
      }}
      events={events}
      className={'w-full ' + className}
    />
  );
}
