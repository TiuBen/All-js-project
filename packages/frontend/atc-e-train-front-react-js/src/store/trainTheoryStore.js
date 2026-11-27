// src/store/trainTheoryStore.js - 理论培训树状态
// 树数据来源与分组骨架同 trainSimulatorStore：员工来自 PG，骨架在 trainTree.js 共用
import { create } from 'zustand';

// 分组构建函数与模式按钮配置沿用共用的 trainTree
export { buildTree, TREE_MODES, DEFAULT_YEARS } from './trainTree';

const useTrainTheoryStore = create((set) => ({
  mode: 'ym-user', // 树分组模式（按时间/按姓名）
  setMode: (mode) => set({ mode }),
  selectedId: null, // 当前选中的树节点 id
  select: (selectedId) => set({ selectedId }),
}));

export default useTrainTheoryStore;
