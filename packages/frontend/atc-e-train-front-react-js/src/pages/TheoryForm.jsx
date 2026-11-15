// src/pages/TheoryForm.jsx - 快速填写理论培训
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import useDictStore from '../store/dictStore';
import useTaskStore from '../store/taskStore';
import FormRow from '../components/FormRow';
import Select from '../components/Select';

const EMPTY = {
  student: '',
  topic: '',
  form_name: '理论培训记录表',
  train_category: '理论培训',
  start_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  duration: '',
  teacher: '吴其奇',
};

export default function TheoryForm() {
  const nav = useNavigate();
  const { formOptions, loadDict } = useDictStore();
  const createTask = useTaskStore((s) => s.createTask);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDict().catch((e) => alert(e.message));
  }, []);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  async function handleSubmit() {
    if (!form.student) return alert('请选择学员姓名');
    if (!form.topic.trim()) return alert('请输入培训主题');
    setSubmitting(true);
    try {
      await createTask(form);
      alert('已生成待办任务');
      nav('/workbench');
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">快速填写理论培训</h1>
        <button onClick={() => nav(-1)} className="text-primary text-xl leading-none px-2">
          ⊗
        </button>
      </div>

      <div className="card">
        <FormRow label="学员姓名">
          <Select value={form.student} onChange={set('student')} options={formOptions?.students || []} />
        </FormRow>
        <FormRow label="培训主题">
          <input
            value={form.topic}
            onChange={(e) => set('topic')(e.target.value)}
            placeholder="请输入培训主题"
            className="w-72 h-9 px-3 rounded-md border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
          />
        </FormRow>
        <FormRow label="表单名称">
          <span className="text-sm text-gray-800">{form.form_name}</span>
        </FormRow>
        <FormRow label="开始时间">
          <span className="text-sm text-gray-500">{form.start_time}</span>
        </FormRow>
        <FormRow label="培训时长（小时）">
          <Select value={form.duration} onChange={set('duration')} options={formOptions?.durations || []} />
        </FormRow>
        <FormRow label="授课教员">
          <input
            value={form.teacher}
            onChange={(e) => set('teacher')(e.target.value)}
            className="w-56 h-9 px-3 rounded-md border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
          />
        </FormRow>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="h-11 px-8 rounded-md bg-success text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? '提交中…' : '提交（生成待办任务）'}
      </button>
    </div>
  );
}
