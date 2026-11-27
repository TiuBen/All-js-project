// src/pages/train-theory/TheoryExamTeacher/index.jsx - 阅卷：左树 + 右内容（待实现）
import TreePane from '../../../components/TreePane';
import useTrainTheoryStore, { buildTree, TREE_MODES } from '../../../store/trainTheoryStore';

export default function TheoryExamTeacher() {
  return (
    <div className="flex gap-2 h-full min-h-0">
      <TreePane store={useTrainTheoryStore} buildTree={buildTree} modes={TREE_MODES} />
      <section className="flex-1 min-w-0 card flex items-center justify-center">
        <span className="text-base font-medium text-gray-300">阅卷</span>
      </section>
    </div>
  );
}
