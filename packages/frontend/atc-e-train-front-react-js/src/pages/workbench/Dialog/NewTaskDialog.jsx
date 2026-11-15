// src/pages/workbench/Dialog/NewTaskDialog.jsx - 新建任务弹窗（HTML 原生 <dialog>）
// 对齐 Outlook「新建活动」dialog：顶部保存栏 + 添加标题 + 时间行 + 备注区
// 小元素在 ./components 下：FieldRow / TextInput / DateTimeRange
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Save, User, AlignLeft, X } from 'lucide-react';
import useDictStore from '../../../store/dictStore';
import useTaskStore from '../../../store/taskStore';
import FieldRow from './components/FieldRow';
import TextInput from './components/TextInput';
import DateTimeRange from './components/DateTimeRange';
import Select from '../../../components/Select';

export default function NewTaskDialog({ open, onClose }) {
  const dialogRef = useRef(null);
  const { formOptions, loadDict } = useDictStore();
  const createTask = useTaskStore((s) => s.createTask);

  const [title, setTitle] = useState('');
  const [student, setStudent] = useState('');
  const [remark, setRemark] = useState('');
  const [start, setStart] = useState(dayjs().format('YYYY-MM-DD') + 'T09:00');
  const [end, setEnd] = useState(dayjs().format('YYYY-MM-DD') + 'T09:30');
  const [submitting, setSubmitting] = useState(false);

  // open 变化驱动原生 showModal()/close()
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  // 首次挂载拉一次字典（学员下拉用）
  useEffect(() => {
    loadDict().catch(() => {});
  }, []);

  // Esc / 右上角 ⊗ 关闭时同步父组件状态
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e) => {
      e.preventDefault(); // 阻止原生自动关闭，统一走 onClose
      onClose && onClose();
    };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [onClose]);

  // 重置表单
  function reset() {
    setTitle('');
    setStudent('');
    setRemark('');
    setStart(dayjs().format('YYYY-MM-DD') + 'T09:00');
    setEnd(dayjs().format('YYYY-MM-DD') + 'T09:30');
  }

  async function handleSave() {
    // datetime-local 值转后端格式
    const startTime = dayjs(start).format('YYYY-MM-DD HH:mm:ss');
    const endTime = dayjs(end).format('YYYY-MM-DD HH:mm:ss');
    if (!start || !end || dayjs(end).isBefore(dayjs(start))) {
      alert('结束时间不能早于开始时间');
      return;
    }

    setSubmitting(true);
    try {
      await createTask({
        title: title.trim() || (student ? `${student}【新建任务】` : '新建任务'),
        student,
        form_name: '', // 不走培训记录表模板，标题已显式传入
        start_time: startTime,
        end_time: endTime,
      });
      reset();
      onClose && onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    // 原生 <dialog>：Esc 触发 cancel 事件，点击 backdrop 不自动关闭（保持 Outlook 行为）
    <dialog
      ref={dialogRef}
      className="w-[640px] max-w-[90vw] rounded-lg border border-gray-200 bg-white p-0 backdrop:bg-black/40 fixed inset-0 m-auto"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t-lg">
        <span className="text-sm font-semibold text-gray-700">新建任务</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex items-center gap-1.5 h-8 px-3 rounded bg-primary text-white text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save size={14} />
            {submitting ? '保存中…' : '保存'}
          </button>
          <button
            onClick={() => onClose && onClose()}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-1">
        {/* 添加标题 */}
        <TextInput
          icon={<AlignLeft size={16} />}
          value={title}
          onChange={setTitle}
          placeholder="添加标题"
        />

        {/* 学员姓名（可留空） */}
        <FieldRow icon={<User size={16} />}>
          <Select
            value={student}
            onChange={setStudent}
            options={formOptions?.students || []}
            placeholder="选择学员（可留空）"
          />
        </FieldRow>

        {/* 开始时间 - 结束时间 */}
        <DateTimeRange start={start} end={end} onStart={setStart} onEnd={setEnd} />

        {/* 备注 */}
        <div className="pt-2">
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="备注（可留空）"
            className="w-full h-28 p-3 rounded-md border border-gray-200 text-sm outline-none focus:border-primary transition-colors resize-none placeholder:text-gray-300"
          />
        </div>
      </div>
    </dialog>
  );
}
