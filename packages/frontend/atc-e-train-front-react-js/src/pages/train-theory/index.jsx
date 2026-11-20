// src/pages/train-theory/index.jsx - 理论培训：左侧树状（可切换分组）+ 右侧表单
// 树：年-月-用户 / 用户-年-月 两种分组一键切换，点击叶子记录右侧表单联动回填
import { useMemo } from 'react';
import useTrainTheoryStore, { buildTree, TREE_MODES } from '../../store/trainTheoryStore';
import TreeViewer from '../../components/TreeViewer';
import FormRow from '../../components/FormRow';
import Select from '../../components/Select';

// 表单选项
const CATEGORY_OPTIONS = ['岗前培训', '岗位培训', '岗位复训', '专项培训', '考核'];
const RESULT_OPTIONS = ['合格', '不合格', '优秀'];

// 输入框统一风格
const inputCls =
  'w-56 h-9 px-3 rounded-md border border-gray-200 bg-white text-sm outline-none text-gray-800 hover:border-primary focus:border-primary transition-colors';
const areaCls =
  'w-56 min-h-20 px-3 py-2 rounded-md border border-gray-200 bg-white text-sm outline-none text-gray-800 hover:border-primary focus:border-primary transition-colors resize-y';

export default function TrainTheory() {
  const { records, mode, setMode, selectedId, select, updateRecord } = useTrainTheoryStore();
  const tree = useMemo(() => buildTree(records, mode), [records, mode]);
  const current = records.find((r) => r.id === selectedId) || null;

  // 选中记录的字段回写
  const patch = (k) => (v) => current && updateRecord(current.id, { [k]: v });

  return (
    <div className="flex gap-2 h-full min-h-0">
      {/* ---------- 左侧：树状视图 ---------- */}
      <aside className="w-64 shrink-0 card p-0 flex flex-col overflow-hidden">
        <TreeViewer
          nodes={tree}
          selectedId={selectedId}
          onSelect={(n) => select(n.id)}
          modes={TREE_MODES}
          mode={mode}
          onModeChange={setMode}
          className="flex-1"
        />
      </aside>

      {/* ---------- 右侧：card 表单 ---------- */}
      <section className="flex-1 min-w-0 card overflow-y-auto flex flex-col">
        <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-gray-100">
          <span className="font-semibold text-gray-800 text-sm">理论培训记录表</span>
          {current && (
            <span className="text-xs text-gray-400">
              {current.date} · {current.result}
            </span>
          )}
        </div>

        {current ? (
          <div className="py-2">
            <FormRow label="学员姓名">
              <input className={inputCls} value={current.student} onChange={(e) => patch('student')(e.target.value)} />
            </FormRow>
            <FormRow label="课程名称">
              <input className={inputCls} value={current.courseName} onChange={(e) => patch('courseName')(e.target.value)} />
            </FormRow>
            <FormRow label="培训分类">
              <Select value={current.category} onChange={patch('category')} options={CATEGORY_OPTIONS} />
            </FormRow>
            <FormRow label="授课教员">
              <input className={inputCls} value={current.teacher} onChange={(e) => patch('teacher')(e.target.value)} />
            </FormRow>
            <FormRow label="培训地点">
              <input className={inputCls} value={current.location} onChange={(e) => patch('location')(e.target.value)} />
            </FormRow>
            <FormRow label="培训日期">
              <input className={inputCls} value={current.date} onChange={(e) => patch('date')(e.target.value)} />
            </FormRow>
            <FormRow label="培训时长">
              <input className={inputCls} value={current.duration} onChange={(e) => patch('duration')(e.target.value)} />
            </FormRow>
            <FormRow label="考核结果">
              <Select value={current.result} onChange={patch('result')} options={RESULT_OPTIONS} />
            </FormRow>
            <FormRow label="备注">
              <textarea className={areaCls} value={current.remark} onChange={(e) => patch('remark')(e.target.value)} />
            </FormRow>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-300">
            在左侧树中选择一条理论培训记录
          </div>
        )}
      </section>
    </div>
  );
}
