// src/pages/train-simulator/SimulatorExamStudent/index.jsx - 受训记录：左树 + 右内容（待实现）
import TreePane from '../../../components/TreePane';
import useTrainSimulatorStore, { buildTree, TREE_MODES } from '../../../store/trainSimulatorStore';

export default function SimulatorExamStudent() {
  return (
    <div className="flex gap-2 h-full min-h-0">
      <TreePane store={useTrainSimulatorStore} buildTree={buildTree} modes={TREE_MODES} />
      <section className="flex-1 min-w-0 card flex items-center justify-center">
        <span className="text-base font-medium text-gray-300">受训记录</span>
      </section>
    </div>
  );
}
