// src/pages/SimulatorForm.jsx - 快速填写模拟机培训/考核
// 对齐小程序：学员姓名 → 红字提示 → 练习号/分类/表单/扇区/天气/军航/架次/复杂度/教员 + 开始时间/培训时长
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import useDictStore from '../store/dictStore';
import useTaskStore from '../store/taskStore';
import FormRow from '../components/FormRow';
import Select from '../components/Select';
import TrainingItemsSelector from '../components/TrainingItemsSelector';

// 空表单：字段名与数据库列名一致（snake_case）
const EMPTY = {
  student: '',
  exercise_no: '',
  train_category: '',
  post_train_type: '资格培训',
  form_name: '',
  qual_type: '',
  sector: '',
  weather: '',
  military: '',
  sorties: '',
  complexity: '',
  teacher: '吴其奇',
  start_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  duration: '',
};

export default function SimulatorForm() {
  const nav = useNavigate();
  const { formOptions, loadDict } = useDictStore();
  const createTask = useTaskStore((s) => s.createTask);
  const [form, setForm] = useState(EMPTY);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDict().catch((e) => alert(e.message));
  }, []);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const fo = formOptions || {};

  async function handleSubmit() {
    if (!form.student) return alert('请选择学员姓名');
    if (!form.train_category) return alert('请选择培训分类');
    if (!form.form_name) return alert('请选择表单名称');
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
        <h1 className="text-xl font-bold text-primary">快速填写模拟机培训/考核</h1>
        <button onClick={() => nav(-1)} className="text-primary text-xl leading-none px-2">
          ⊗
        </button>
      </div>

      {/* 学员姓名 */}
      <div className="card">
        <FormRow label="学员姓名">
          <Select value={form.student} onChange={set('student')} options={fo.students || []} />
        </FormRow>
      </div>

      {/* 红字提示 */}
      <p className="text-danger text-sm leading-6 px-1">
        可通过选择培训分类筛选出对应适用范围的模拟机练习号
      </p>

      <div className="card">
        <FormRow label="模拟机练习号">
          <button
            onClick={() => setModalOpen(true)}
            className="w-56 h-9 px-3 rounded-md border border-gray-200 text-sm text-left truncate hover:border-primary transition-colors"
          >
            {form.exercise_no || <span className="text-gray-300">请选择</span>}
          </button>
        </FormRow>
        <FormRow label="培训分类">
          <Select value={form.train_category} onChange={set('train_category')} options={fo.trainCategories || []} />
        </FormRow>
        <FormRow label="表单名称">
          <Select value={form.form_name} onChange={set('form_name')} options={fo.formNames || []} />
        </FormRow>
        <FormRow label="资格类型">
          <Select value={form.qual_type} onChange={set('qual_type')} options={fo.qualTypes || []} />
        </FormRow>
        <FormRow label="扇区">
          <Select value={form.sector} onChange={set('sector')} options={fo.sectors || []} />
        </FormRow>
        <FormRow label="天气情况">
          <Select value={form.weather} onChange={set('weather')} options={fo.weathers || []} />
        </FormRow>
        <FormRow label="军航活动情况">
          <Select value={form.military} onChange={set('military')} options={fo.militaryOptions || []} />
        </FormRow>
        <FormRow label="指挥架次">
          <input
            value={form.sorties}
            onChange={(e) => set('sorties')(e.target.value)}
            placeholder="请输入指挥架次（数字）"
            className="w-56 h-9 px-3 rounded-md border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
          />
        </FormRow>
        <FormRow label="复杂程度">
          <Select value={form.complexity} onChange={set('complexity')} options={fo.complexityLevels || []} />
        </FormRow>
        <FormRow label="教员姓名">
          <input
            value={form.teacher}
            onChange={(e) => set('teacher')(e.target.value)}
            className="w-56 h-9 px-3 rounded-md border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
          />
        </FormRow>
      </div>

      <div className="card">
        <FormRow label="开始时间">
          <span className="text-sm text-gray-500">{form.start_time}</span>
        </FormRow>
        <FormRow label="培训时长（小时）">
          <Select value={form.duration} onChange={set('duration')} options={fo.durations || []} />
        </FormRow>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="h-11 px-8 rounded-md bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {submitting ? '提交中…' : '提交（生成待办任务）'}
      </button>

      {/* 训练项目选择弹窗（模拟机练习号） */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl w-full max-w-2xl p-5 space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">请选择模拟机练习号</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
                ⊗
              </button>
            </div>
            <TrainingItemsSelector
              selected={form.exercise_no}
              onConfirm={(v) => {
                set('exercise_no')(v);
                setModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
