// src/pages/TaskDetail.jsx - 待办任务详情：可编辑字段即时回写 + 下一步 / 删除
// 编号/开始时间灰字只读；结束时间/资格类型/教员姓名灰字（对齐小程序）
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskApi } from '../api';
import useDictStore from '../store/dictStore';
import useTaskStore from '../store/taskStore';
import FormRow from '../components/FormRow';
import Select from '../components/Select';

export default function TaskDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { formOptions, loadDict } = useDictStore();
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const [task, setTask] = useState(null);

  useEffect(() => {
    loadDict().catch(() => {});
    taskApi
      .detail(id)
      .then(setTask)
      .catch((e) => {
        alert(e.message);
        nav('/workbench');
      });
  }, [id]);

  // 弹层选择后立即回写本地 + 后端
  async function patch(key, value) {
    try {
      const updated = await updateTask(id, { [key]: value });
      setTask(updated);
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete() {
    if (!confirm('确认删除该待办任务吗？')) return;
    await deleteTask(id);
    nav('/workbench');
  }

  if (!task) return <div className="py-20 text-center text-sm text-gray-300">加载中…</div>;
  const fo = formOptions || {};

  // 可编辑下拉行
  const editableSelect = (label, key, options, gray = false) => (
    <FormRow label={label} gray={gray}>
      {gray ? (
        <span className="text-sm text-gray-300">{task[key] || '-'}</span>
      ) : (
        <Select
          value={task[key] || ''}
          onChange={(v) => patch(key, v)}
          options={options || []}
        />
      )}
    </FormRow>
  );

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">待办任务</h1>
        <button onClick={() => nav(-1)} className="text-primary text-xl leading-none px-2">
          ⊗
        </button>
      </div>

      <div className="card">
        {/* 编号灰字只读 */}
        <FormRow label="编号" gray>
          <span className="text-sm text-gray-300">{task.id}</span>
        </FormRow>
        {editableSelect('学员姓名', 'student', fo.students)}
        {editableSelect('培训分类', 'train_category', fo.trainCategories)}
        {editableSelect('岗位培训类别', 'post_train_type', fo.postTrainTypes)}
        {editableSelect('表单名称', 'form_name', fo.formNames)}
        <FormRow label="开始时间">
          <span className="text-sm text-gray-500">{task.start_time || '-'}</span>
        </FormRow>
        {/* 结束时间灰字只读（评分提交后自动写入） */}
        <FormRow label="结束时间" gray>
          <span className="text-sm text-gray-300">{task.end_time || '-'}</span>
        </FormRow>
        {editableSelect('资格类型', 'qual_type', fo.qualTypes, true)}
        {editableSelect('扇区', 'sector', fo.sectors)}
        {editableSelect('天气情况', 'weather', fo.weathers)}
        {editableSelect('军航活动情况', 'military', fo.militaryOptions)}
        <FormRow label="指挥架次">
          <input
            value={task.sorties || ''}
            onChange={(e) => setTask({ ...task, sorties: e.target.value })}
            onBlur={(e) => patch('sorties', e.target.value)}
            className="w-56 h-9 px-3 rounded-md border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
          />
        </FormRow>
        {editableSelect('复杂程度', 'complexity', fo.complexityLevels)}
        {/* 教员姓名灰字只读 */}
        <FormRow label="教员姓名" gray>
          <span className="text-sm text-gray-300">{task.teacher || '-'}</span>
        </FormRow>
      </div>

      <div className="flex flex-col gap-3 max-w-md">
        <button
          onClick={() => nav(`/tasks/${id}/score`)}
          className="h-11 rounded-md bg-primary text-white text-sm hover:opacity-90 transition-opacity"
        >
          下一步（进入评分）
        </button>
        <button
          onClick={handleDelete}
          className="h-11 rounded-md bg-danger text-white text-sm hover:opacity-90 transition-opacity"
        >
          删除
        </button>
      </div>
    </div>
  );
}
