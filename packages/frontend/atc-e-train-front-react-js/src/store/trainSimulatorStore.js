// src/store/trainSimulatorStore.js - 模拟机培训树状态
// 树数据不再是本地 fakedata：员工来自 PG user 表（TreePane 统一经 userStore 拉取），
// 分组骨架（年份 2025/2026、月份 1-12、按时间/按姓名两种模式）在 trainTree.js 里共用
//
// 练习说明与组名覆盖（右键菜单操作的数据，暂存内存态，刷新丢失）：
// - exercises: [{ id, userId, title }]，挂在用户节点下，树构建时注入叶子
// - labelOverrides: { [nodeId]: label }，「修改组名」覆盖显示（年/月骨架是固定数据，不改源）
// 后续接 simulator-exercise 表时，把这里的操作换成接口调用即可
import { create } from 'zustand';

// 分组构建函数与模式按钮配置沿用共用的 trainTree
export { buildTree, TREE_MODES, DEFAULT_YEARS } from './trainTree';

const useTrainSimulatorStore = create((set) => ({
  mode: 'ym-user', // 树分组模式（按时间/按姓名）
  setMode: (mode) => set({ mode }),
  selectedId: null, // 当前选中的树节点 id
  select: (selectedId) => set({ selectedId }),

  // ---------- 练习说明 ----------
  exercises: [], // [{ id, userId, title }]，挂在用户节点下

  // 新建练习说明（右键用户/练习说明节点）
  addExercise: (userId, title) =>
    set((s) => ({
      exercises: [...s.exercises, { id: crypto.randomUUID(), userId, title }],
    })),

  // 复制练习说明：副本插到原条目后面
  duplicateExercise: (id) =>
    set((s) => {
      const idx = s.exercises.findIndex((e) => e.id === id);
      if (idx < 0) return {};
      const copy = { ...s.exercises[idx], id: crypto.randomUUID(), title: `${s.exercises[idx].title} 副本` };
      const exercises = [...s.exercises];
      exercises.splice(idx + 1, 0, copy);
      return { exercises };
    }),

  // 上移/下移：同一用户名下换位（dir = -1 上移 / 1 下移）
  moveExercise: (id, dir) =>
    set((s) => {
      const cur = s.exercises.find((e) => e.id === id);
      if (!cur) return {};
      const sameIdx = s.exercises
        .map((e, i) => ({ e, i }))
        .filter((x) => x.e.userId === cur.userId);
      const pos = sameIdx.findIndex((x) => x.e.id === id);
      const to = pos + dir;
      if (to < 0 || to >= sameIdx.length) return {}; // 已在边界
      const exercises = [...s.exercises];
      [exercises[sameIdx[pos].i], exercises[sameIdx[to].i]] = [
        exercises[sameIdx[to].i],
        exercises[sameIdx[pos].i],
      ];
      return { exercises };
    }),

  // ---------- 修改组名 ----------
  labelOverrides: {}, // { [nodeId]: label }，buildTree 时覆盖显示
  renameNode: (nodeId, label) =>
    set((s) => ({ labelOverrides: { ...s.labelOverrides, [nodeId]: label } })),
}));

export default useTrainSimulatorStore;
