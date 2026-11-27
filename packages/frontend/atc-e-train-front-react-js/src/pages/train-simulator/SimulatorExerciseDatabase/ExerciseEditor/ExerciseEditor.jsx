// src/pages/train-simulator/SimulatorExerciseDatabase/ExerciseEditor/ExerciseEditor.jsx
// 塔台模拟机练习说明编辑器（按 exercise_editor.json 的数据结构定义渲染）
//
// 数据结构（exercise_editor.json，改 JSON 后需按新结构同步重写本组件）：
//   title            文档标题（居中）
//   fields[]         字段定义数组：
//     type: 'text' | 'number' | 'select' | 'textarea' | 'numberedSection'
//     layout: { row, labelCols, valueCols }   → 短字段按行分组、在 6 列网格里占格
//     fullWidth: true                          → 独占整行
//     indexStyle: { top: '、', child: 'paren' | 'parenClose' } → numberedSection 的编号样式
//       paren = （1）（2）；parenClose = 1) 2)；top 编号固定「N、」
//     value: text/number/select/textarea 为标量；numberedSection 为 [{ text, children: [...] }]
//
// 视觉：现代表单风格 —— label 上置小字灰色，输入框圆角细边框、聚焦蓝色；
//       numberedSection 用小方徽标显示编号，子条目缩进。不依赖任何表单库。
import { useState } from 'react';
import definition from './exercise_editor.json';

// 编号样式：numberedSection 顶层「N、」，子级按 indexStyle.child 生成
function childIndex(style, n) {
  if (style === 'parenClose') return `${n})`;
  return `(${n})`;
}

// 输入控件基础样式：圆角细边框，聚焦蓝色描边 + 淡蓝底（不发光、不抢眼）
const inputCls =
  'w-full bg-white border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-gray-800 ' +
  'outline-none transition-colors focus:border-blue-400 focus:bg-blue-50/50 placeholder:text-gray-300';
// label 上置小字
const labelCls = 'text-xs text-gray-400 mb-1';

export default function ExerciseEditor({ definition: def = definition }) {
  // 表单值全部本地 state（初始值来自 JSON 的 value；后续接接口时在此替换为接口数据）
  const [values, setValues] = useState(() => {
    const init = {};
    def.fields.forEach((f) => (init[f.key] = f.value));
    return init;
  });

  const setValue = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  // ---- 标量字段控件（text / number / select / textarea）----
  const scalarInput = (f, multiline) => {
    if (f.type === 'select') {
      return (
        <select
          className={inputCls + ' cursor-pointer'}
          value={values[f.key] ?? ''}
          onChange={(e) => setValue(f.key, e.target.value)}
        >
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    if (multiline) {
      return (
        <textarea
          rows={f.key === 'trainingContent' ? 2 : 1}
          className={inputCls + ' resize-y leading-relaxed'}
          value={values[f.key] ?? ''}
          onChange={(e) => setValue(f.key, e.target.value)}
        />
      );
    }
    return (
      <input
        type={f.type === 'number' ? 'number' : 'text'}
        className={inputCls}
        value={values[f.key] ?? ''}
        onChange={(e) => setValue(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    );
  };

  // ---- numberedSection：编号徽标 + 无边框输入，子条目缩进 ----
  const updateItem = (key, idx, patch) => {
    const arr = values[key].map((item, i) => (i === idx ? { ...item, ...patch } : item));
    setValue(key, arr);
  };
  const updateChild = (key, idx, cIdx, text) => {
    const children = values[key][idx].children.map((c, i) => (i === cIdx ? text : c));
    updateItem(key, idx, { children });
  };

  // 编号徽标：顶层小方徽标（浅灰底），子级纯文字编号（更轻）
  const badge = (text, top) =>
    top ? (
      <span className="shrink-0 mt-1 w-6 h-6 flex items-center justify-center rounded-md bg-gray-100 text-xs font-medium text-gray-500">
        {text}
      </span>
    ) : (
      <span className="shrink-0 mt-2 w-6 text-right text-xs text-gray-400 leading-6">{text}</span>
    );

  const borderlessInput = (value, onChange) => (
    <input
      className="w-full bg-transparent text-sm text-gray-800 leading-6 outline-none rounded-sm px-1 -ml-1 hover:bg-gray-50 focus:bg-blue-50/50 transition-colors"
      value={value}
      onChange={onChange}
    />
  );

  const numberedSection = (f) => {
    const items = values[f.key] || [];
    return (
      <div className="space-y-1">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-1.5">
            {badge(String(idx + 1), true)}
            <div className="flex-1 min-w-0">
              {borderlessInput(item.text, (e) => updateItem(f.key, idx, { text: e.target.value }))}
              {/* 子条目：编号 + 缩进输入 */}
              <div className="space-y-0.5 mt-0.5">
                {(item.children || []).map((c, cIdx) => (
                  <div key={cIdx} className="flex items-start gap-1.5 pl-2">
                    {badge(childIndex(f.indexStyle.child, cIdx + 1), false)}
                    <div className="flex-1 min-w-0">
                      {borderlessInput(c, (e) => updateChild(f.key, idx, cIdx, e.target.value))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ---- 单个字段格：label 上置 + 控件 ----
  const fieldCell = (f) => (
    <div key={f.key}>
      <div className={labelCls}>{f.label}</div>
      {f.type === 'numberedSection' ? numberedSection(f) : scalarInput(f, true)}
    </div>
  );

  // ---- 保存 / 删除（接口未建，先本地占位：保存提示、删除确认后还原初始值）----
  const handleSave = () => {
    // TODO: 接 simulator-exercise 接口后改为 PUT/POST values
    alert('保存成功（接口待接入，当前仅本地占位）');
  };
  const handleDelete = () => {
    // TODO: 接接口后改为 DELETE 当前练习说明
    if (!window.confirm('确定删除该练习说明的内容吗？')) return;
    const init = {};
    def.fields.forEach((f) => (init[f.key] = f.value));
    setValues(init);
  };

  // 短字段按 layout.row 分组成行（6 列网格保持 JSON 里的跨列布局）；fullWidth 按原顺序排后面
  const rows = {};
  const fullFields = [];
  def.fields.forEach((f) => {
    if (f.fullWidth) fullFields.push(f);
    else (rows[f.layout.row] = rows[f.layout.row] || []).push(f);
  });
  const rowKeys = Object.keys(rows).sort((a, b) => a - b);

  return (
    // 全宽布局：宽屏下信息一屏铺开，不做居中限宽
    <div className="h-full min-h-0 flex flex-col bg-white">
      {/* 标题区：标题居中，右侧 保存/删除 按钮 */}
      <div className="relative shrink-0 flex items-center justify-center px-4 py-2.5 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">{def.title}</h2>
        <div className="absolute right-4 flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-3.5 py-1.5 text-sm rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors cursor-pointer"
          >
            保存
          </button>
          <button
            onClick={handleDelete}
            className="px-3.5 py-1.5 text-sm rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            删除
          </button>
        </div>
      </div>

      {/* 表单体：全宽 + 紧凑纵向密度，宽屏下尽量一屏放下 */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3.5">
        {rowKeys.map((rk) => (
          <div key={rk} className="grid grid-cols-6 gap-3">
            {rows[rk].map((f) => (
              <div key={f.key} style={{ gridColumn: `span ${f.layout?.labelCols + f.layout?.valueCols ?? 1}` }}>
                {fieldCell(f)}
              </div>
            ))}
          </div>
        ))}

        {fullFields.map((f) => (
          <div key={f.key}>{fieldCell(f)}</div>
        ))}
      </div>
    </div>
  );
}
