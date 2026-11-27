// src/pages/train-simulator/SimulatorSchedule/ScheduleDialog.jsx - 当日培训安排弹窗
// 原生 <dialog> + 原生 HTML5 Drag & Drop（不用任何第三方库）
// 四区（checkbox 与拖拽两种添加方式等效，均落到当日安排草稿）：
//   左栏练习（搜索 + checkbox）| 中栏当日安排（虚线区，自动构成带培文本）|
//   教员栏（2 列 checkbox）| 参训人员栏（4 列 checkbox，无头像圆圈）
//   虚线区文本：MM月DD日 XX1 XX2 N名教员带培 YY1 YY2 YY3 N名参训人员
//   前端不做人数/组合验证（后端负责），空缺部分显示淡灰占位
// 数据与勾选/拖拽回调全部来自父组件（index.jsx），本组件不持有安排数据
import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { X, Eraser, Search } from 'lucide-react';

// 拖拽负载类型（dataTransfer type 必须全小写）
const TYPE_EXERCISE = 'text/exercise';
const TYPE_INSTRUCTOR = 'text/instructor';
const TYPE_TRAINEE = 'text/trainee';

export default function ScheduleDialog({
  open,
  date, // 'YYYY-MM-DD'
  exercises, // [{ id, name }] 练习列表（题库目录树自建节点）
  instructors, // [{ id, name }] 教员列表（user.is_instructor）
  trainees, // [{ id, name }] 参训人员列表（非教员员工）
  draft, // 当天安排草稿 { exercises: [{id,name}], instructorIds: [], traineeIds: [] }
  onToggleExercise, // (exercise) => void  checkbox 勾选/取消
  onToggleInstructor, // (userId) => void
  onToggleTrainee, // (userId) => void
  onAddExercise, // (exercise) => void  拖拽添加（已存在则忽略，不做 toggle）
  onAddInstructor, // (userId) => void
  onAddTrainee, // (userId) => void
  onClear, // () => void  清空当天草稿
  onClose,
}) {
  const dialogRef = useRef(null);
  const [exKeyword, setExKeyword] = useState('');
  const [insKeyword, setInsKeyword] = useState('');
  const [userKeyword, setUserKeyword] = useState('');
  const [dropActive, setDropActive] = useState(false); // 虚线区拖拽悬停高亮

  // open 变化驱动原生 showModal()/close()
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // Esc / 原生 cancel 统一走 onClose
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e) => {
      e.preventDefault();
      onClose && onClose();
    };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // 打开时重置临时状态
  useEffect(() => {
    if (open) {
      setExKeyword('');
      setInsKeyword('');
      setUserKeyword('');
      setDropActive(false);
    }
  }, [open]);

  const pickedExIds = useMemo(() => new Set((draft.exercises || []).map((x) => x.id)), [draft]);
  const pickedInIds = useMemo(() => new Set(draft.instructorIds || []), [draft]);
  const pickedTrIds = useMemo(() => new Set(draft.traineeIds || []), [draft]);

  const filteredExercises = useMemo(
    () => exercises.filter((x) => x.name.includes(exKeyword.trim())),
    [exercises, exKeyword]
  );
  // 教员栏与参训栏各有独立搜索框
  const filteredInstructors = useMemo(
    () => instructors.filter((u) => u.name.includes(insKeyword.trim())),
    [instructors, insKeyword]
  );
  const filteredTrainees = useMemo(
    () => trainees.filter((u) => u.name.includes(userKeyword.trim())),
    [trainees, userKeyword]
  );

  // ---- 虚线区拖放：按负载类型分发到对应 add 回调（拖拽只添加，不 toggle）----
  const handleDrop = (e) => {
    e.preventDefault();
    setDropActive(false);
    const exId = e.dataTransfer.getData(TYPE_EXERCISE);
    if (exId) {
      const ex = exercises.find((x) => x.id === exId);
      if (ex && !pickedExIds.has(exId)) onAddExercise && onAddExercise(ex);
      return;
    }
    const insId = e.dataTransfer.getData(TYPE_INSTRUCTOR);
    if (insId) {
      if (!pickedInIds.has(insId)) onAddInstructor && onAddInstructor(insId);
      return;
    }
    const tid = e.dataTransfer.getData(TYPE_TRAINEE);
    if (tid && !pickedTrIds.has(tid)) onAddTrainee && onAddTrainee(tid);
  };

  // ---- 虚线区自动构成的带培文本 ----
  // 句式：MM月DD日 由 XX1 XX2 2名教员 使用 xxxx练习 带培 yy1 yy2 yy3 3名参训人员
  const d = date ? dayjs(date) : null;
  const instructorNames = (draft.instructorIds || []).map(
    (id) => instructors.find((u) => u.id === id)?.name || '未知'
  );
  const traineeNames = (draft.traineeIds || []).map(
    (id) => trainees.find((u) => u.id === id)?.name || '未知'
  );
  const exNames = (draft.exercises || []).map((x) => x.name);

  // 分段拼句（某段空缺时用淡灰占位文字占住位置，验证交给后端）
  const dateSeg = d ? `${d.month() + 1}月${d.date()}日` : '';
  const instructorSeg = instructorNames.length
    ? `由 ${instructorNames.join(' ')} ${instructorNames.length}名教员`
    : '由（未选教员）';
  const exerciseSeg = exNames.length
    ? `使用 ${exNames.join('、')}练习`
    : '使用（未选练习）';
  const traineeSeg = traineeNames.length
    ? `带培 ${traineeNames.join(' ')} ${traineeNames.length}名参训人员`
    : '带培（未选参训人员）';
  const hasAnything = exNames.length > 0 || instructorNames.length > 0 || traineeNames.length > 0;

  // checkbox 行通用样式：选中高亮浅蓝底
  const rowCls = (picked) =>
    'flex items-center gap-1.5 px-1.5 py-1 rounded text-xs cursor-pointer transition-colors ' +
    (picked ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50');
  const boxCls = 'shrink-0 w-3.5 h-3.5 accent-blue-600 cursor-pointer';

  return (
    <dialog
      ref={dialogRef}
      className="w-[1080px] max-w-[94vw] rounded-xl p-0 bg-white shadow-xl backdrop:bg-black/20"
    >
      <div className="flex flex-col">
        {/* ---------- 头部：日期标题 + 关闭 ---------- */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              {d ? `${d.month() + 1} 月 ${d.date()} 日` : ''} 培训安排
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              勾选或拖拽练习、教员、参训人员，当日安排自动生成
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ---------- 四区主体 ---------- */}
        <div className="grid grid-cols-[190px_1fr_170px_300px] h-[480px] divide-x divide-gray-100">
          {/* 左栏：练习（搜索 + checkbox，可拖拽） */}
          <div className="flex flex-col min-h-0 py-3">
            <div className="px-3 pb-2 flex items-center gap-1.5 border-b border-gray-100 mx-3">
              <Search size={13} className="text-gray-300 shrink-0" />
              <input
                value={exKeyword}
                onChange={(e) => setExKeyword(e.target.value)}
                placeholder="搜索练习"
                className="w-full text-xs py-1 outline-none placeholder:text-gray-300"
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-2 space-y-0.5">
              {filteredExercises.length === 0 && (
                <p className="px-2 text-xs text-gray-300 leading-5">
                  {exercises.length === 0
                    ? '暂无练习，请到「模拟机题库」右键月份节点新建'
                    : '无匹配练习'}
                </p>
              )}
              {filteredExercises.map((ex) => {
                const picked = pickedExIds.has(ex.id);
                return (
                  <label
                    key={ex.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData(TYPE_EXERCISE, ex.id)}
                    title="勾选，或拖到中间的当日安排"
                    className={rowCls(picked) + ' cursor-grab active:cursor-grabbing'}
                  >
                    <input
                      type="checkbox"
                      checked={picked}
                      onChange={() => onToggleExercise && onToggleExercise(ex)}
                      className={boxCls}
                    />
                    <span className="truncate">{ex.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 中栏：当日安排（虚线区，接收三种拖拽负载） */}
          <div className="flex flex-col min-h-0 py-3">
            <div className="px-4 pb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">当日安排</span>
              {hasAnything && (
                <button
                  onClick={onClear}
                  title="清空当天安排"
                  className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Eraser size={12} />
                  清空
                </button>
              )}
            </div>
            <div className="flex-1 min-h-0 px-3 pb-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!dropActive) setDropActive(true);
                }}
                onDragLeave={() => setDropActive(false)}
                onDrop={handleDrop}
                className={
                  'h-full rounded-lg border-2 border-dashed p-3 text-sm leading-7 transition-colors overflow-y-auto ' +
                  (dropActive
                    ? 'border-blue-400 bg-blue-50/60 text-gray-800'
                    : 'border-gray-200 text-gray-800')
                }
              >
                {!hasAnything ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-300 text-center px-4">
                    勾选或拖入练习、教员、参训人员
                    <br />
                    自动在此构成带培安排
                  </div>
                ) : (
                  /* 整句：MM月DD日 由 XX1 XX2 2名教员 使用 xxxx练习 带培 yy1 yy2 yy3 3名参训人员
                     各段分别渲染，空缺段显示淡灰占位 */
                  <p className="leading-8 text-gray-800 break-words">
                    <span className="font-medium">{dateSeg}</span>
                    <span
                      className={instructorNames.length ? 'text-blue-600' : 'text-gray-300'}
                    >
                      {' '}{instructorSeg}
                    </span>
                    <span className={exNames.length ? '' : 'text-gray-300'}>
                      {' '}{exerciseSeg}
                    </span>
                    <span
                      className={traineeNames.length ? 'text-green-600' : 'text-gray-300'}
                    >
                      {' '}{traineeSeg}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 教员栏：搜索框 + 2 列 checkbox，可拖拽 */}
          <div className="flex flex-col min-h-0 py-3">
            <div className="px-3 pb-2 flex items-center gap-1.5 border-b border-gray-100 mx-3">
              <Search size={13} className="text-gray-300 shrink-0" />
              <input
                value={insKeyword}
                onChange={(e) => setInsKeyword(e.target.value)}
                placeholder="搜索教员"
                className="w-full text-xs py-1 outline-none placeholder:text-gray-300"
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-1">
              <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
                {filteredInstructors.map((u) => {
                  const picked = pickedInIds.has(u.id);
                  return (
                    <label
                      key={u.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData(TYPE_INSTRUCTOR, u.id)}
                      title="勾选，或拖到中间的当日安排"
                      className={rowCls(picked) + ' cursor-grab active:cursor-grabbing'}
                    >
                      <input
                        type="checkbox"
                        checked={picked}
                        onChange={() => onToggleInstructor && onToggleInstructor(u.id)}
                        className={boxCls}
                      />
                      <span className="truncate">{u.name}</span>
                    </label>
                  );
                })}
              </div>
              {filteredInstructors.length === 0 && (
                <p className="px-2 text-xs text-gray-300">无匹配教员</p>
              )}
            </div>
          </div>

          {/* 参训人员栏：4 列 checkbox（无头像圆圈），可拖拽 */}
          <div className="flex flex-col min-h-0 py-3">
            <div className="px-3 pb-2 flex items-center gap-1.5 border-b border-gray-100 mx-3">
              <Search size={13} className="text-gray-300 shrink-0" />
              <input
                value={userKeyword}
                onChange={(e) => setUserKeyword(e.target.value)}
                placeholder="搜索人员"
                className="w-full text-xs py-1 outline-none placeholder:text-gray-300"
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-2 pt-1">
              <div className="grid grid-cols-4 gap-x-1 gap-y-0.5">
                {filteredTrainees.map((u) => {
                  const picked = pickedTrIds.has(u.id);
                  return (
                    <label
                      key={u.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData(TYPE_TRAINEE, u.id)}
                      title="勾选，或拖到中间的当日安排"
                      className={rowCls(picked) + ' cursor-grab active:cursor-grabbing'}
                    >
                      <input
                        type="checkbox"
                        checked={picked}
                        onChange={() => onToggleTrainee && onToggleTrainee(u.id)}
                        className={boxCls}
                      />
                      <span className="truncate">{u.name}</span>
                    </label>
                  );
                })}
              </div>
              {filteredTrainees.length === 0 && (
                <p className="px-2 text-xs text-gray-300">无匹配人员</p>
              )}
            </div>
          </div>
        </div>

        {/* ---------- 底部：完成 ---------- */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </dialog>
  );
}
