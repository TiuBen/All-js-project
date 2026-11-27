// src/store/simulatorCategoryStore.js - 模拟机培训目录树（真实目录，来自 PG simulator-category 表）
// 树结构：顶层 2025 年 / 2026 年（tree_type=YEAR 骨架）→ 12 个月（YEAR）→ 用户自建节点（CUSTOM）
// CRUD 走 simulatorCategoryApi，操作成功后重新拉树（树数据以后端为唯一事实源，不在前端维护副本）
import { create } from 'zustand';
import { CalendarDays, FileText } from 'lucide-react';
import { simulatorCategoryApi } from '../api';

// 后端嵌套树 → TreeViewer 节点：骨架（年/月）用日历图标，自建节点（CUSTOM）用文件图标
function buildNodes(nodes) {
  return nodes.map((c) => ({
    id: c.id,
    label: c.name,
    icon: c.tree_type === 'CUSTOM' ? FileText : CalendarDays,
    ...(c.children && c.children.length
      ? { meta: String(c.children.length), children: buildNodes(c.children) }
      : {}),
    data: c, // 原始目录数据（含 tree_type / parent_id）随 onSelect 抛回，右键菜单判定用
  }));
}

// 在后端原始树里按 id 找节点与其父节点（右键菜单判定「父是否为年份顶层」用）
function findWithParent(tree, id, parent = null) {
  for (const n of tree) {
    if (n.id === id) return { node: n, parent };
    const found = n.children && findWithParent(n.children, id, n);
    if (found) return found;
  }
  return null;
}

export { findWithParent };

const useSimulatorCategoryStore = create((set, get) => ({
  // ---------- state ----------
  tree: [], // 后端原始嵌套树
  nodes: [], // TreeViewer 节点
  selectedNode: null, // 当前选中的目录节点（整对象，右侧面板显示用）

  // ---------- actions ----------
  select: (selectedNode) => set({ selectedNode }),

  // 拉取目录树并转换成 TreeViewer 节点（所有写操作完成后都调它刷新）
  async loadCategories() {
    const tree = await simulatorCategoryApi.list();
    set({ tree, nodes: buildNodes(tree) });
  },

  // 新建子级：挂到 targetId 名下末尾
  async createChild(targetId, name) {
    await simulatorCategoryApi.create({ name, parent_id: targetId });
    await get().loadCategories();
  },

  // 新建同级：挂到 target 的父节点下（target 不能是年份/月份骨架）
  async createSibling(targetId, name) {
    const { node, parent } = findWithParent(get().tree, targetId) || {};
    if (!node || !parent) throw new Error('找不到父目录，无法新建同级');
    await simulatorCategoryApi.create({ name, parent_id: parent.id });
    await get().loadCategories();
  },

  // 重命名（仅 CUSTOM 节点）
  async rename(id, name) {
    await simulatorCategoryApi.update(id, { name });
    await get().loadCategories();
  },

  // 复制（含子树，副本插到原节点后面）
  async duplicate(id) {
    await simulatorCategoryApi.copy(id);
    await get().loadCategories();
  },

  // 删除（叶子 CUSTOM 节点）
  async remove(id) {
    await simulatorCategoryApi.remove(id);
    // 删的是当前选中节点 → 清掉选中，避免右侧面板挂着已删除的目录
    if (get().selectedNode?.id === id) set({ selectedNode: null });
    await get().loadCategories();
  },

  // 上移/下移（dir=-1/+1）：同父兄弟重排后，把 sort_order 变了的节点逐个 PUT
  async move(id, dir) {
    const found = findWithParent(get().tree, id);
    if (!found || !found.parent) return;
    const siblings = found.parent.children; // 已按后端排序返回
    const idx = siblings.findIndex((s) => s.id === id);
    const target = idx + dir;
    if (target < 0 || target >= siblings.length) return; // 边界，不该发生（菜单已置灰）

    // 计算新顺序并重编号 1..n
    const order = siblings.map((s) => s.id);
    [order[idx], order[target]] = [order[target], order[idx]];
    await Promise.all(
      order.map((nodeId, i) => {
        const orig = siblings.find((s) => s.id === nodeId);
        // 只 PUT 排序变化的节点，减少无效请求
        return orig.sort_order === i + 1
          ? null
          : simulatorCategoryApi.update(nodeId, { sort_order: i + 1 });
      }).filter(Boolean)
    );
    await get().loadCategories();
  },
}));

export default useSimulatorCategoryStore;
