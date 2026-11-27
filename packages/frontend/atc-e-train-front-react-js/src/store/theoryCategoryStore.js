// src/store/theoryCategoryStore.js - 理论题库目录树（真实目录，来自 PG theory-category 表）
// 树结构：顶层 执照题库/地方题库 → 部分 → 大类（叶子，题目将挂这里）
// 与 trainTheoryStore（年-月-员工时间骨架）相互独立——题库页的树维度是「目录」
import { create } from 'zustand';
import { Database } from 'lucide-react';
import { theoryCategoryApi } from '../api';

// 后端嵌套树 → TreeViewer 节点
// 顶层用 Database 图标（题库概念），中间层默认文件夹图标随开合切换，大类叶子默认 FileText
function buildNodes(nodes, depth = 0) {
  return nodes.map((c) => ({
    id: c.id,
    label: c.name,
    ...(depth === 0 ? { icon: Database } : {}),
    ...(c.children && c.children.length
      ? { meta: String(c.children.length), children: buildNodes(c.children, depth + 1) }
      : {}),
    data: c, // 原始目录数据随 onSelect 抛回
  }));
}

const useTheoryCategoryStore = create((set, get) => ({
  // ---------- state ----------
  tree: [], // 后端原始嵌套树
  nodes: [], // TreeViewer 节点
  selectedNode: null, // 当前选中的目录节点（整对象，右侧面板显示用）

  // ---------- actions ----------
  select: (selectedNode) => set({ selectedNode }),

  // 拉取目录树并转换成 TreeViewer 节点
  async loadCategories() {
    const tree = await theoryCategoryApi.list();
    set({ tree, nodes: buildNodes(tree) });
  },
}));

export default useTheoryCategoryStore;
