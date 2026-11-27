// src/pages/train-simulator/SimulatorSchedule/index.jsx - 模拟机培训安排
// 布局：左侧 SchduleCalendar（月历主视图）+ 右栏 SchduleStatus（数据统计占位）
// 交互：点击日历某天 → 弹出 ScheduleDialog（原生 <dialog>），
//   在 Dialog 里勾选练习/教员/参训人员（checkbox）或拖拽添加（两种方式等效），
//   当日安排虚线区自动构成「MM月DD日 XX1 XX2 N名教员带培 YY1 YY2 YY3 N名参训人员」文本
// 数据获取集中在这里：
//   员工 → userStore（PG user 表，is_instructor 区分教员/参训人员）
//   练习 → simulatorCategoryStore（题库目录树里的 CUSTOM 自建节点）
//   安排记录 → 本地内存 state（{ 'YYYY-MM-DD': 安排草稿 }），后续接排班表时替换为接口读写
import { useEffect, useMemo, useState } from 'react';
import useUserStore from '../../../store/userStore';
import useSimulatorCategoryStore from '../../../store/simulatorCategoryStore';
import SchduleStatus from './SchduleStatus';
import SchduleCalendar from './SchduleCalendar';
import ScheduleDialog from './ScheduleDialog';

// 递归收集目录树里的自建节点（tree_type=CUSTOM）作为可安排的练习列表
function collectExercises(nodes, acc = []) {
  for (const n of nodes) {
    if (n.tree_type === 'CUSTOM') acc.push({ id: n.id, name: n.name });
    if (n.children) collectExercises(n.children, acc);
  }
  return acc;
}

// 一天的安排草稿：选中的练习 + 教员 + 参训人员（checkbox 勾选与拖拽都改这里）
const emptyDraft = () => ({ exercises: [], instructorIds: [], traineeIds: [] });

export default function SimulatorSchedule() {
  const { users, loadUsers } = useUserStore();
  const { tree, loadCategories } = useSimulatorCategoryStore();
  // 安排记录：日期 → 草稿 { exercises: [{id,name}], instructorIds: [], traineeIds: [] }
  // 内存态（刷新丢失），后续接排班表后改为 loadSchedules/saveSchedule
  const [schedules, setSchedules] = useState({});
  const [dialogDate, setDialogDate] = useState(null); // Dialog 打开的日期（'YYYY-MM-DD'，null = 关闭）

  // 挂载拉取员工与题库目录树（练习列表来源）
  useEffect(() => {
    loadUsers().catch(() => {});
    loadCategories().catch(() => {});
  }, []);

  const exercises = useMemo(() => collectExercises(tree), [tree]);
  // 教员/参训人员按 user.is_instructor 划分（同一人只出现在一栏）
  const instructors = useMemo(() => users.filter((u) => u.is_instructor), [users]);
  const trainees = useMemo(() => users.filter((u) => !u.is_instructor), [users]);

  // ---- Dialog 对某天草稿的增删（checkbox 勾选与拖拽共用，乐观更新内存态）----
  const updateDay = (date, updater) =>
    setSchedules((s) => ({ ...s, [date]: updater(s[date] || emptyDraft()) }));

  // 通用 toggle：已在草稿里则移除，否则加入（拖拽添加时目标已存在则忽略）
  const toggleInDraft = (date, key, entry, idOf) =>
    updateDay(date, (d) => {
      const list = d[key];
      const id = idOf(entry);
      const exists = list.some((x) => idOf(x) === id);
      return {
        ...d,
        [key]: exists ? list.filter((x) => idOf(x) !== id) : [...list, entry],
      };
    });

  const handleToggleExercise = (date, ex) =>
    toggleInDraft(date, 'exercises', ex, (x) => x.id);
  const handleToggleInstructor = (date, uid) =>
    toggleInDraft(date, 'instructorIds', uid, (x) => x);
  const handleToggleTrainee = (date, uid) =>
    toggleInDraft(date, 'traineeIds', uid, (x) => x);

  // 拖拽添加：只加入不做 toggle（目标已在草稿里则忽略）
  const addInDraft = (date, key, entry) =>
    updateDay(date, (d) =>
      d[key].some((x) => (key === 'exercises' ? x.id === entry.id : x === entry))
        ? d
        : { ...d, [key]: [...d[key], entry] }
    );

  const handleAddExercise = (date, ex) => addInDraft(date, 'exercises', ex);
  const handleAddInstructor = (date, uid) => addInDraft(date, 'instructorIds', uid);
  const handleAddTrainee = (date, uid) => addInDraft(date, 'traineeIds', uid);

  // 清空某天草稿（虚线区右上角清空按钮）
  const handleClearDay = (date) => setSchedules((s) => ({ ...s, [date]: emptyDraft() }));

  return (
    <div className="flex gap-2 h-full min-h-0">
      {/* 左侧：月历主视图，点击日期弹 Dialog */}
      <section className="flex-1 min-w-0 card p-0 overflow-hidden flex flex-col">
        <SchduleCalendar
          schedules={schedules}
          onDayClick={(date) => setDialogDate(date)}
          className="flex-1 min-h-0 p-3"
        />
      </section>

      {/* 右栏：数据统计（占位） */}
      <SchduleStatus schedules={schedules} exercises={exercises} users={users} className="w-56 shrink-0" />

      {/* 当日安排 Dialog：练习/教员/参训数据与勾选回调全部由 index 提供 */}
      <ScheduleDialog
        open={!!dialogDate}
        date={dialogDate}
        exercises={exercises}
        instructors={instructors}
        trainees={trainees}
        draft={dialogDate ? schedules[dialogDate] || emptyDraft() : emptyDraft()}
        onToggleExercise={(ex) => handleToggleExercise(dialogDate, ex)}
        onToggleInstructor={(uid) => handleToggleInstructor(dialogDate, uid)}
        onToggleTrainee={(uid) => handleToggleTrainee(dialogDate, uid)}
        onAddExercise={(ex) => handleAddExercise(dialogDate, ex)}
        onAddInstructor={(uid) => handleAddInstructor(dialogDate, uid)}
        onAddTrainee={(uid) => handleAddTrainee(dialogDate, uid)}
        onClear={() => handleClearDay(dialogDate)}
        onClose={() => setDialogDate(null)}
      />
    </div>
  );
}
