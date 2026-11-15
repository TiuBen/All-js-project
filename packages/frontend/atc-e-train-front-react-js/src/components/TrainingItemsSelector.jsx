// src/components/TrainingItemsSelector.jsx - 训练项目选择器（单选）
// 席位 radio（塔台/进近/区域/飞服/运行）+ 分组折叠 + 搜索 + 全选/全取消/确认
// 弹窗（表单里选模拟机练习号）与独立页（训练项目库）共用本组件
import { useMemo, useState } from 'react';
import useDictStore from '../store/dictStore';

export default function TrainingItemsSelector({
  selected = '',
  onConfirm,
  showActions = true,
  className = '',
}) {
  const trainingGroups = useDictStore((s) => s.trainingGroups);
  const positions = useDictStore((s) => s.formOptions?.positions || []);
  const [activePos, setActivePos] = useState('进近'); // 与原小程序一致默认进近
  const [keyword, setKeyword] = useState('');
  const [value, setValue] = useState(selected);
  const [closed, setClosed] = useState({}); // 分组折叠状态 { groupName: true }

  // 按当前席位 + 搜索词过滤条目
  const groups = useMemo(
    () =>
      trainingGroups
        .map((g) => ({
          ...g,
          items: g.items.filter(
            (it) =>
              it.positions.includes(activePos) &&
              (!keyword.trim() || it.name.includes(keyword.trim()))
          ),
        }))
        .filter((g) => g.items.length > 0),
    [trainingGroups, activePos, keyword]
  );

  // 全选：当前席位可见条目全部选中（多值拼接，回填练习号）
  const selectAll = () => {
    const names = groups.flatMap((g) => g.items.map((it) => it.name));
    if (names.length) setValue(names.join('、'));
  };

  const clearAll = () => setValue('');

  return (
    <div className={'flex flex-col gap-3 ' + className}>
      {/* 席位 radio 行 */}
      <div className="flex items-center gap-6 flex-wrap">
        {positions.map((p) => (
          <button
            key={p}
            onClick={() => setActivePos(p)}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className={
                'w-4 h-4 rounded-full border-2 transition-colors ' +
                (activePos === p ? 'border-[6px] border-primary' : 'border-gray-300')
              }
            />
            <span className={activePos === p ? 'text-primary font-medium' : 'text-gray-600'}>
              {p}
            </span>
          </button>
        ))}
      </div>

      {/* 操作按钮行 */}
      {showActions && (
        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="h-8 px-3 rounded border border-primary text-primary text-xs hover:bg-primary/5"
          >
            全选
          </button>
          <button
            onClick={clearAll}
            className="h-8 px-3 rounded border border-danger text-danger text-xs hover:bg-danger/5"
          >
            全取消
          </button>
          {onConfirm && (
            <button
              onClick={() => onConfirm(value)}
              className="ml-auto h-8 px-4 rounded bg-danger text-white text-xs hover:opacity-90"
            >
              确认
            </button>
          )}
        </div>
      )}

      {/* 搜索 */}
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="搜索训练项目"
        className="h-9 px-3 rounded-md border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
      />

      {/* 分组折叠列表 */}
      <div className="card divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {groups.map((g) => (
          <div key={g.name}>
            <button
              onClick={() => setClosed((c) => ({ ...c, [g.name]: !c[g.name] }))}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
            >
              {g.name}
              <span className={'text-gray-400 transition-transform ' + (closed[g.name] ? '' : 'rotate-180')}>
                ∨
              </span>
            </button>
            {!closed[g.name] &&
              g.items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setValue(it.name)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span
                    className={
                      'shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ' +
                      (value === it.name ? 'border-primary' : 'border-gray-300')
                    }
                  >
                    {value === it.name && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <span className="flex-1 text-sm leading-6">{it.name}</span>
                </button>
              ))}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-300">当前席位下暂无匹配的训练项目</div>
        )}
      </div>
    </div>
  );
}
