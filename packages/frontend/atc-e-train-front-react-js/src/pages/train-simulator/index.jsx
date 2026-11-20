// src/pages/train-simulator/index.jsx - 模拟机培训/考核：左侧树状（可切换分组）+ 右侧表单
// 树：年-月-用户 / 用户-年-月 两种分组一键切换，点击叶子记录右侧表单联动回填
import { useMemo } from 'react';
import useTrainSimulatorStore, { buildTree, TREE_MODES } from '../../store/trainSimulatorStore';
import TreeViewer from '../../components/TreeViewer';
import FormRow from '../../components/FormRow';
import Select from '../../components/Select';

// 表单选项
const CATEGORY_OPTIONS = ['岗前培训', '岗位培训', '岗位复训', '专项培训', '考核'];
const QUAL_OPTIONS = ['塔台管制', '进近管制', '区域管制', '飞行服务'];
const WEATHER_OPTIONS = ['简单气象', '复杂气象'];
const COMPLEXITY_OPTIONS = ['一般', '较复杂', '复杂'];

// 输入框统一风格
const inputCls =
  'w-56 h-9 px-3 rounded-md border border-gray-200 bg-white text-sm outline-none text-gray-800 hover:border-primary focus:border-primary transition-colors';
const readOnlyCls =
  'w-56 h-9 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-300 flex items-center';

export default function TrainSimulator() {
  const { records, mode, setMode, selectedId, select, updateRecord } = useTrainSimulatorStore();
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
          <span className="font-semibold text-gray-800 text-sm">
            {current ? current.formName : '模拟机培训/考核记录表'}
          </span>
          {current && (
            <span className="text-xs text-gray-400">
              {current.date} · {current.status === 'done' ? `已办 · 得分 ${current.score}` : '待办'}
            </span>
          )}
        </div>

        {current ? (
          <div className="py-2">
            <FormRow label="学员姓名">
              <input className={inputCls} value={current.student} onChange={(e) => patch('student')(e.target.value)} />
            </FormRow>
            <FormRow label="模拟机练习号">
              <input className={inputCls} value={current.exerciseNo} onChange={(e) => patch('exerciseNo')(e.target.value)} />
            </FormRow>
            <FormRow label="培训分类">
              <Select value={current.trainCategory} onChange={patch('trainCategory')} options={CATEGORY_OPTIONS} />
            </FormRow>
            <FormRow label="表单名称">
              <input className={inputCls} value={current.formName} onChange={(e) => patch('formName')(e.target.value)} />
            </FormRow>
            <FormRow label="资格类型">
              <Select value={current.qualType} onChange={patch('qualType')} options={QUAL_OPTIONS} />
            </FormRow>
            <FormRow label="扇区">
              <input className={inputCls} value={current.sector} onChange={(e) => patch('sector')(e.target.value)} />
            </FormRow>
            <FormRow label="天气">
              <Select value={current.weather} onChange={patch('weather')} options={WEATHER_OPTIONS} />
            </FormRow>
            <FormRow label="军航活动">
              <Select value={current.military} onChange={patch('military')} options={['无', '有']} />
            </FormRow>
            <FormRow label="指挥架次">
              <input type="number" className={inputCls} value={current.sorties} onChange={(e) => patch('sorties')(Number(e.target.value))} />
            </FormRow>
            <FormRow label="复杂程度">
              <Select value={current.complexity} onChange={patch('complexity')} options={COMPLEXITY_OPTIONS} />
            </FormRow>
            <FormRow label="教员姓名">
              <input className={inputCls} value={current.teacher} onChange={(e) => patch('teacher')(e.target.value)} />
            </FormRow>
            <FormRow label="开始时间">
              <input type="time" className={inputCls} value={current.startTime} onChange={(e) => patch('startTime')(e.target.value)} />
            </FormRow>
            <FormRow label="培训时长">
              <input className={inputCls} value={current.duration} onChange={(e) => patch('duration')(e.target.value)} />
            </FormRow>
            <FormRow label="最后得分" gray>
              <div className={readOnlyCls}>{current.score ?? '未评分'}</div>
            </FormRow>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-300">
            在左侧树中选择一条培训记录
          </div>
        )}
      </section>
    </div>
  );
}
