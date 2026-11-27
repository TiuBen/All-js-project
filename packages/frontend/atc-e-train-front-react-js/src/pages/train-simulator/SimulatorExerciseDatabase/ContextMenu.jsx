// src/pages/train-simulator/SimulatorExerciseDatabase/ContextMenu.jsx - 模拟机培训树右键菜单
// 操作（页面要求）：新建子级 / 新建同级 / 上移 / 下移 / 重命名 / 复制
//
// 权限规则（与后端 simulator-category 的 tree_type 对齐，前端置灰只是辅助）：
//   YEAR = 系统固定骨架：
//     - 年份顶层（2025/2026 年）：全部操作不可用（固定 2 个年份，不增不移不改）
//     - 月份（1-12 月）：仅「新建子级」可用 —— 练习条目挂在月份名下；
//       同级新建（= 加月份）/ 复制 / 移动 / 重命名全部置灰（12 个月骨架固定）
//   CUSTOM = 用户自建节点：六项操作全部可用（上移/下移按边界置灰）
// 数据与操作全部走 simulatorCategoryStore（→ /api/simulator-categories），无内存态
import { FolderPlus, FilePlus2, ArrowUp, ArrowDown, Pencil, CopyPlus } from 'lucide-react';
import useSimulatorCategoryStore, { findWithParent } from '../../../store/simulatorCategoryStore';

export default function ContextMenu({ node, onClose }) {
  const { tree, createChild, createSibling, rename, duplicate, move } =
    useSimulatorCategoryStore();

  const data = node.data || {};
  const isSkeleton = data.tree_type === 'YEAR'; // 年份/月份骨架
  const isYear = isSkeleton && !data.parent_id; // 年份顶层（完全只读）
  // 月份骨架：只开放「新建子级」（练习条目挂月份名下）
  const isMonth = isSkeleton && !isYear;

  // 同级兄弟（后端已排序），上移/下移的边界判定与换位依据
  const found = findWithParent(tree, node.id);
  const siblings = found?.parent?.children || [];
  const pos = siblings.findIndex((s) => s.id === node.id);

  const run = (fn) => {
    Promise.resolve()
      .then(fn)
      .catch((err) => {
        if (err?.message !== 'cancelled') alert(err.message || '操作失败');
      });
    onClose();
  };

  // ---- 新建子级：月份（练习条目）或自建节点可用 ----
  const addChild = () =>
    run(async () => {
      const name = window.prompt('新建子级：', '新建条目');
      if (!name) throw new Error('cancelled');
      await createChild(node.id, name);
    });

  // ---- 新建同级：仅自建节点可用（年份顶层/月份的兄弟都是固定骨架）----
  const addSibling = () =>
    run(async () => {
      const name = window.prompt('新建同级：', '新建条目');
      if (!name) throw new Error('cancelled');
      await createSibling(node.id, name);
    });

  // ---- 上移/下移：同父兄弟换位（后端逐节点 PUT sort_order）----
  const moveBy = (dir) =>
    run(() => move(node.id, dir));

  // ---- 重命名：仅自建节点 ----
  const doRename = () =>
    run(async () => {
      const name = window.prompt('重命名：', node.label);
      if (!name || name === node.label) throw new Error('cancelled');
      await rename(node.id, name);
    });

  // ---- 复制：仅自建节点（递归复制子树，副本插到原节点后面）----
  const doCopy = () => run(() => duplicate(node.id));

  // 菜单项通用样式（与理论题库右键菜单一致）
  const itemCls = (disabled) =>
    'flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm w-full text-left ' +
    (disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 cursor-pointer');

  const Item = ({ icon: Icon, label, disabled, onClick }) => (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={itemCls(disabled)}
    >
      <Icon size={13} className="shrink-0" />
      {label}
    </button>
  );

  // 六项操作的可用性：
  //   新建子级：月份（练习条目挂月份下）/ 自建节点
  //   新建同级 / 上移 / 下移 / 重命名 / 复制：仅自建节点
  const canAddChild = !isYear; // 月份 + 自建节点
  const canEdit = !isSkeleton; // 其余操作仅自建节点
  const atFirst = !canEdit || pos <= 0;
  const atLast = !canEdit || pos < 0 || pos >= siblings.length - 1;

  return (
    <div className="w-44 py-1 bg-white rounded-md shadow-lg border border-gray-200 select-none">
      {isYear && (
        <div className="px-3 py-1.5 text-xs text-gray-400 flex items-center gap-1.5">
          🔒 年份骨架 · 只读
        </div>
      )}
      <Item icon={FolderPlus} label="新建子级" disabled={!canAddChild} onClick={addChild} />
      <Item icon={FilePlus2} label="新建同级" disabled={!canEdit} onClick={addSibling} />
      <div className="my-1 border-t border-gray-100" />
      <Item icon={ArrowUp} label="上移" disabled={atFirst} onClick={() => moveBy(-1)} />
      <Item icon={ArrowDown} label="下移" disabled={atLast} onClick={() => moveBy(1)} />
      <div className="my-1 border-t border-gray-100" />
      <Item icon={Pencil} label="重命名" disabled={!canEdit} onClick={doRename} />
      <Item icon={CopyPlus} label="复制" disabled={!canEdit} onClick={doCopy} />
    </div>
  );
}
