// src/pages/train-simulator/SimulatorExerciseDatabase/TreeView.jsx - 模拟机培训树（左侧面板）
// card 包裹的 TreeViewer，数据来自 PG simulator-category 表（api → simulatorCategoryStore）
// 树结构：2025 年 / 2026 年 → 1 月 - 12 月（tree_type=YEAR 固定骨架）
//   → 用户自建节点（CUSTOM，可新建/上移下移/重命名/复制，见 ContextMenu.jsx）
import { useEffect } from 'react';
import TreeViewer from '../../../components/TreeViewer';
import useSimulatorCategoryStore from '../../../store/simulatorCategoryStore';
import ContextMenu from './ContextMenu';

export default function TreeView({ className = '' }) {
  const { nodes, selectedNode, select, loadCategories } = useSimulatorCategoryStore();

  // 挂载拉取目录树（2025/2026 年 → 12 个月）
  useEffect(() => {
    loadCategories().catch(() => {}); // 失败时左树为空，不打断页面
  }, []);

  return (
    <aside className={'w-64 shrink-0 card p-0 flex flex-col overflow-hidden ' + className}>
      <TreeViewer
        nodes={nodes}
        selectedId={selectedNode?.id}
        onSelect={select}
        className="flex-1"
        renderContextMenu={(node, close) => <ContextMenu node={node} onClose={close} />}
      />
    </aside>
  );
}
