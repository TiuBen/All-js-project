// src/pages/train-theory/TheoryExerciseDatabase/index.jsx - 理论题库：左目录树 + 右题目分页列表
// 左树 = 真实目录树（PG theory-category：执照题库/地方题库 → 部分 → 大类），
// 不用 trainTheoryStore 的年-月-员工时间骨架——题库页的树维度是「目录」
// 右侧 = 题目分页列表（theory-db 表，导入的执照题库只读数据；选中目录含子目录）
import { useEffect } from 'react';
import TreeViewer from '../../../components/TreeViewer';
import useTheoryCategoryStore from '../../../store/theoryCategoryStore';
import ContextMenu from './ContextMenu';
import QuestionList from './QuestionList';

export default function TheoryExerciseDatabase() {
  const { nodes, selectedNode, select, loadCategories } = useTheoryCategoryStore();

  // 挂载拉取目录树（执照题库/地方题库 → 部分 → 大类）
  useEffect(() => {
    loadCategories().catch(() => {}); // 失败时左树为空，不打断页面
  }, []);

  return (
    <div className="flex gap-2 h-full min-h-0">
      <aside className="w-64 shrink-0 card p-0 flex flex-col overflow-hidden">
        <TreeViewer
          nodes={nodes}
          selectedId={selectedNode?.id}
          onSelect={select}
          className="flex-1"
          renderContextMenu={(node, close) => (
            <ContextMenu node={node} onClose={close} />
          )}
        />
      </aside>
      <section className="flex-1 min-w-0 card overflow-hidden">
        <QuestionList />
      </section>
    </div>
  );
}
