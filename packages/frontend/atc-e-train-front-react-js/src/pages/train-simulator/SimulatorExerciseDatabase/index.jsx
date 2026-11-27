// src/pages/train-simulator/SimulatorExerciseDatabase/index.jsx - 模拟机题库：左目录树 + 右内容
// 左树 = 模拟机培训目录树（TreeView.jsx，PG simulator-category 表：2025/2026 年 → 1 月-12 月）
// 右侧内容按选中节点切换：
//   叶子节点（无子节点）→ ExerciseEditor 练习说明（塔台模拟机练习说明表单）
//   有子节点的目录     → 占位提示
import TreeView from './TreeView';
import ExerciseEditor from './ExerciseEditor/ExerciseEditor';
import useSimulatorCategoryStore from '../../../store/simulatorCategoryStore';

export default function SimulatorExerciseDatabase() {
  const selectedNode = useSimulatorCategoryStore((s) => s.selectedNode);
  // 叶子节点 = 没有子节点（对应练习条目），展示练习说明编辑器；key 换节点时重置表单初始值
  const isLeaf = selectedNode && !(selectedNode.children && selectedNode.children.length);

  return (
    <div className="flex gap-2 h-full min-h-0">
      <TreeView />
      <section className="flex-1 min-w-0 card overflow-y-auto">
        {isLeaf ? (
          <ExerciseEditor key={selectedNode.id} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-base font-medium text-gray-300">
              {selectedNode ? selectedNode.name : '模拟机题库'}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
